/**
 * Centralized Account Balance Service
 * Provides single source of truth for all account balance data
 */

export class AccountBalanceService {
  private static instance: AccountBalanceService;
  private accountBalance: number = 0.00; // Authoritative balance - user has no money
  private buyingPower: number = 0.00;
  private totalEquity: number = 0.00;
  private lastUpdate: Date = new Date();
  
  private constructor() {}
  
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
  
  // Sync with Robinhood Legend client
  syncWithRobinhoodLegend(balance: number, buyingPower?: number): void {
    this.accountBalance = balance;
    this.buyingPower = buyingPower || balance * 0.95;
    this.totalEquity = balance;
    this.lastUpdate = new Date();
    console.log(`🔄 Synced with Robinhood Legend: $${balance.toFixed(2)}`);
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
}

// Export singleton instance
export const accountBalanceService = AccountBalanceService.getInstance();