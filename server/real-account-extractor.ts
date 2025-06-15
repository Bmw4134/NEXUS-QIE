/**
 * Real Account Data Extractor
 * Direct browser automation to extract actual account balances
 */

import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';

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
      // Try to connect to existing Edge browser instance
      const edgeProcess = await this.findEdgeBrowserProcess();
      
      if (edgeProcess) {
        console.log('🔍 Found active Edge browser process');
        // Try to connect to existing browser debugging port
        try {
          this.browser = await puppeteer.connect({
            browserURL: 'http://localhost:9222',
            defaultViewport: null
          });
          console.log('✅ Connected to existing Edge browser');
        } catch (error) {
          console.log('⚠️ Could not connect to existing browser, launching new instance');
          await this.launchNewBrowser();
        }
      } else {
        await this.launchNewBrowser();
      }
    } catch (error) {
      console.error('Browser initialization failed:', error);
      await this.launchNewBrowser();
    }
  }

  private async findEdgeBrowserProcess(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('pgrep -f "Microsoft Edge"');
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  private async launchNewBrowser() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--remote-debugging-port=9222',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--user-data-dir=/tmp/edge-profile'
      ],
      executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    });
  }

  async extractRealAccountData(): Promise<RealAccountData> {
    if (this.isExtracting) {
      throw new Error('Extraction already in progress');
    }

    this.isExtracting = true;
    console.log('🔍 Starting real account data extraction...');

    try {
      const [coinbaseData, robinhoodData] = await Promise.allSettled([
        this.extractCoinbaseData(),
        this.extractRobinhoodData()
      ]);

      const result: RealAccountData = {
        coinbase: coinbaseData.status === 'fulfilled' ? coinbaseData.value : {
          totalBalance: 0,
          availableBalance: 0,
          portfolioValue: 0,
          currency: 'USD',
          accounts: []
        },
        robinhood: robinhoodData.status === 'fulfilled' ? robinhoodData.value : {
          buyingPower: 0,
          totalEquity: 0,
          portfolioValue: 0,
          dayTradeCount: 0
        },
        extractionTime: new Date(),
        method: 'direct_browser_automation'
      };

      console.log('✅ Real account data extraction completed');
      console.log('💰 Coinbase Balance:', result.coinbase.totalBalance);
      console.log('💰 Robinhood Buying Power:', result.robinhood.buyingPower);

      return result;
    } finally {
      this.isExtracting = false;
    }
  }

  private async extractCoinbaseData(): Promise<any> {
    console.log('🔍 Extracting Coinbase account data...');
    
    const pages = await this.browser.pages();
    let coinbasePage = pages.find((page: any) => 
      page.url().includes('coinbase.com') || 
      page.url().includes('pro.coinbase.com')
    );

    if (!coinbasePage) {
      // Navigate to Coinbase if not already open
      coinbasePage = await this.browser.newPage();
      await coinbasePage.goto('https://www.coinbase.com/dashboard', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
    }

    await coinbasePage.waitForTimeout(3000);

    // Extract real balance data using multiple selectors
    const accountData = await coinbasePage.evaluate(() => {
      // Try multiple balance extraction methods
      const extractBalance = () => {
        // Method 1: Look for portfolio value
        let balanceElement = document.querySelector('[data-testid="portfolio-balance"]');
        if (balanceElement) {
          const text = balanceElement.textContent || '';
          const match = text.match(/\$?([\d,]+\.?\d*)/);
          if (match) return parseFloat(match[1].replace(/,/g, ''));
        }

        // Method 2: Look for total balance
        balanceElement = document.querySelector('[data-testid="total-balance"]');
        if (balanceElement) {
          const text = balanceElement.textContent || '';
          const match = text.match(/\$?([\d,]+\.?\d*)/);
          if (match) return parseFloat(match[1].replace(/,/g, ''));
        }

        // Method 3: Look for any element containing balance
        const balanceElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('$') && text.match(/\$\s*[\d,]+\.?\d*/);
        });

        if (balanceElements.length > 0) {
          const text = balanceElements[0].textContent || '';
          const match = text.match(/\$\s*([\d,]+\.?\d*)/);
          if (match) return parseFloat(match[1].replace(/,/g, ''));
        }

        // Method 4: Check page title or headers
        const titleElements = document.querySelectorAll('h1, h2, h3, .balance, .portfolio');
        for (const element of titleElements) {
          const text = element.textContent || '';
          const match = text.match(/\$\s*([\d,]+\.?\d*)/);
          if (match) return parseFloat(match[1].replace(/,/g, ''));
        }

        return 0;
      };

      const totalBalance = extractBalance();

      // Extract individual account data
      const accounts = [];
      const accountElements = document.querySelectorAll('[data-testid*="account"], .account-item, [class*="account"]');
      
      accountElements.forEach(element => {
        const nameEl = element.querySelector('[data-testid*="name"], .name, [class*="name"]');
        const balanceEl = element.querySelector('[data-testid*="balance"], .balance, [class*="balance"]');
        
        if (nameEl && balanceEl) {
          const name = nameEl.textContent?.trim() || '';
          const balanceText = balanceEl.textContent || '';
          const balanceMatch = balanceText.match(/\$?([\d,]+\.?\d*)/);
          
          if (balanceMatch) {
            accounts.push({
              name,
              balance: parseFloat(balanceMatch[1].replace(/,/g, '')),
              currency: 'USD'
            });
          }
        }
      });

      return {
        totalBalance,
        availableBalance: totalBalance,
        portfolioValue: totalBalance,
        currency: 'USD',
        accounts
      };
    });

    console.log('✅ Coinbase data extracted:', accountData);
    return accountData;
  }

  private async extractRobinhoodData(): Promise<any> {
    console.log('🔍 Extracting Robinhood account data...');
    
    const pages = await this.browser.pages();
    let robinhoodPage = pages.find((page: any) => 
      page.url().includes('robinhood.com')
    );

    if (!robinhoodPage) {
      // Navigate to Robinhood if not already open
      robinhoodPage = await this.browser.newPage();
      await robinhoodPage.goto('https://robinhood.com/account', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
    }

    await robinhoodPage.waitForTimeout(3000);

    // Extract real account data
    const accountData = await robinhoodPage.evaluate(() => {
      const extractValue = (selectors: string[]) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            const text = element.textContent || '';
            const match = text.match(/\$?([\d,]+\.?\d*)/);
            if (match) return parseFloat(match[1].replace(/,/g, ''));
          }
        }
        return 0;
      };

      // Extract buying power
      const buyingPowerSelectors = [
        '[data-testid="buying-power"]',
        '[data-testid="BuyingPower"]',
        '.buying-power',
        '[class*="buying-power"]',
        '[class*="BuyingPower"]'
      ];

      // Extract total equity
      const totalEquitySelectors = [
        '[data-testid="total-equity"]',
        '[data-testid="TotalEquity"]',
        '.total-equity',
        '[class*="total-equity"]',
        '[class*="portfolio-value"]'
      ];

      const buyingPower = extractValue(buyingPowerSelectors);
      const totalEquity = extractValue(totalEquitySelectors);

      return {
        buyingPower,
        totalEquity: totalEquity || buyingPower,
        portfolioValue: totalEquity || buyingPower,
        dayTradeCount: 0
      };
    });

    console.log('✅ Robinhood data extracted:', accountData);
    return accountData;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export const realAccountExtractor = new RealAccountExtractor();