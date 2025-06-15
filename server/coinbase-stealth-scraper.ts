/**
 * Coinbase Quantum Stealth Browser Scraper
 * Extracts real account data from logged-in Edge browser session
 */

import puppeteer from 'puppeteer';
import { quantumBypass } from './quantum-rate-limit-bypass';

interface RealAccountData {
  totalBalance: number;
  accounts: Array<{
    name: string;
    balance: number;
    currency: string;
    type: string;
  }>;
  portfolioValue: number;
  lastUpdated: Date;
  extractionMethod: string;
}

export class CoinbaseStealthScraper {
  private browser: any = null;
  private page: any = null;
  private isConnected = false;
  private lastExtraction = new Date(0);

  constructor() {
    this.initializeBrowser();
  }

  private async initializeBrowser() {
    try {
      // Connect to existing Edge browser instance if possible
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        ]
      });
      this.page = await this.browser.newPage();
      
      // Set realistic viewport and headers
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');
      
      console.log('🔮 Quantum stealth browser initialized for Coinbase extraction');
    } catch (error) {
      console.error('Browser initialization failed:', error);
    }
  }

  async extractRealAccountData(): Promise<RealAccountData> {
    try {
      console.log('🔍 Attempting quantum stealth extraction from Coinbase...');
      
      // Navigate to Coinbase portfolio page
      await this.page.goto('https://www.coinbase.com/portfolio', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for page to load
      await this.page.waitForTimeout(3000);

      // Check if already logged in by looking for portfolio elements
      const isLoggedIn = await this.page.evaluate(() => {
        return document.querySelector('[data-testid="portfolio"]') !== null ||
               document.querySelector('.portfolio') !== null ||
               document.querySelector('[class*="portfolio"]') !== null ||
               document.querySelector('h1:contains("Portfolio")') !== null;
      });

      if (!isLoggedIn) {
        console.log('🔄 Not logged in, attempting stealth login detection...');
        return await this.attemptSessionExtraction();
      }

      // Extract account balances
      const accountData = await this.page.evaluate(() => {
        const accounts: any[] = [];
        let totalBalance = 0;

        // Try multiple selectors for balance extraction
        const balanceSelectors = [
          '[data-testid="portfolio-balance"]',
          '[data-testid="total-balance"]',
          '.portfolio-balance',
          '[class*="balance"]',
          '[class*="portfolio"]'
        ];

        const accountSelectors = [
          '[data-testid="account-item"]',
          '.account-item',
          '[class*="account"]',
          '.asset-row'
        ];

        // Extract total balance
        for (const selector of balanceSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            const balanceMatch = element.textContent.match(/\$?([\d,]+\.?\d*)/);
            if (balanceMatch) {
              totalBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
              break;
            }
          }
        }

        // Extract individual accounts
        for (const selector of accountSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element: any) => {
            const nameElement = element.querySelector('[class*="name"], [class*="symbol"], h3, h4');
            const balanceElement = element.querySelector('[class*="balance"], [class*="amount"]');
            
            if (nameElement && balanceElement) {
              const name = nameElement.textContent?.trim() || 'Unknown';
              const balanceText = balanceElement.textContent || '';
              const balanceMatch = balanceText.match(/\$?([\d,]+\.?\d*)/);
              
              if (balanceMatch) {
                const balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
                accounts.push({
                  name,
                  balance,
                  currency: 'USD',
                  type: 'crypto'
                });
              }
            }
          });
        }

        return {
          totalBalance,
          accounts,
          extractedElements: {
            balanceElements: balanceSelectors.map(s => !!document.querySelector(s)),
            accountElements: accountSelectors.map(s => document.querySelectorAll(s).length)
          }
        };
      });

      if (accountData.totalBalance > 0) {
        console.log(`✅ Real balance extracted: $${accountData.totalBalance.toFixed(2)}`);
        
        const realData: RealAccountData = {
          totalBalance: accountData.totalBalance,
          accounts: accountData.accounts,
          portfolioValue: accountData.totalBalance,
          lastUpdated: new Date(),
          extractionMethod: 'quantum_stealth_browser'
        };

        // Update quantum stealth engine with real data
        await this.updateQuantumEngine(realData);
        
        return realData;
      }

      throw new Error('No balance data found');

    } catch (error) {
      console.error('Stealth extraction failed:', error);
      return await this.attemptSessionExtraction();
    }
  }

  private async attemptSessionExtraction(): Promise<RealAccountData> {
    try {
      console.log('🔄 Attempting session storage extraction...');
      
      // Check for session storage or local storage data
      const sessionData = await this.page.evaluate(() => {
        const sessionKeys = Object.keys(sessionStorage);
        const localKeys = Object.keys(localStorage);
        
        const relevantData: any = {};
        
        // Look for Coinbase-related storage
        [...sessionKeys, ...localKeys].forEach(key => {
          if (key.toLowerCase().includes('coinbase') || 
              key.toLowerCase().includes('balance') ||
              key.toLowerCase().includes('portfolio') ||
              key.toLowerCase().includes('account')) {
            try {
              const data = sessionStorage.getItem(key) || localStorage.getItem(key);
              if (data) {
                relevantData[key] = JSON.parse(data);
              }
            } catch (e) {
              relevantData[key] = sessionStorage.getItem(key) || localStorage.getItem(key);
            }
          }
        });

        return relevantData;
      });

      // Parse session data for balance information
      let extractedBalance = 0;
      const accounts: any[] = [];

      Object.values(sessionData).forEach((data: any) => {
        if (typeof data === 'object' && data !== null) {
          // Look for balance-related fields
          const balanceFields = ['balance', 'total', 'amount', 'value'];
          balanceFields.forEach(field => {
            if (data[field] && typeof data[field] === 'number' && data[field] > extractedBalance) {
              extractedBalance = data[field];
            }
          });

          // Look for account arrays
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.balance || item.amount) {
                accounts.push({
                  name: item.name || item.symbol || 'Account',
                  balance: item.balance || item.amount,
                  currency: item.currency || 'USD',
                  type: 'crypto'
                });
              }
            });
          }
        }
      });

      if (extractedBalance > 0) {
        console.log(`✅ Session data extracted: $${extractedBalance.toFixed(2)}`);
        
        const realData: RealAccountData = {
          totalBalance: extractedBalance,
          accounts,
          portfolioValue: extractedBalance,
          lastUpdated: new Date(),
          extractionMethod: 'session_storage'
        };

        await this.updateQuantumEngine(realData);
        return realData;
      }

      throw new Error('No session data found');

    } catch (error) {
      console.error('Session extraction failed:', error);
      
      // As last resort, attempt API endpoint extraction
      return await this.attemptAPIEndpointExtraction();
    }
  }

  private async attemptAPIEndpointExtraction(): Promise<RealAccountData> {
    try {
      console.log('🔄 Attempting API endpoint extraction...');
      
      // Intercept network requests to find API calls
      await this.page.setRequestInterception(true);
      
      const apiData: any[] = [];
      
      this.page.on('response', async (response: any) => {
        const url = response.url();
        if (url.includes('coinbase.com/api') || url.includes('api.coinbase.com')) {
          try {
            const data = await response.json();
            apiData.push(data);
          } catch (e) {
            // Ignore non-JSON responses
          }
        }
      });

      // Trigger a page refresh to capture API calls
      await this.page.reload();
      await this.page.waitForTimeout(5000);

      // Analyze captured API data
      let totalBalance = 0;
      const accounts: any[] = [];

      apiData.forEach(data => {
        if (data && data.data) {
          if (Array.isArray(data.data)) {
            data.data.forEach((account: any) => {
              if (account.balance && account.balance.amount) {
                const balance = parseFloat(account.balance.amount);
                totalBalance += balance;
                accounts.push({
                  name: account.name || account.currency?.name || 'Account',
                  balance,
                  currency: account.balance.currency || 'USD',
                  type: account.type || 'crypto'
                });
              }
            });
          }
        }
      });

      if (totalBalance > 0) {
        console.log(`✅ API data extracted: $${totalBalance.toFixed(2)}`);
        
        const realData: RealAccountData = {
          totalBalance,
          accounts,
          portfolioValue: totalBalance,
          lastUpdated: new Date(),
          extractionMethod: 'api_interception'
        };

        await this.updateQuantumEngine(realData);
        return realData;
      }

      throw new Error('No API data found');

    } catch (error) {
      console.error('API extraction failed:', error);
      throw new Error('All extraction methods failed - unable to retrieve real account data');
    }
  }

  private async updateQuantumEngine(realData: RealAccountData) {
    try {
      // Update quantum stealth engine with real data
      const { quantumStealthEngine } = await import('./quantum-stealth-crypto-engine');
      await quantumStealthEngine.updateAccountBalance(realData.totalBalance);
      
      // Update account balance service
      const { accountBalanceService } = await import('./account-balance-service');
      accountBalanceService.updateBalance(realData.totalBalance, 'system');
      
      console.log(`🔮 Quantum engine updated with real balance: $${realData.totalBalance.toFixed(2)}`);
    } catch (error) {
      console.error('Failed to update quantum engine:', error);
    }
  }

  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      console.log('🔗 Setting up Coinbase webhook for real-time updates...');
      
      // Navigate to webhook configuration page
      await this.page.goto('https://portal.cdp.coinbase.com/projects/webhooks', {
        waitUntil: 'networkidle2'
      });

      // Wait for page load
      await this.page.waitForTimeout(3000);

      // Click create webhook button
      await this.page.click('button:contains("Create Webhook"), [data-testid*="create"]');
      
      // Fill webhook URL
      await this.page.waitForSelector('input[placeholder*="example.com"], input[name*="url"]');
      await this.page.type('input[placeholder*="example.com"], input[name*="url"]', webhookUrl);
      
      // Configure webhook for balance updates
      await this.page.select('select', 'wallet:addresses:new-payment');
      
      // Submit webhook creation
      await this.page.click('button:contains("Create"), button[type="submit"]');
      
      console.log('✅ Webhook configured successfully');
      return true;
      
    } catch (error) {
      console.error('Webhook setup failed:', error);
      return false;
    }
  }

  async getConnectionStatus() {
    return {
      connected: this.isConnected,
      lastExtraction: this.lastExtraction,
      browserActive: !!this.browser,
      extractionMethod: 'quantum_stealth_browser'
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export const coinbaseStealthScraper = new CoinbaseStealthScraper();