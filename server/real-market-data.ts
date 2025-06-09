/**
 * Real Market Data Service
 * Connects to live cryptocurrency exchanges and financial APIs
 */

interface MarketDataPoint {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

interface RobinhoodQuote {
  symbol: string;
  bid_price: string;
  ask_price: string;
  last_trade_price: string;
  last_extended_hours_trade_price: string;
  previous_close: string;
  updated_at: string;
}

class RealMarketDataService {
  private robinhoodToken: string | null = null;
  private lastUpdate: Date = new Date(0);
  private cache: Map<string, MarketDataPoint> = new Map();
  private readonly CACHE_DURATION = 5000; // 5 seconds

  constructor() {
    this.initializeConnections();
  }

  private async initializeConnections() {
    console.log('🔗 Connecting to real market data sources...');
    await this.authenticateRobinhood();
    this.startRealTimeUpdates();
  }

  private async authenticateRobinhood(): Promise<void> {
    try {
      if (!process.env.ROBINHOOD_USERNAME || !process.env.ROBINHOOD_PASSWORD) {
        console.log('⚠️ Robinhood credentials not available');
        return;
      }

      const response = await fetch('https://robinhood.com/api-token-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: process.env.ROBINHOOD_USERNAME,
          password: process.env.ROBINHOOD_PASSWORD,
          grant_type: 'password',
          client_id: 'C4TItRLRxVeO1o3EUEOpMm'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.robinhoodToken = data.access_token;
        console.log('✅ Robinhood market data authenticated');
      }
    } catch (error) {
      console.log('⚠️ Robinhood authentication failed, using public APIs');
    }
  }

  private startRealTimeUpdates() {
    setInterval(async () => {
      await this.updateMarketData();
    }, 10000); // Update every 10 seconds
  }

  private async updateMarketData(): Promise<void> {
    try {
      // Primary: CoinGecko Pro API
      await this.fetchFromCoinGecko();
      
      // Secondary: Binance API
      if (this.cache.size === 0) {
        await this.fetchFromBinance();
      }
      
      // Tertiary: CoinMarketCap
      if (this.cache.size === 0) {
        await this.fetchFromCoinMarketCap();
      }

      this.lastUpdate = new Date();
      console.log(`📊 Market data updated: ${this.cache.size} assets`);
    } catch (error) {
      console.error('Market data update failed:', error);
    }
  }

  private async fetchFromCoinGecko(): Promise<void> {
    try {
      const symbols = ['bitcoin', 'ethereum', 'dogecoin', 'solana', 'cardano', 'matic-network', 'avalanche-2', 'chainlink', 'uniswap', 'litecoin'];
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbols.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ConnectHubPro/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      const symbolMap: Record<string, string> = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH', 
        'dogecoin': 'DOGE',
        'solana': 'SOL',
        'cardano': 'ADA',
        'matic-network': 'MATIC',
        'avalanche-2': 'AVAX',
        'chainlink': 'LINK',
        'uniswap': 'UNI',
        'litecoin': 'LTC'
      };

      for (const [coinId, symbol] of Object.entries(symbolMap)) {
        if (data[coinId]) {
          this.cache.set(symbol, {
            symbol,
            name: this.getFullName(symbol),
            price: data[coinId].usd || 0,
            change24h: data[coinId].usd_24h_change || 0,
            volume24h: data[coinId].usd_24h_vol || 0,
            marketCap: data[coinId].usd_market_cap || 0,
            lastUpdated: new Date()
          });
        }
      }
    } catch (error) {
      console.error('CoinGecko fetch failed:', error);
      throw error;
    }
  }

  private async fetchFromBinance(): Promise<void> {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'SOLUSDT', 'ADAUSDT', 'MATICUSDT', 'AVAXUSDT', 'LINKUSDT', 'UNIUSDT', 'LTCUSDT'];
      
      const priceResponse = await fetch('https://api.binance.com/api/v3/ticker/price');
      const changeResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr');

      if (!priceResponse.ok || !changeResponse.ok) {
        throw new Error('Binance API error');
      }

      const prices = await priceResponse.json();
      const changes = await changeResponse.json();

      const symbolMap: Record<string, string> = {
        'BTCUSDT': 'BTC',
        'ETHUSDT': 'ETH',
        'DOGEUSDT': 'DOGE', 
        'SOLUSDT': 'SOL',
        'ADAUSDT': 'ADA',
        'MATICUSDT': 'MATIC',
        'AVAXUSDT': 'AVAX',
        'LINKUSDT': 'LINK',
        'UNIUSDT': 'UNI',
        'LTCUSDT': 'LTC'
      };

      for (const binanceSymbol of symbols) {
        const symbol = symbolMap[binanceSymbol];
        const priceData = prices.find((p: any) => p.symbol === binanceSymbol);
        const changeData = changes.find((c: any) => c.symbol === binanceSymbol);

        if (priceData && changeData) {
          this.cache.set(symbol, {
            symbol,
            name: this.getFullName(symbol),
            price: parseFloat(priceData.price),
            change24h: parseFloat(changeData.priceChangePercent),
            volume24h: parseFloat(changeData.volume),
            marketCap: 0, // Binance doesn't provide market cap
            lastUpdated: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Binance fetch failed:', error);
      throw error;
    }
  }

  private async fetchFromCoinMarketCap(): Promise<void> {
    try {
      // Using CMC's public API (rate limited but available)
      const response = await fetch('https://api.coinmarketcap.com/v1/ticker/?limit=10');
      
      if (!response.ok) {
        throw new Error('CoinMarketCap API error');
      }

      const data = await response.json();
      
      const symbolMap: Record<string, string> = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'dogecoin': 'DOGE',
        'solana': 'SOL',
        'cardano': 'ADA',
        'polygon': 'MATIC',
        'avalanche': 'AVAX',
        'chainlink': 'LINK',
        'uniswap': 'UNI',
        'litecoin': 'LTC'
      };

      for (const coin of data) {
        const symbol = symbolMap[coin.id] || coin.symbol;
        if (symbol) {
          this.cache.set(symbol, {
            symbol,
            name: coin.name,
            price: parseFloat(coin.price_usd) || 0,
            change24h: parseFloat(coin.percent_change_24h) || 0,
            volume24h: parseFloat(coin['24h_volume_usd']) || 0,
            marketCap: parseFloat(coin.market_cap_usd) || 0,
            lastUpdated: new Date()
          });
        }
      }
    } catch (error) {
      console.error('CoinMarketCap fetch failed:', error);
      throw error;
    }
  }

  private getFullName(symbol: string): string {
    const names: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'DOGE': 'Dogecoin',
      'SOL': 'Solana',
      'ADA': 'Cardano',
      'MATIC': 'Polygon',
      'AVAX': 'Avalanche',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin'
    };
    return names[symbol] || symbol;
  }

  async getRealTimeQuotes(): Promise<MarketDataPoint[]> {
    // Return cached data if recent
    if (Date.now() - this.lastUpdate.getTime() < this.CACHE_DURATION && this.cache.size > 0) {
      return Array.from(this.cache.values());
    }

    // Force update if cache is stale
    await this.updateMarketData();
    return Array.from(this.cache.values());
  }

  getQuote(symbol: string): MarketDataPoint | null {
    return this.cache.get(symbol) || null;
  }

  isConnected(): boolean {
    return this.cache.size > 0 && Date.now() - this.lastUpdate.getTime() < 60000; // 1 minute
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      lastUpdate: this.lastUpdate,
      assetsTracked: this.cache.size,
      dataSources: {
        robinhood: !!this.robinhoodToken,
        coingecko: true,
        binance: true,
        coinmarketcap: true
      }
    };
  }
}

export const realMarketDataService = new RealMarketDataService();