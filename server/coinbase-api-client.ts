/**
 * Coinbase Advanced Trade API Client
 * Direct integration with real Coinbase account data
 */

import { createHmac } from 'crypto';
import { accountBalanceService } from './account-balance-service';

interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  available_balance: {
    value: string;
    currency: string;
  };
  default: boolean;
}

interface CoinbasePortfolio {
  name: string;
  uuid: string;
  type: string;
  deleted: boolean;
}

export class CoinbaseAPIClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.coinbase.com/api/v3/brokerage';
  private isConnected = false;
  private lastBalance = 0;

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';
    
    if (this.apiKey && this.apiSecret) {
      this.initializeConnection();
    }
  }

  private async initializeConnection() {
    try {
      console.log('🔗 Initializing Coinbase API connection...');
      
      // Test the connection with a simple API call
      const portfolios = await this.getPortfolios();
      
      if (portfolios && portfolios.length > 0) {
        this.isConnected = true;
        console.log('✅ Coinbase API connected successfully');
        
        // Immediately fetch real balance
        await this.updateRealBalance();
        
        // Set up periodic balance updates
        this.startPeriodicUpdates();
      }
    } catch (error) {
      console.log('❌ Coinbase API connection failed, will retry when credentials are available');
      this.isConnected = false;
    }
  }

  private generateSignature(method: string, path: string, body: string, timestamp: string): string {
    const message = timestamp + method + path + body;
    return createHmac('sha256', this.apiSecret).update(message).digest('hex');
  }

  private async makeRequest(endpoint: string, method = 'GET', body?: any): Promise<any> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Coinbase API credentials not available');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/api/v3/brokerage${endpoint}`;
    const bodyString = body ? JSON.stringify(body) : '';
    
    const signature = this.generateSignature(method, path, bodyString, timestamp);

    const headers = {
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': '', // Leave empty for API keys created after Sept 2021
      'Content-Type': 'application/json',
      'User-Agent': 'nexus-trading-platform/1.0'
    };

    console.log('Making Coinbase API request to:', `${this.baseUrl}${endpoint}`);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? bodyString : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Coinbase API error: ${response.status} - ${errorText}`);
      throw new Error(`Coinbase API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async getPortfolios(): Promise<CoinbasePortfolio[]> {
    try {
      const response = await this.makeRequest('/portfolios');
      return response.portfolios || [];
    } catch (error) {
      console.log('Failed to fetch portfolios:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getAccounts(): Promise<CoinbaseAccount[]> {
    try {
      const response = await this.makeRequest('/accounts');
      return response.accounts || [];
    } catch (error) {
      console.log('Failed to fetch accounts:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  async getTotalBalance(): Promise<number> {
    try {
      const accounts = await this.getAccounts();
      let totalBalance = 0;

      for (const account of accounts) {
        const balance = parseFloat(account.available_balance.value);
        if (!isNaN(balance) && account.available_balance.currency === 'USD') {
          totalBalance += balance;
        }
      }

      return totalBalance;
    } catch (error) {
      console.log('Failed to calculate total balance:', error instanceof Error ? error.message : 'Unknown error');
      return 0;
    }
  }

  async updateRealBalance(): Promise<void> {
    try {
      const balance = await this.getTotalBalance();
      
      if (balance > 0) {
        this.lastBalance = balance;
        accountBalanceService.updateBalance(balance, 'system');
        console.log(`💰 Real Coinbase balance updated: $${balance.toFixed(2)}`);
      }
    } catch (error) {
      console.log('Balance update failed, will retry');
    }
  }

  private startPeriodicUpdates() {
    // Update balance every 30 seconds
    setInterval(async () => {
      if (this.isConnected) {
        await this.updateRealBalance();
      }
    }, 30000);
  }

  async refreshConnection(): Promise<boolean> {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';
    
    if (this.apiKey && this.apiSecret && !this.isConnected) {
      await this.initializeConnection();
    }
    
    return this.isConnected;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasCredentials: !!(this.apiKey && this.apiSecret),
      lastBalance: this.lastBalance,
      lastUpdate: new Date().toISOString()
    };
  }

  async getAccountSummary() {
    try {
      const accounts = await this.getAccounts();
      const portfolios = await this.getPortfolios();
      const totalBalance = await this.getTotalBalance();

      return {
        totalBalance,
        accountCount: accounts.length,
        portfolioCount: portfolios.length,
        accounts: accounts.map(account => ({
          name: account.name,
          currency: account.currency,
          balance: parseFloat(account.available_balance.value),
          isDefault: account.default
        })),
        isConnected: this.isConnected
      };
    } catch (error) {
      return {
        totalBalance: 0,
        accountCount: 0,
        portfolioCount: 0,
        accounts: [],
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const coinbaseAPIClient = new CoinbaseAPIClient();