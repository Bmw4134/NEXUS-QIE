import axios from 'axios';
import * as crypto from 'crypto';

export interface RobinhoodAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  mfa_code?: string;
  backup_code?: string;
}

export interface RobinhoodAccount {
  url: string;
  portfolio: string;
  account_number: string;
  buying_power: string;
  cash: string;
  cash_available_for_withdrawal: string;
  cash_held_for_orders: string;
  created_at: string;
  crypto_buying_power: string;
  day_trade_count: number;
  day_trading_buying_power: string;
  max_ach_early_access_amount: string;
  option_level: string;
  portfolio_cash: string;
  sma: string;
  sma_held_for_orders: string;
  total_deposits: string;
  uncleared_deposits: string;
  unsettled_funds: string;
}

export interface RobinhoodOrder {
  id: string;
  cancel: string;
  account: string;
  url: string;
  created_at: string;
  updated_at: string;
  executed_at: string;
  instrument: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  trigger: 'immediate' | 'stop';
  quantity: string;
  price: string;
  stop_price: string;
  time_in_force: 'gfd' | 'gtc' | 'ioc' | 'fok';
  state: 'queued' | 'unconfirmed' | 'confirmed' | 'partially_filled' | 'filled' | 'rejected' | 'cancelled';
  fees: string;
  reject_reason: string;
  response_category: string;
  chain_id: string;
  chain_quantity: string;
  cumulative_quantity: string;
}

export class RobinhoodDirectAPI {
  private baseURL = 'https://api.robinhood.com';
  private clientId = 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private deviceToken: string;
  private credentials: {
    username: string;
    password: string;
    mfaCode?: string;
  } | null = null;

  constructor() {
    this.deviceToken = this.generateDeviceToken();
    this.initializeCredentials();
  }

  private generateDeviceToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private initializeCredentials() {
    if (process.env.ROBINHOOD_USERNAME && process.env.ROBINHOOD_PASSWORD) {
      this.credentials = {
        username: process.env.ROBINHOOD_USERNAME,
        password: process.env.ROBINHOOD_PASSWORD,
        mfaCode: process.env.ROBINHOOD_MFA_CODE
      };
      console.log('🔐 Robinhood Direct API: Credentials loaded');
    }
  }

  private getHeaders(includeAuth: boolean = false) {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en;q=1, fr;q=0.9, de;q=0.8, ja;q=0.7, nl;q=0.6, it;q=0.5',
      'Content-Type': 'application/json',
      'X-Robinhood-API-Version': '1.0.0',
      'Connection': 'keep-alive',
      'User-Agent': 'Robinhood/823 (iPhone; iOS 14.6; Scale/2.0)'
    };

    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async authenticate(): Promise<boolean> {
    if (!this.credentials) {
      console.log('❌ No credentials available for authentication');
      return false;
    }

    try {
      console.log('🌐 Authenticating with Robinhood API...');

      const authData = {
        client_id: this.clientId,
        expires_in: 86400,
        grant_type: 'password',
        password: this.credentials.password,
        scope: 'internal',
        username: this.credentials.username,
        challenge_type: 'sms',
        device_token: this.deviceToken
      };

      const response = await axios.post(
        `${this.baseURL}/api-token-auth/`,
        authData,
        { headers: this.getHeaders() }
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;
        console.log('✅ Robinhood API authentication successful');
        return true;
      }

      if (response.data.mfa_required && this.credentials.mfaCode) {
        console.log('🔐 MFA required, submitting code...');
        
        const mfaData = {
          client_id: this.clientId,
          expires_in: 86400,
          grant_type: 'password',
          password: this.credentials.password,
          scope: 'internal',
          username: this.credentials.username,
          mfa_code: this.credentials.mfaCode,
          device_token: this.deviceToken
        };

        const mfaResponse = await axios.post(
          `${this.baseURL}/api-token-auth/`,
          mfaData,
          { headers: this.getHeaders() }
        );

        if (mfaResponse.data.access_token) {
          this.accessToken = mfaResponse.data.access_token;
          this.refreshToken = mfaResponse.data.refresh_token;
          console.log('✅ MFA authentication successful');
          return true;
        }
      }

      console.log('❌ Authentication failed');
      return false;

    } catch (error: any) {
      console.log(`❌ Authentication error: ${error.response?.data?.detail || error.message}`);
      return false;
    }
  }

  async getAccount(): Promise<RobinhoodAccount | null> {
    if (!this.accessToken) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) return null;
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/`,
        { headers: this.getHeaders(true) }
      );

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }

      return null;
    } catch (error: any) {
      console.log(`❌ Account fetch error: ${error.response?.data?.detail || error.message}`);
      return null;
    }
  }

  async getInstrument(symbol: string): Promise<string | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}/instruments/?symbol=${symbol}`,
        { headers: this.getHeaders(true) }
      );

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].url;
      }

      return null;
    } catch (error: any) {
      console.log(`❌ Instrument lookup error: ${error.response?.data?.detail || error.message}`);
      return null;
    }
  }

  async getQuote(symbol: string): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}/quotes/?symbols=${symbol}`,
        { headers: this.getHeaders(true) }
      );

      if (response.data.results && response.data.results.length > 0) {
        const quote = response.data.results[0];
        return parseFloat(quote.last_trade_price || quote.bid_price || quote.ask_price);
      }

      return null;
    } catch (error: any) {
      console.log(`❌ Quote fetch error: ${error.response?.data?.detail || error.message}`);
      return null;
    }
  }

  async placeOrder(params: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    quantity: number;
    price?: number;
    timeInForce?: 'gfd' | 'gtc';
  }): Promise<RobinhoodOrder | null> {
    if (!this.accessToken) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) return null;
    }

    try {
      const account = await this.getAccount();
      if (!account) {
        console.log('❌ No account found');
        return null;
      }

      const instrument = await this.getInstrument(params.symbol);
      if (!instrument) {
        console.log(`❌ Instrument not found for ${params.symbol}`);
        return null;
      }

      const orderData = {
        account: account.url,
        instrument,
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        time_in_force: params.timeInForce || 'gfd',
        trigger: 'immediate',
        quantity: params.quantity.toString(),
        ...(params.type === 'limit' && params.price && { price: params.price.toString() })
      };

      console.log(`🚀 Placing ${params.side} order: ${params.quantity} ${params.symbol}`);

      const response = await axios.post(
        `${this.baseURL}/orders/`,
        orderData,
        { headers: this.getHeaders(true) }
      );

      if (response.data.id) {
        console.log(`✅ Order placed successfully: ${response.data.id}`);
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.log(`❌ Order placement error: ${error.response?.data?.detail || error.message}`);
      return null;
    }
  }

  async getOrders(limit: number = 10): Promise<RobinhoodOrder[]> {
    if (!this.accessToken) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) return [];
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/orders/?cursor=&limit=${limit}`,
        { headers: this.getHeaders(true) }
      );

      return response.data.results || [];
    } catch (error: any) {
      console.log(`❌ Orders fetch error: ${error.response?.data?.detail || error.message}`);
      return [];
    }
  }

  async getPositions(): Promise<any[]> {
    if (!this.accessToken) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) return [];
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/positions/`,
        { headers: this.getHeaders(true) }
      );

      return response.data.results?.filter((pos: any) => parseFloat(pos.quantity) > 0) || [];
    } catch (error: any) {
      console.log(`❌ Positions fetch error: ${error.response?.data?.detail || error.message}`);
      return [];
    }
  }

  async executeTrade(params: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
  }): Promise<{
    success: boolean;
    orderId?: string;
    price?: number;
    quantity?: number;
    error?: string;
  }> {
    try {
      const quote = await this.getQuote(params.symbol);
      if (!quote) {
        return { success: false, error: 'Could not get market price' };
      }

      const quantity = params.amount / quote;

      const order = await this.placeOrder({
        symbol: params.symbol,
        side: params.side,
        type: 'market',
        quantity,
        timeInForce: 'gfd'
      });

      if (order) {
        return {
          success: true,
          orderId: order.id,
          price: quote,
          quantity
        };
      }

      return { success: false, error: 'Order placement failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export const robinhoodDirectAPI = new RobinhoodDirectAPI();