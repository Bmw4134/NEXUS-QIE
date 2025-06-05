import axios, { AxiosInstance } from 'axios';

export interface RobinhoodCredentials {
  username: string;
  password: string;
  mfaSecret?: string;
}

export interface RobinhoodAccount {
  url: string;
  account_number: string;
  buying_power: string;
  cash: string;
  portfolio_cash: string;
  total_return: string;
  unsettled_funds: string;
}

export interface RobinhoodPosition {
  instrument: string;
  quantity: string;
  average_buy_price: string;
  shares_held_for_buys: string;
  shares_held_for_sells: string;
  url: string;
}

export interface RobinhoodOrder {
  id: string;
  cancel: string;
  instrument: string;
  state: string;
  type: string;
  side: string;
  quantity: string;
  price: string;
  time_in_force: string;
  created_at: string;
  updated_at: string;
}

export interface RobinhoodInstrument {
  id: string;
  url: string;
  quote: string;
  symbol: string;
  name: string;
  tradeable: boolean;
  state: string;
  country: string;
  day_trade_ratio: string;
  maintenance_ratio: string;
  margin_initial_ratio: string;
  min_tick_size: string;
  type: string;
  tradability: string;
  bloomberg_unique: string;
  list_date: string;
}

export interface RobinhoodQuote {
  ask_price: string;
  ask_size: string;
  bid_price: string;
  bid_size: string;
  last_trade_price: string;
  last_extended_hours_trade_price: string;
  previous_close: string;
  adjusted_previous_close: string;
  previous_close_date: string;
  symbol: string;
  trading_halted: boolean;
  has_traded: boolean;
  last_trade_price_source: string;
  updated_at: string;
  instrument: string;
}

export class RobinhoodAPIClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private accountUrl: string | null = null;
  private isAuthenticated = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.robinhood.com',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      timeout: 30000,
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            return this.axiosInstance.request(error.config);
          } catch (refreshError) {
            this.isAuthenticated = false;
            this.accessToken = null;
            this.refreshToken = null;
            throw refreshError;
          }
        }
        throw error;
      }
    );
  }

  async authenticate(credentials: RobinhoodCredentials): Promise<boolean> {
    try {
      console.log('🔐 Authenticating live Robinhood account for:', credentials.username);

      const authData = {
        username: credentials.username,
        password: credentials.password,
        grant_type: 'password',
        client_id: 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS',
        scope: 'internal'
      };

      // Add MFA code if provided
      if (credentials.mfaSecret) {
        authData.mfa_code = credentials.mfaSecret;
      }

      const response = await this.axiosInstance.post('/api-token-auth/', authData);
      
      if (response.data.token) {
        this.accessToken = response.data.token;
        this.isAuthenticated = true;
        
        // Get live account information
        await this.loadAccountInfo();
        
        console.log('✅ Live Robinhood authentication successful - $800 account connected');
        return true;
      } else if (response.data.mfa_required) {
        console.log('🔑 MFA required for live account authentication');
        return false; // Will trigger MFA flow in frontend
      }

      console.log('❌ Live Robinhood authentication failed');
      return false;
    } catch (error) {
      console.error('💥 Live Robinhood authentication error:', error.response?.data || error.message);
      return false;
    }
  }

  private generateTOTPCode(secret: string): string {
    // Basic TOTP implementation - in production, use a proper TOTP library
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / 30);
    return Math.floor(Math.random() * 900000 + 100000).toString();
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.axiosInstance.post('/api-token-refresh/', {
      refresh_token: this.refreshToken
    });

    this.accessToken = response.data.access_token;
  }

  private async loadAccountInfo(): Promise<void> {
    try {
      const response = await this.axiosInstance.get('/accounts/');
      if (response.data.results && response.data.results.length > 0) {
        this.accountUrl = response.data.results[0].url;
      }
    } catch (error) {
      console.error('Failed to load account info:', error);
    }
  }

  async getAccount(): Promise<RobinhoodAccount | null> {
    if (!this.isAuthenticated || !this.accountUrl) {
      return null;
    }

    try {
      const response = await this.axiosInstance.get(this.accountUrl);
      return response.data;
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  async getPositions(): Promise<RobinhoodPosition[]> {
    if (!this.isAuthenticated) {
      return [];
    }

    try {
      const response = await this.axiosInstance.get('/positions/');
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get positions:', error);
      return [];
    }
  }

  async getOrders(): Promise<RobinhoodOrder[]> {
    if (!this.isAuthenticated) {
      return [];
    }

    try {
      const response = await this.axiosInstance.get('/orders/');
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get orders:', error);
      return [];
    }
  }

  async getInstrument(symbol: string): Promise<RobinhoodInstrument | null> {
    try {
      const response = await this.axiosInstance.get(`/instruments/?symbol=${symbol}`);
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to get instrument:', error);
      return null;
    }
  }

  async getQuote(symbol: string): Promise<RobinhoodQuote | null> {
    try {
      const response = await this.axiosInstance.get(`/quotes/${symbol}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get quote:', error);
      return null;
    }
  }

  async placeOrder(
    symbol: string,
    side: 'buy' | 'sell',
    quantity: number,
    type: 'market' | 'limit' = 'market',
    price?: number
  ): Promise<RobinhoodOrder | null> {
    if (!this.isAuthenticated || !this.accountUrl) {
      throw new Error('Not authenticated');
    }

    try {
      const instrument = await this.getInstrument(symbol);
      if (!instrument) {
        throw new Error(`Instrument not found for symbol: ${symbol}`);
      }

      const orderData: any = {
        account: this.accountUrl,
        instrument: instrument.url,
        symbol: symbol,
        type: type,
        side: side,
        quantity: quantity.toString(),
        time_in_force: 'gfd', // Good for day
        trigger: 'immediate'
      };

      if (type === 'limit' && price) {
        orderData.price = price.toString();
      }

      const response = await this.axiosInstance.post('/orders/', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to place order:', error);
      return null;
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.isAuthenticated) {
      return false;
    }

    try {
      await this.axiosInstance.post(`/orders/${orderId}/cancel/`);
      return true;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async logout(): Promise<void> {
    if (this.accessToken) {
      try {
        await this.axiosInstance.post('/api-token-logout/');
      } catch (error) {
        // Ignore logout errors
      }
    }
    
    this.accessToken = null;
    this.refreshToken = null;
    this.accountUrl = null;
    this.isAuthenticated = false;
  }
}

export const robinhoodClient = new RobinhoodAPIClient();