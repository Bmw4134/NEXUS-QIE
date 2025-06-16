/**
 * NEXUS Alpaca Trading Engine
 * Live stock and crypto trading integration
 */

import { spawn } from 'child_process';
import path from 'path';

interface AlpacaTradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
}

interface AlpacaTradeResult {
  orderId: string;
  symbol: string;
  side: string;
  quantity: number;
  status: string;
  executedPrice?: number;
  timestamp: string;
  accountBalance: number;
}

interface AlpacaAccountInfo {
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  dayTradeCount: number;
  positions: AlpacaPosition[];
}

interface AlpacaPosition {
  symbol: string;
  quantity: number;
  marketValue: number;
  averageEntryPrice: number;
  unrealizedPnl: number;
  side: 'long' | 'short';
}

export class AlpacaTradeEngine {
  private isInitialized = false;
  private accountData: AlpacaAccountInfo | null = null;
  private lastUpdate = new Date();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('🔐 Initializing NEXUS Alpaca Trading Engine...');
    
    if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
      console.log('⚠️ Alpaca credentials not found - using simulation mode');
      this.initializeSimulationMode();
      return;
    }

    try {
      await this.authenticateAlpaca();
      this.isInitialized = true;
      console.log('✅ Alpaca live trading engine initialized');
    } catch (error) {
      console.error('❌ Alpaca authentication failed:', error);
      this.initializeSimulationMode();
    }
  }

  private async authenticateAlpaca(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import os
from alpaca.trading.client import TradingClient

try:
    client = TradingClient(
        api_key=os.getenv("ALPACA_API_KEY"),
        secret_key=os.getenv("ALPACA_SECRET_KEY"),
        paper=True  # Start with paper trading for safety
    )
    
    account = client.get_account()
    print(f"ALPACA_AUTH_SUCCESS:{account.cash}:{account.buying_power}:{account.portfolio_value}")
except Exception as e:
    print(f"ALPACA_AUTH_ERROR:{str(e)}")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript], {
        env: { ...process.env }
      });

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Alpaca auth error:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_AUTH_SUCCESS')) {
          const [, cash, buyingPower, portfolioValue] = output.split(':');
          this.accountData = {
            cash: parseFloat(cash),
            buyingPower: parseFloat(buyingPower),
            portfolioValue: parseFloat(portfolioValue),
            dayTradeCount: 0,
            positions: []
          };
          resolve();
        } else {
          reject(new Error('Alpaca authentication failed'));
        }
      });
    });
  }

  private initializeSimulationMode() {
    this.accountData = {
      cash: 25000.00,
      buyingPower: 50000.00,
      portfolioValue: 25000.00,
      dayTradeCount: 0,
      positions: []
    };
    this.isInitialized = true;
    console.log('📊 Alpaca simulation mode initialized');
  }

  async executeTrade(request: AlpacaTradeRequest): Promise<AlpacaTradeResult> {
    if (!this.isInitialized) {
      throw new Error('Alpaca trading engine not initialized');
    }

    console.log(`🎯 Executing Alpaca trade: ${request.side.toUpperCase()} ${request.quantity} ${request.symbol}`);

    if (!process.env.ALPACA_KEY || !process.env.ALPACA_SECRET) {
      return this.simulateTrade(request);
    }

    return this.executeLiveTrade(request);
  }

  private async executeLiveTrade(request: AlpacaTradeRequest): Promise<AlpacaTradeResult> {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import os
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
import json

try:
    client = TradingClient(
        api_key=os.getenv("ALPACA_KEY"),
        secret_key=os.getenv("ALPACA_SECRET"),
        paper=False
    )
    
    side = OrderSide.BUY if "${request.side}" == "buy" else OrderSide.SELL
    
    if "${request.orderType}" == "market":
        order_request = MarketOrderRequest(
            symbol="${request.symbol}",
            qty=${request.quantity},
            side=side,
            time_in_force=TimeInForce.DAY
        )
    else:
        order_request = LimitOrderRequest(
            symbol="${request.symbol}",
            qty=${request.quantity},
            side=side,
            time_in_force=TimeInForce.DAY,
            limit_price=${request.limitPrice || 0}
        )
    
    order = client.submit_order(order_request)
    account = client.get_account()
    
    result = {
        "orderId": str(order.id),
        "symbol": order.symbol,
        "side": str(order.side),
        "quantity": float(order.qty),
        "status": str(order.status),
        "timestamp": order.created_at.isoformat(),
        "accountBalance": float(account.cash)
    }
    
    print(f"ALPACA_TRADE_SUCCESS:{json.dumps(result)}")
    
except Exception as e:
    print(f"ALPACA_TRADE_ERROR:{str(e)}")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript], {
        env: { ...process.env }
      });

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_TRADE_SUCCESS')) {
          const jsonStr = output.split('ALPACA_TRADE_SUCCESS:')[1].trim();
          const result = JSON.parse(jsonStr);
          resolve(result);
        } else if (output.includes('ALPACA_TRADE_ERROR')) {
          const error = output.split('ALPACA_TRADE_ERROR:')[1].trim();
          reject(new Error(error));
        } else {
          reject(new Error('Unknown Alpaca trade error'));
        }
      });
    });
  }

  private simulateTrade(request: AlpacaTradeRequest): AlpacaTradeResult {
    const orderId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const executedPrice = this.getSimulatedPrice(request.symbol);
    const totalCost = request.quantity * executedPrice;
    
    if (request.side === 'buy' && this.accountData) {
      this.accountData.cash -= totalCost;
    } else if (request.side === 'sell' && this.accountData) {
      this.accountData.cash += totalCost;
    }

    return {
      orderId,
      symbol: request.symbol,
      side: request.side,
      quantity: request.quantity,
      status: 'filled',
      executedPrice,
      timestamp: new Date().toISOString(),
      accountBalance: this.accountData?.cash || 0
    };
  }

  private getSimulatedPrice(symbol: string): number {
    const prices: Record<string, number> = {
      'AAPL': 150.00,
      'TSLA': 200.00,
      'MSFT': 300.00,
      'NVDA': 400.00,
      'GOOGL': 2500.00,
      'AMZN': 3000.00,
      'SPY': 450.00,
      'QQQ': 350.00
    };
    
    const basePrice = prices[symbol] || 100.00;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return basePrice * (1 + variation);
  }

  async getAccountInfo(): Promise<AlpacaAccountInfo> {
    if (!this.isInitialized || !this.accountData) {
      throw new Error('Alpaca trading engine not initialized');
    }

    if (!process.env.ALPACA_KEY || !process.env.ALPACA_SECRET) {
      return this.accountData;
    }

    // Fetch live account data
    return new Promise((resolve, reject) => {
      const pythonScript = `
import os
from alpaca.trading.client import TradingClient
import json

try:
    client = TradingClient(
        api_key=os.getenv("ALPACA_KEY"),
        secret_key=os.getenv("ALPACA_SECRET"),
        paper=False
    )
    
    account = client.get_account()
    positions = client.get_all_positions()
    
    position_data = []
    for pos in positions:
        position_data.append({
            "symbol": pos.symbol,
            "quantity": float(pos.qty),
            "marketValue": float(pos.market_value),
            "averageEntryPrice": float(pos.avg_entry_price),
            "unrealizedPnl": float(pos.unrealized_pl),
            "side": "long" if float(pos.qty) > 0 else "short"
        })
    
    result = {
        "cash": float(account.cash),
        "buyingPower": float(account.buying_power),
        "portfolioValue": float(account.portfolio_value),
        "dayTradeCount": int(account.daytrade_count),
        "positions": position_data
    }
    
    print(f"ALPACA_ACCOUNT_SUCCESS:{json.dumps(result)}")
    
except Exception as e:
    print(f"ALPACA_ACCOUNT_ERROR:{str(e)}")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript], {
        env: { ...process.env }
      });

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_ACCOUNT_SUCCESS')) {
          const jsonStr = output.split('ALPACA_ACCOUNT_SUCCESS:')[1].trim();
          const result = JSON.parse(jsonStr);
          this.accountData = result;
          resolve(result);
        } else {
          resolve(this.accountData!);
        }
      });
    });
  }

  async getPositions(): Promise<AlpacaPosition[]> {
    const account = await this.getAccountInfo();
    return account.positions;
  }

  isLiveMode(): boolean {
    return !!(process.env.ALPACA_KEY && process.env.ALPACA_SECRET);
  }

  getConnectionStatus() {
    return {
      connected: this.isInitialized,
      liveMode: this.isLiveMode(),
      lastUpdate: this.lastUpdate,
      accountBalance: this.accountData?.cash || 0,
      buyingPower: this.accountData?.buyingPower || 0
    };
  }
}

export const alpacaTradeEngine = new AlpacaTradeEngine();