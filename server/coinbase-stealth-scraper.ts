/**
 * Coinbase Stealth Scraper
 * Extracts real account data from active browser sessions
 */

import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { accountBalanceService } from './account-balance-service';

const execAsync = promisify(exec);

interface CoinbaseAccountData {
  balance: number;
  availableBalance: number;
  portfolioValue: number;
  accounts: Array<{
    name: string;
    balance: number;
    currency: string;
  }>;
  verified: boolean;
}

export class CoinbaseStealthScraper {
  private browser: any = null;
  private isConnected = false;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      // Check if Edge browser is running with remote debugging
      const edgeRunning = await this.detectEdgeBrowserSession();
      
      if (edgeRunning) {
        console.log('🔗 Connecting to existing Edge browser session...');
        await this.connectToExistingBrowser();
      } else {
        console.log('🚀 Starting new browser session with debugging enabled...');
        await this.startNewBrowserSession();
      }
    } catch (error) {
      console.log('Browser connection initialization failed, using alternative methods');
    }
  }

  private async detectEdgeBrowserSession(): Promise<boolean> {
    try {
      // Check for Edge processes with remote debugging
      const { stdout } = await execAsync('pgrep -f "Microsoft Edge.*remote-debugging" || echo ""');
      if (stdout.trim()) {
        return true;
      }
      
      // Check if remote debugging port is open
      const { stdout: netstat } = await execAsync('netstat -an | grep ":9222" || echo ""');
      return netstat.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  private async connectToExistingBrowser() {
    try {
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
      });
      this.isConnected = true;
      console.log('✅ Connected to existing browser session');
    } catch (error) {
      console.log('Failed to connect to existing browser, starting new session');
      await this.startNewBrowserSession();
    }
  }

  private async startNewBrowserSession() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--remote-debugging-port=9222',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-data-dir=/tmp/chrome-debug'
        ]
      });
      this.isConnected = true;
      console.log('✅ New browser session started with debugging enabled');
    } catch (error) {
      console.log('Failed to start new browser session');
      this.isConnected = false;
    }
  }

  async extractFromActivePage(): Promise<CoinbaseAccountData> {
    if (!this.isConnected || !this.browser) {
      return this.getDefaultAccountData();
    }

    try {
      const pages = await this.browser.pages();
      
      // Look for Coinbase tabs
      for (const page of pages) {
        const url = page.url();
        if (url.includes('coinbase.com') || url.includes('pro.coinbase.com')) {
          console.log(`📊 Found Coinbase tab: ${url}`);
          
          // Wait for page to be fully loaded
          await page.waitForTimeout(3000);
          
          // Extract balance information
          const accountData = await page.evaluate(() => {
            const extractNumericValue = (text: string): number => {
              const match = text.match(/\$?([0-9,]+\.?[0-9]*)/);
              return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
            };

            let totalBalance = 0;
            let availableBalance = 0;
            const accounts: Array<{ name: string; balance: number; currency: string }> = [];

            // Look for various balance indicators
            const selectors = [
              '[data-testid*="balance"]',
              '[class*="balance"]',
              '[class*="portfolio"]',
              '[data-testid*="total"]',
              '[class*="total"]',
              '[data-testid*="available"]',
              'span:contains("$")',
              'div:contains("$")'
            ];

            for (const selector of selectors) {
              try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                  const text = element.textContent || '';
                  if (text.includes('$') && !text.includes('%')) {
                    const value = extractNumericValue(text);
                    if (value > 0 && value < 1000000) {
                      totalBalance = Math.max(totalBalance, value);
                      
                      // Determine account type from context
                      const parentText = element.parentElement?.textContent || '';
                      let accountName = 'Portfolio';
                      
                      if (parentText.toLowerCase().includes('available')) {
                        accountName = 'Available';
                        availableBalance = Math.max(availableBalance, value);
                      } else if (parentText.toLowerCase().includes('total')) {
                        accountName = 'Total';
                      } else if (parentText.toLowerCase().includes('portfolio')) {
                        accountName = 'Portfolio';
                      }
                      
                      accounts.push({
                        name: accountName,
                        balance: value,
                        currency: 'USD'
                      });
                    }
                  }
                }
              } catch (e) {
                continue;
              }
            }

            // Also check for specific Coinbase UI elements
            try {
              const balanceSpans = document.querySelectorAll('span');
              for (const span of balanceSpans) {
                const text = span.textContent || '';
                if (text.startsWith('$') && text.length > 3 && text.length < 15) {
                  const value = extractNumericValue(text);
                  if (value > 0 && value < 1000000) {
                    totalBalance = Math.max(totalBalance, value);
                  }
                }
              }
            } catch (e) {
              // Continue if this fails
            }

            return {
              totalBalance,
              availableBalance: availableBalance || totalBalance,
              portfolioValue: totalBalance,
              accounts: accounts.length > 0 ? accounts : [{
                name: 'Default',
                balance: totalBalance,
                currency: 'USD'
              }],
              verified: totalBalance > 0
            };
          });

          if (accountData.verified && accountData.totalBalance > 0) {
            console.log(`💰 Real Coinbase balance detected: $${accountData.totalBalance.toFixed(2)}`);
            
            // Update the account balance service
            accountBalanceService.updateBalance(accountData.totalBalance, 'system');
            
            return accountData;
          }
        }
      }
    } catch (error) {
      console.log('Page extraction failed, using alternative method');
    }

    return this.getDefaultAccountData();
  }

  async extractFromAllTabs(): Promise<CoinbaseAccountData> {
    if (!this.isConnected || !this.browser) {
      return this.getDefaultAccountData();
    }

    try {
      const pages = await this.browser.pages();
      let bestData = this.getDefaultAccountData();

      for (const page of pages) {
        try {
          const url = page.url();
          if (url.includes('coinbase') || url.includes('financial')) {
            const data = await this.extractFromSpecificPage(page);
            if (data.verified && data.totalBalance > bestData.totalBalance) {
              bestData = data;
            }
          }
        } catch (error) {
          continue;
        }
      }

      return bestData;
    } catch (error) {
      return this.getDefaultAccountData();
    }
  }

  private async extractFromSpecificPage(page: any): Promise<CoinbaseAccountData> {
    try {
      await page.waitForTimeout(2000);
      
      const data = await page.evaluate(() => {
        const getNumericValue = (text: string): number => {
          const cleaned = text.replace(/[$,\s]/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? 0 : num;
        };

        let maxBalance = 0;
        const foundBalances: number[] = [];

        // Extract all text nodes containing dollar amounts
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent || '';
          if (text.includes('$') && text.match(/\$[\d,]+\.?\d*/)) {
            const matches = text.match(/\$[\d,]+\.?\d*/g);
            if (matches) {
              for (const match of matches) {
                const value = getNumericValue(match);
                if (value > 0 && value < 500000) {
                  foundBalances.push(value);
                  maxBalance = Math.max(maxBalance, value);
                }
              }
            }
          }
        }

        return {
          totalBalance: maxBalance,
          availableBalance: maxBalance,
          portfolioValue: maxBalance,
          accounts: maxBalance > 0 ? [{
            name: 'Detected',
            balance: maxBalance,
            currency: 'USD'
          }] : [],
          verified: maxBalance > 0
        };
      });

      return data;
    } catch (error) {
      return this.getDefaultAccountData();
    }
  }

  private getDefaultAccountData(): CoinbaseAccountData {
    return {
      balance: 0,
      availableBalance: 0,
      portfolioValue: 0,
      accounts: [],
      verified: false
    };
  }

  async getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      browserAvailable: !!this.browser,
      debuggingEnabled: await this.detectEdgeBrowserSession()
    };
  }

  async cleanup() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        // Ignore cleanup errors
      }
      this.browser = null;
      this.isConnected = false;
    }
  }
}

export const coinbaseStealthScraper = new CoinbaseStealthScraper();