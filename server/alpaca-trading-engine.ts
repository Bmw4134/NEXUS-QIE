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

    if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
      return this.simulateTrade(request);
    }

    return this.executeLiveTrade(request);
  }

  async executeCryptoTrade(request: AlpacaTradeRequest): Promise<AlpacaTradeResult> {
    if (!this.isInitialized) {
      throw new Error('Alpaca trading engine not initialized');
    }

    // Validate crypto symbol format (should be like BTCUSD, ETHUSD)
    if (!request.symbol.endsWith('USD') && !request.symbol.includes('/')) {
      request.symbol = request.symbol + 'USD';
    }

    console.log(`🪙 Executing Alpaca crypto trade: ${request.side.toUpperCase()} ${request.quantity} ${request.symbol}`);

    if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
      return this.simulateCryptoTrade(request);
    }

    return this.executeLiveCryptoTrade(request);
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
        api_key=os.getenv("ALPACA_API_KEY"),
        secret_key=os.getenv("ALPACA_SECRET_KEY"),
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

  private simulateCryptoTrade(request: AlpacaTradeRequest): AlpacaTradeResult {
    const orderId = `CRYPTO-SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const executedPrice = this.getSimulatedCryptoPrice(request.symbol);
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

  private async executeLiveCryptoTrade(request: AlpacaTradeRequest): Promise<AlpacaTradeResult> {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import os
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce, AssetClass
import json

try:
    client = TradingClient(
        api_key=os.getenv("ALPACA_API_KEY"),
        secret_key=os.getenv("ALPACA_SECRET_KEY"),
        paper=False
    )

    side = OrderSide.BUY if "${request.side}" == "buy" else OrderSide.SELL

    if "${request.orderType}" == "market":
        order_request = MarketOrderRequest(
            symbol="${request.symbol}",
            qty=${request.quantity},
            side=side,
            time_in_force=TimeInForce.IOC,  # Immediate or Cancel for crypto
            asset_class=AssetClass.CRYPTO
        )
    else:
        order_request = LimitOrderRequest(
            symbol="${request.symbol}",
            qty=${request.quantity},
            side=side,
            time_in_force=TimeInForce.GTC,  # Good Till Cancel for crypto
            limit_price=${request.limitPrice || 0},
            asset_class=AssetClass.CRYPTO
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
        "accountBalance": float(account.cash),
        "executedPrice": float(order.filled_avg_price) if order.filled_avg_price else None
    }

    print(f"ALPACA_CRYPTO_SUCCESS:{json.dumps(result)}")

except Exception as e:
    print(f"ALPACA_CRYPTO_ERROR:{str(e)}")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript], {
        env: { ...process.env }
      });

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_CRYPTO_SUCCESS')) {
          const jsonStr = output.split('ALPACA_CRYPTO_SUCCESS:')[1].trim();
          const result = JSON.parse(jsonStr);
          resolve(result);
        } else if (output.includes('ALPACA_CRYPTO_ERROR')) {
          const error = output.split('ALPACA_CRYPTO_ERROR:')[1].trim();
          reject(new Error(error));
        } else {
          reject(new Error('Unknown Alpaca crypto trade error'));
        }
      });
    });
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

  private getSimulatedCryptoPrice(symbol: string): number {
    const cryptoPrices: Record<string, number> = {
      'BTCUSD': 105000.00,
      'ETHUSD': 3850.00,
      'ADAUSD': 0.86,
      'SOLUSD': 218.00,
      'AVAXUSD': 42.00,
      'MATICUSD': 0.92,
      'LINKUSD': 21.50,
      'UNIUSD': 11.80,
      'DOTUSD': 7.50,
      'ATOMUSD': 12.30,
      'LTCUSD': 104.00,
      'BCHUSD': 485.00,
      'FILUSD': 5.20,
      'ALGOUSD': 0.35,
      'BATUSD': 0.28
    };

    const basePrice = cryptoPrices[symbol] || 100.00;
    const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation for crypto
    return basePrice * (1 + variation);
  }

  async getCryptoAssets(): Promise<string[]> {
    // Based on Alpaca's supported crypto assets
    return [
      'BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD', 'AVAXUSD',
      'MATICUSD', 'LINKUSD', 'UNIUSD', 'DOTUSD', 'ATOMUSD',
      'LTCUSD', 'BCHUSD', 'FILUSD', 'ALGOUSD', 'BATUSD'
    ];
  }

  async getCryptoQuote(symbol: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Alpaca trading engine not initialized');
    }

    if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
      return {
        symbol,
        price: this.getSimulatedCryptoPrice(symbol),
        timestamp: new Date().toISOString()
      };
    }

    return new Promise((resolve, reject) => {
      const pythonScript = `
import os
from alpaca.data.historical import CryptoHistoricalDataClient
from alpaca.data.requests import CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame
import json

try:
    client = CryptoHistoricalDataClient(
        api_key=os.getenv("ALPACA_API_KEY"),
        secret_key=os.getenv("ALPACA_SECRET_KEY")
    )

    request_params = CryptoBarsRequest(
        symbol_or_symbols="${symbol}",
        timeframe=TimeFrame.Minute
    )

    bars = client.get_crypto_bars(request_params)
    latest_bar = bars["${symbol}"][-1] if "${symbol}" in bars and bars["${symbol}"] else None

    if latest_bar:
        result = {
            "symbol": "${symbol}",
            "price": float(latest_bar.close),
            "high": float(latest_bar.high),
            "low": float(latest_bar.low),
            "volume": float(latest_bar.volume),
            "timestamp": latest_bar.timestamp.isoformat()
        }
        print(f"ALPACA_QUOTE_SUCCESS:{json.dumps(result)}")
    else:
        print("ALPACA_QUOTE_ERROR:No data available")

except Exception as e:
    print(f"ALPACA_QUOTE_ERROR:{str(e)}")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript], {
        env: { ...process.env }
      });

      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_QUOTE_SUCCESS')) {
          const jsonStr = output.split('ALPACA_QUOTE_SUCCESS:')[1].trim();
          const result = JSON.parse(jsonStr);
          resolve(result);
        } else {
          resolve({
            symbol,
            price: this.getSimulatedCryptoPrice(symbol),
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  }

  async getAccountInfo(): Promise<AlpacaAccountInfo> {
    if (!this.isInitialized || !this.accountData) {
      throw new Error('Alpaca trading engine not initialized');
    }

    if (!process.env.ALPACA_API_KEY || !process.env.ALPACA_SECRET_KEY) {
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
        api_key=os.getenv("ALPACA_API_KEY"),
        secret_key=os.getenv("ALPACA_SECRET_KEY"),
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
    return !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);
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