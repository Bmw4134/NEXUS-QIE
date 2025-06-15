/**
 * Real Account Data Extractor
 * Direct browser automation to extract actual account balances
 */

import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { accountBalanceService } from './account-balance-service';

const execAsync = promisify(exec);

interface RealAccountData {
  coinbase: {
    totalBalance: number;
    availableBalance: number;
    portfolioValue: number;
    currency: string;
    accounts: Array<{
      name: string;
      balance: number;
      currency: string;
    }>;
  };
  robinhood: {
    buyingPower: number;
    totalEquity: number;
    portfolioValue: number;
    dayTradeCount: number;
  };
  extractionTime: Date;
  method: string;
}

export class RealAccountExtractor {
  private browser: any = null;
  private isExtracting = false;

  constructor() {
    this.initializeBrowser();
  }

  private async initializeBrowser() {
    try {
      // Try to connect to existing browser first
      const edgeRunning = await this.findEdgeBrowserProcess();
      
      if (edgeRunning) {
        console.log('🔗 Connecting to existing Edge browser session...');
        // Connect to existing browser using remote debugging
        this.browser = await puppeteer.connect({
          browserURL: 'http://localhost:9222',
          defaultViewport: null
        });
      } else {
        console.log('🚀 Launching new browser instance...');
        await this.launchNewBrowser();
      }
    } catch (error) {
      console.log('Browser connection failed, using alternative extraction methods');
    }
  }

  private async findEdgeBrowserProcess(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('pgrep -f "Microsoft Edge" || echo ""');
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  private async launchNewBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--remote-debugging-port=9222',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    } catch (error) {
      console.log('Failed to launch browser');
    }
  }

  async extractRealAccountData(): Promise<RealAccountData> {
    if (this.isExtracting) {
      throw new Error('Extraction already in progress');
    }

    this.isExtracting = true;
    console.log('🔍 Extracting real account data from browser sessions...');

    try {
      const coinbaseData = await this.extractCoinbaseData();
      const robinhoodData = await this.extractRobinhoodData();

      const result: RealAccountData = {
        coinbase: coinbaseData,
        robinhood: robinhoodData,
        extractionTime: new Date(),
        method: 'browser_session_extraction'
      };

      // Update account balances with real data
      if (coinbaseData.totalBalance > 0) {
        accountBalanceService.updateBalance(coinbaseData.totalBalance, 'system');
        console.log(`💰 Real Coinbase balance detected: $${coinbaseData.totalBalance.toFixed(2)}`);
      }

      if (robinhoodData.buyingPower > 0) {
        accountBalanceService.syncWithRobinhoodLegend(
          robinhoodData.totalEquity,
          robinhoodData.buyingPower
        );
        console.log(`💰 Real Robinhood balance detected: $${robinhoodData.buyingPower.toFixed(2)}`);
      }

      return result;
    } finally {
      this.isExtracting = false;
    }
  }

  private async extractCoinbaseData(): Promise<any> {
    if (!this.browser) {
      return this.getDefaultCoinbaseData();
    }

    try {
      const pages = await this.browser.pages();
      
      // Look for Coinbase tabs
      for (const page of pages) {
        const url = page.url();
        if (url.includes('coinbase.com') || url.includes('pro.coinbase.com')) {
          console.log('📊 Found Coinbase tab, extracting data...');
          
          // Wait for page to load
          await page.waitForTimeout(2000);
          
          // Extract balance data from the page
          const balanceData = await page.evaluate(() => {
            const balanceElements = document.querySelectorAll('[data-testid*="balance"], [class*="balance"], [class*="portfolio"]');
            const accounts = [];
            let totalBalance = 0;

            for (const element of balanceElements) {
              const text = element.textContent || '';
              const match = text.match(/\$?([0-9,]+\.?[0-9]*)/);
              
              if (match) {
                const value = parseFloat(match[1].replace(/,/g, ''));
                if (value > 0 && value < 1000000) {
                  accounts.push({
                    name: 'Portfolio',
                    balance: value,
                    currency: 'USD'
                  });
                  totalBalance = Math.max(totalBalance, value);
                }
              }
            }

            return {
              totalBalance,
              availableBalance: totalBalance,
              portfolioValue: totalBalance,
              currency: 'USD',
              accounts
            };
          });

          if (balanceData.totalBalance > 0) {
            return balanceData;
          }
        }
      }
    } catch (error) {
      console.log('Coinbase extraction error, using alternative method');
    }

    return this.getDefaultCoinbaseData();
  }

  private async extractRobinhoodData(): Promise<any> {
    if (!this.browser) {
      return this.getDefaultRobinhoodData();
    }

    try {
      const pages = await this.browser.pages();
      
      // Look for Robinhood tabs
      for (const page of pages) {
        const url = page.url();
        if (url.includes('robinhood.com')) {
          console.log('📊 Found Robinhood tab, extracting data...');
          
          await page.waitForTimeout(2000);
          
          const balanceData = await page.evaluate(() => {
            const balanceElements = document.querySelectorAll('[data-testid*="buying"], [class*="buying"], [class*="equity"], [class*="portfolio"]');
            let buyingPower = 0;
            let totalEquity = 0;

            for (const element of balanceElements) {
              const text = element.textContent || '';
              const match = text.match(/\$?([0-9,]+\.?[0-9]*)/);
              
              if (match) {
                const value = parseFloat(match[1].replace(/,/g, ''));
                if (value > 0 && value < 100000) {
                  if (text.toLowerCase().includes('buying')) {
                    buyingPower = Math.max(buyingPower, value);
                  } else {
                    totalEquity = Math.max(totalEquity, value);
                  }
                }
              }
            }

            return {
              buyingPower,
              totalEquity: totalEquity || buyingPower,
              portfolioValue: totalEquity || buyingPower,
              dayTradeCount: 0
            };
          });

          if (balanceData.buyingPower > 0) {
            return balanceData;
          }
        }
      }
    } catch (error) {
      console.log('Robinhood extraction error, using alternative method');
    }

    return this.getDefaultRobinhoodData();
  }

  private getDefaultCoinbaseData() {
    return {
      totalBalance: 0,
      availableBalance: 0,
      portfolioValue: 0,
      currency: 'USD',
      accounts: []
    };
  }

  private getDefaultRobinhoodData() {
    return {
      buyingPower: 0,
      totalEquity: 0,
      portfolioValue: 0,
      dayTradeCount: 0
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const realAccountExtractor = new RealAccountExtractor();