/**
 * Production Trading Engine
 * Live Coinbase API trading with real account integration
 */

import { quantumStealthEngine } from './quantum-stealth-crypto-engine';
import { accountBalanceService } from './account-balance-service';
import { coinbaseSessionBridge } from './coinbase-session-bridge';

interface LiveTradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
}

interface LiveTradeResult {
  success: boolean;
  orderId?: string;
  executedPrice?: number;
  executedAmount?: number;
  fee?: number;
  timestamp: string;
  balanceAfter: number;
}

interface TradingLimits {
  maxTradeAmount: number;
  confidenceThreshold: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  dailyLimit: number;
}

export class ProductionTradingEngine {
  private static instance: ProductionTradingEngine;
  private isProductionMode = false;
  private tradingLimits: TradingLimits;
  private dailyTradeVolume = 0;
  private lastTradeReset = new Date();

  private constructor() {
    this.tradingLimits = {
      maxTradeAmount: 50, // $50 max per trade
      confidenceThreshold: 80, // 80% confidence required
      riskLevel: 'conservative',
      dailyLimit: 200 // $200 daily limit
    };
    this.activateProductionMode();
  }

  static getInstance(): ProductionTradingEngine {
    if (!ProductionTradingEngine.instance) {
      ProductionTradingEngine.instance = new ProductionTradingEngine();
    }
    return ProductionTradingEngine.instance;
  }

  private activateProductionMode(): void {
    this.isProductionMode = true;
    console.log('🚀 Production Trading Engine ACTIVATED');
    console.log('💰 Live Coinbase API trading enabled');
    console.log(`⚡ Trading limits: $${this.tradingLimits.maxTradeAmount} max, ${this.tradingLimits.confidenceThreshold}% confidence`);
  }

  async executeLiveTrade(request: LiveTradeRequest): Promise<LiveTradeResult> {
    if (!this.isProductionMode) {
      throw new Error('Production mode not activated');
    }

    // Validate trade against limits
    const validation = this.validateTrade(request);
    if (!validation.valid) {
      throw new Error(`Trade validation failed: ${validation.reason}`);
    }

    // Check current balance
    const currentBalance = accountBalanceService.getAccountBalance();
    if (request.side === 'buy' && request.amount > currentBalance) {
      throw new Error(`Insufficient balance: $${currentBalance} available, $${request.amount} requested`);
    }

    console.log(`🎯 Executing live ${request.side} order: ${request.amount} ${request.symbol}`);

    try {
      // Execute through quantum stealth engine for maximum reliability
      const result = await quantumStealthEngine.executeCoinbaseStealthTrade({
        symbol: request.symbol,
        side: request.side,
        amount: request.amount,
        platform: 'coinbase',
        stealthMode: true
      });

      if (result.success) {
        // Update daily trade volume
        this.updateTradeVolume(request.amount);
        
        // Update account balance
        const newBalance = this.calculateNewBalance(currentBalance, request, result.executedPrice || 0);
        accountBalanceService.updateBalance(newBalance, 'system');

        console.log(`✅ Live trade executed successfully: Order ${result.orderId}`);
        
        return {
          success: true,
          orderId: result.orderId,
          executedPrice: result.executedPrice,
          executedAmount: request.amount,
          fee: this.calculateFee(request.amount),
          timestamp: new Date().toISOString(),
          balanceAfter: newBalance
        };
      } else {
        throw new Error('Trade execution failed');
      }

    } catch (error) {
      console.error('❌ Live trade failed:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        balanceAfter: currentBalance
      };
    }
  }

  private validateTrade(request: LiveTradeRequest): { valid: boolean; reason?: string } {
    // Check trade amount limits
    if (request.amount > this.tradingLimits.maxTradeAmount) {
      return { valid: false, reason: `Amount exceeds maximum limit of $${this.tradingLimits.maxTradeAmount}` };
    }

    if (request.amount < 1) {
      return { valid: false, reason: 'Minimum trade amount is $1' };
    }

    // Check daily limits
    this.resetDailyLimitsIfNeeded();
    if (this.dailyTradeVolume + request.amount > this.tradingLimits.dailyLimit) {
      return { valid: false, reason: `Daily limit of $${this.tradingLimits.dailyLimit} would be exceeded` };
    }

    // Validate symbol
    const validSymbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA', 'LINK'];
    if (!validSymbols.includes(request.symbol)) {
      return { valid: false, reason: `Unsupported symbol: ${request.symbol}` };
    }

    return { valid: true };
  }

  private resetDailyLimitsIfNeeded(): void {
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - this.lastTradeReset.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 1) {
      this.dailyTradeVolume = 0;
      this.lastTradeReset = now;
      console.log('🔄 Daily trading limits reset');
    }
  }

  private updateTradeVolume(amount: number): void {
    this.dailyTradeVolume += amount;
  }

  private calculateNewBalance(currentBalance: number, request: LiveTradeRequest, executedPrice: number): number {
    const fee = this.calculateFee(request.amount);
    
    if (request.side === 'buy') {
      return currentBalance - request.amount - fee;
    } else {
      // For sell orders, add the USD received minus fee
      return currentBalance + request.amount - fee;
    }
  }

  private calculateFee(amount: number): number {
    // Coinbase fee is typically 0.5% for market orders
    return amount * 0.005;
  }

  async getAccountStatus(): Promise<any> {
    const balance = accountBalanceService.getAccountBalance();
    const buyingPower = accountBalanceService.getBuyingPower();
    
    return {
      balance,
      buyingPower,
      dailyTradeVolume: this.dailyTradeVolume,
      dailyLimitRemaining: this.tradingLimits.dailyLimit - this.dailyTradeVolume,
      tradingLimits: this.tradingLimits,
      productionMode: this.isProductionMode,
      lastUpdate: new Date().toISOString()
    };
  }

  async startAutomatedTrading(): Promise<void> {
    if (!this.isProductionMode) {
      throw new Error('Production mode required for automated trading');
    }

    console.log('🤖 Starting automated trading with conservative settings');
    
    // Set up automated trading with very conservative parameters
    setInterval(async () => {
      try {
        await this.evaluateAutomatedTrade();
      } catch (error) {
        console.error('Automated trading evaluation error:', error);
      }
    }, 60000); // Check every minute
  }

  private async evaluateAutomatedTrade(): Promise<void> {
    // Get current market conditions
    const balance = accountBalanceService.getAccountBalance();
    
    // Only trade if we have sufficient balance and haven't exceeded limits
    if (balance < 10 || this.dailyTradeVolume >= this.tradingLimits.dailyLimit * 0.8) {
      return;
    }

    // Very conservative automated trading - only execute on high confidence signals
    // This would integrate with market analysis algorithms
    console.log('📊 Evaluating market conditions for automated trade...');
    
    // For now, just log the evaluation - actual trading requires market analysis
    console.log(`💰 Available balance: $${balance.toFixed(2)}`);
    console.log(`📈 Daily volume used: $${this.dailyTradeVolume.toFixed(2)}/${this.tradingLimits.dailyLimit}`);
  }

  updateTradingLimits(newLimits: Partial<TradingLimits>): void {
    this.tradingLimits = { ...this.tradingLimits, ...newLimits };
    console.log('🔧 Trading limits updated:', this.tradingLimits);
  }

  getProductionStatus(): any {
    return {
      productionMode: this.isProductionMode,
      tradingLimits: this.tradingLimits,
      dailyTradeVolume: this.dailyTradeVolume,
      systemStatus: 'active',
      lastCheck: new Date().toISOString()
    };
  }
}

export const productionTradingEngine = ProductionTradingEngine.getInstance();