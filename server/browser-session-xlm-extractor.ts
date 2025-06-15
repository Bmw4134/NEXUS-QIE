/**
 * Browser Session XLM Extractor
 * Direct extraction of XLM balances from active browser sessions
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { accountBalanceService } from './account-balance-service';

interface XLMBalance {
  xlm: number;
  usdValue: number;
  source: 'coinbase' | 'robinhood' | 'pionex';
  timestamp: Date;
  accountId?: string;
}

interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
}

export class BrowserSessionXLMExtractor {
  private browser: Browser | null = null;
  private xlmBalances: Map<string, XLMBalance> = new Map();

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
  }

  async extractXLMFromCoinbase(): Promise<XLMBalance | null> {
    console.log('🔍 Extracting XLM balance from Coinbase session...');
    
    try {
      await this.initialize();
      const page = await this.browser!.newPage();
      
      // Navigate to Coinbase portfolio
      await page.goto('https://coinbase.com/portfolio', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for login or assets to load
      await page.waitForTimeout(3000);

      // Check if user is logged in by looking for portfolio elements
      const isLoggedIn = await page.$('.asset-list, [data-testid="portfolio-table"], .portfolio-table');
      
      if (!isLoggedIn) {
        console.log('⚠️ Not logged into Coinbase or assets not loaded');
        return null;
      }

      // Extract XLM balance specifically
      const xlmBalance = await page.evaluate(() => {
        // Look for XLM/Stellar Lumens in various possible selectors
        const assetRows = document.querySelectorAll('[data-testid="portfolio-asset-row"], .asset-row, .portfolio-row');
        
        for (const row of assetRows) {
          const text = row.textContent?.toLowerCase() || '';
          
          if (text.includes('xlm') || text.includes('stellar') || text.includes('lumens')) {
            // Extract balance and USD value
            const balanceMatch = text.match(/([0-9,]+\.?[0-9]*)\s*xlm/i);
            const usdMatch = text.match(/\$([0-9,]+\.?[0-9]*)/);
            
            if (balanceMatch) {
              return {
                xlm: parseFloat(balanceMatch[1].replace(/,/g, '')),
                usdValue: usdMatch ? parseFloat(usdMatch[1].replace(/,/g, '')) : 0
              };
            }
          }
        }

        // Also check balance displays and crypto asset lists
        const balanceElements = document.querySelectorAll('.balance, .amount, .crypto-amount');
        for (const element of balanceElements) {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('xlm') && /[0-9]/.test(text)) {
            const balanceMatch = text.match(/([0-9,]+\.?[0-9]*)/);
            if (balanceMatch) {
              return {
                xlm: parseFloat(balanceMatch[1].replace(/,/g, '')),
                usdValue: 0
              };
            }
          }
        }

        return null;
      });

      await page.close();

      if (xlmBalance) {
        const result: XLMBalance = {
          xlm: xlmBalance.xlm,
          usdValue: xlmBalance.usdValue,
          source: 'coinbase',
          timestamp: new Date()
        };
        
        this.xlmBalances.set('coinbase', result);
        console.log(`✅ Found XLM balance: ${xlmBalance.xlm} XLM (~$${xlmBalance.usdValue})`);
        return result;
      } else {
        console.log('📊 No XLM holdings found in Coinbase account');
        return {
          xlm: 0,
          usdValue: 0,
          source: 'coinbase',
          timestamp: new Date()
        };
      }

    } catch (error) {
      console.error('Error extracting XLM from Coinbase:', error);
      return null;
    }
  }

  async extractXLMFromRobinhood(): Promise<XLMBalance | null> {
    console.log('🔍 Extracting XLM balance from Robinhood session...');
    
    try {
      await this.initialize();
      const page = await this.browser!.newPage();
      
      await page.goto('https://robinhood.com/crypto', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await page.waitForTimeout(3000);

      const xlmBalance = await page.evaluate(() => {
        const cryptoRows = document.querySelectorAll('[data-testid="crypto-holding"], .crypto-row, .crypto-position');
        
        for (const row of cryptoRows) {
          const text = row.textContent?.toLowerCase() || '';
          
          if (text.includes('xlm') || text.includes('stellar')) {
            const balanceMatch = text.match(/([0-9,]+\.?[0-9]*)\s*xlm/i);
            const usdMatch = text.match(/\$([0-9,]+\.?[0-9]*)/);
            
            if (balanceMatch) {
              return {
                xlm: parseFloat(balanceMatch[1].replace(/,/g, '')),
                usdValue: usdMatch ? parseFloat(usdMatch[1].replace(/,/g, '')) : 0
              };
            }
          }
        }
        return null;
      });

      await page.close();

      if (xlmBalance) {
        const result: XLMBalance = {
          xlm: xlmBalance.xlm,
          usdValue: xlmBalance.usdValue,
          source: 'robinhood',
          timestamp: new Date()
        };
        
        this.xlmBalances.set('robinhood', result);
        console.log(`✅ Found XLM balance on Robinhood: ${xlmBalance.xlm} XLM`);
        return result;
      } else {
        return {
          xlm: 0,
          usdValue: 0,
          source: 'robinhood',
          timestamp: new Date()
        };
      }

    } catch (error) {
      console.error('Error extracting XLM from Robinhood:', error);
      return null;
    }
  }

  async extractXLMFromPionex(): Promise<XLMBalance | null> {
    console.log('🔍 Extracting XLM balance from Pionex session...');
    
    try {
      await this.initialize();
      const page = await this.browser!.newPage();
      
      await page.goto('https://www.pionex.us/en-US/trade', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      await page.waitForTimeout(3000);

      const xlmBalance = await page.evaluate(() => {
        // Look for XLM in trading pairs or portfolio
        const elements = document.querySelectorAll('.balance-item, .asset-row, .coin-row');
        
        for (const element of elements) {
          const text = element.textContent?.toLowerCase() || '';
          
          if (text.includes('xlm') || text.includes('stellar')) {
            const balanceMatch = text.match(/([0-9,]+\.?[0-9]*)/);
            
            if (balanceMatch) {
              return {
                xlm: parseFloat(balanceMatch[1].replace(/,/g, '')),
                usdValue: 0
              };
            }
          }
        }
        return null;
      });

      await page.close();

      if (xlmBalance) {
        const result: XLMBalance = {
          xlm: xlmBalance.xlm,
          usdValue: xlmBalance.usdValue,
          source: 'pionex',
          timestamp: new Date()
        };
        
        this.xlmBalances.set('pionex', result);
        return result;
      } else {
        return {
          xlm: 0,
          usdValue: 0,
          source: 'pionex',
          timestamp: new Date()
        };
      }

    } catch (error) {
      console.error('Error extracting XLM from Pionex:', error);
      return null;
    }
  }

  async getAllXLMBalances(): Promise<XLMBalance[]> {
    console.log('🔍 Scanning all platforms for XLM holdings...');
    
    const results = await Promise.allSettled([
      this.extractXLMFromCoinbase(),
      this.extractXLMFromRobinhood(),
      this.extractXLMFromPionex()
    ]);

    const balances: XLMBalance[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        balances.push(result.value);
      }
    }

    return balances;
  }

  getTotalXLMBalance(): { xlm: number; usdValue: number } {
    let totalXLM = 0;
    let totalUSD = 0;

    for (const balance of this.xlmBalances.values()) {
      totalXLM += balance.xlm;
      totalUSD += balance.usdValue;
    }

    return { xlm: totalXLM, usdValue: totalUSD };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const browserXLMExtractor = new BrowserSessionXLMExtractor();