/**
 * Centralized Account Balance Service
 * Provides single source of truth for all account balance data
 */

import axios from 'axios';
import crypto from 'crypto';

interface CoinbaseAccount {
  id: string;
  name: string;
  primary: boolean;
  type: string;
  currency: {
    code: string;
    name: string;
  };
  balance: {
    amount: string;
    currency: string;
  };
  native_balance: {
    amount: string;
    currency: string;
  };
}

export class AccountBalanceService {
  private static instance: AccountBalanceService;
  private accountBalance: number = 0.00;
  private buyingPower: number = 0.00;
  private totalEquity: number = 0.00;
  private lastUpdate: Date = new Date();
  private coinbaseAccounts: CoinbaseAccount[] = [];
  private isUpdating: boolean = false;
  
  private constructor() {
    // Initialize with periodic balance updates using quantum stealth
    this.updateCoinbaseBalance();
    setInterval(() => this.updateCoinbaseBalance(), 60000); // Update every minute
  }
  
  static getInstance(): AccountBalanceService {
    if (!AccountBalanceService.instance) {
      AccountBalanceService.instance = new AccountBalanceService();
    }
    return AccountBalanceService.instance;
  }
  
  // Get current account balance
  getAccountBalance(): number {
    return this.accountBalance;
  }
  
  // Get buying power
  getBuyingPower(): number {
    return this.buyingPower;
  }
  
  // Get total equity
  getTotalEquity(): number {
    return this.totalEquity;
  }
  
  // Update account balance from authoritative source
  updateBalance(newBalance: number, source: 'robinhood' | 'alpaca' | 'system' = 'system'): void {
    console.log(`💰 Balance updated: $${newBalance.toFixed(2)} (source: ${source})`);
    this.accountBalance = newBalance;
    this.totalEquity = newBalance;
    this.buyingPower = newBalance * 0.95; // Assume 95% buying power
    this.lastUpdate = new Date();
  }
  
  // Sync with Robinhood Legend client (DISABLED FOR PRODUCTION)
  syncWithRobinhoodLegend(balance: number, buyingPower?: number): void {
    // PRODUCTION MODE: Only use real Coinbase balance, ignore Robinhood overrides
    console.log(`🚫 Robinhood sync disabled in production mode. Keeping real Coinbase balance: $${this.accountBalance.toFixed(2)}`);
    return;
  }
  
  // Get comprehensive account info
  getAccountInfo() {
    return {
      balance: this.accountBalance,
      buyingPower: this.buyingPower,
      totalEquity: this.totalEquity,
      lastUpdate: this.lastUpdate.toISOString(),
      formatted: {
        balance: `$${this.accountBalance.toLocaleString()}`,
        buyingPower: `$${this.buyingPower.toLocaleString()}`,
        totalEquity: `$${this.totalEquity.toLocaleString()}`
      }
    };
  }
  
  // Get balance for specific display contexts
  getDisplayBalance(context: 'trading' | 'dashboard' | 'api' = 'dashboard'): string {
    switch (context) {
      case 'trading':
        return this.buyingPower.toFixed(2);
      case 'api':
        return this.accountBalance.toString();
      case 'dashboard':
      default:
        return this.accountBalance.toLocaleString();
    }
  }
  
  // Check if balance data is fresh (within last 5 minutes)
  isDataFresh(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastUpdate > fiveMinutesAgo;
  }
  
  // Get balance age in minutes
  getDataAge(): number {
    return Math.floor((Date.now() - this.lastUpdate.getTime()) / (1000 * 60));
  }

  private async updateCoinbaseBalance(): Promise<void> {
    if (this.isUpdating) return;
    
    try {
      this.isUpdating = true;
      
      // Import quantum stealth engine
      const { quantumStealthEngine } = await import('./quantum-stealth-crypto-engine');
      const accounts = await quantumStealthEngine.fetchStealthBalances();
      
      if (accounts && accounts.length > 0) {
        this.coinbaseAccounts = accounts;
        
        // Calculate total USD balance from all accounts
        let totalUSD = 0;
        accounts.forEach((account: any) => {
          if (account.native_balance && account.native_balance.currency === 'USD') {
            totalUSD += parseFloat(account.native_balance.amount) || 0;
          }
        });
        
        // Update balances with real Coinbase data
        this.accountBalance = totalUSD;
        this.buyingPower = totalUSD;
        this.totalEquity = totalUSD;
        this.lastUpdate = new Date();
        
        console.log(`💰 Quantum stealth balance sync: $${totalUSD.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Quantum stealth balance sync failed:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  private async fetchCoinbaseAccounts(): Promise<CoinbaseAccount[]> {
    const apiKeyId = process.env.CB_API_KEY_NAME;
    const privateKey = process.env.CB_API_PRIVATE_KEY;
    
    if (!apiKeyId || !privateKey) {
      console.log('Coinbase API credentials not configured');
      return [];
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const method = 'GET';
      const path = '/v2/accounts';
      const body = '';
      
      // Create signature for Coinbase API
      const message = timestamp + method + path + body;
      const signature = crypto.createHmac('sha256', privateKey).update(message).digest('hex');
      
      const response = await axios.get(`https://api.coinbase.com${path}`, {
        headers: {
          'CB-ACCESS-KEY': apiKeyId,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp.toString(),
          'CB-VERSION': '2023-01-01'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Coinbase API error:', error);
      return [];
    }
  }

  getCoinbaseAccounts(): CoinbaseAccount[] {
    return this.coinbaseAccounts;
  }

  async refreshBalance(): Promise<void> {
    await this.updateCoinbaseBalance();
  }
}

// Export singleton instance
export const accountBalanceService = AccountBalanceService.getInstance();