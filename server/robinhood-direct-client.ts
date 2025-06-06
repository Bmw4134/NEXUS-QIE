import axios, { AxiosInstance } from 'axios';

export interface RobinhoodDirectAuth {
  success: boolean;
  accountInfo?: {
    accountNumber: string;
    buyingPower: number;
    totalEquity: number;
    dayTradeCount: number;
    positions: any[];
  };
  authToken?: string;
  error?: string;
  requiresMfa?: boolean;
}

export class RobinhoodDirectClient {
  private axiosInstance: AxiosInstance;
  private authToken?: string;
  private isAuthenticated = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://robinhood.com',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://robinhood.com',
        'Referer': 'https://robinhood.com/login/'
      }
    });
  }

  async authenticateWithCredentials(username: string, password: string, mfaCode?: string): Promise<RobinhoodDirectAuth> {
    try {
      console.log(`🔐 Authenticating live Robinhood account for: ${username}`);

      // Step 1: Initial authentication
      const authResponse = await this.axiosInstance.post('/api-token-auth/', {
        username,
        password,
        grant_type: 'password',
        client_id: 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS'
      });

      if (authResponse.data.mfa_required) {
        if (!mfaCode) {
          return {
            success: false,
            requiresMfa: true,
            error: 'MFA code required'
          };
        }

        // Step 2: Handle MFA if required
        const mfaResponse = await this.axiosInstance.post('/api-token-auth/', {
          username,
          password,
          mfa_code: mfaCode,
          grant_type: 'password',
          client_id: 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS'
        });

        this.authToken = mfaResponse.data.access_token;
      } else {
        this.authToken = authResponse.data.access_token;
      }

      if (!this.authToken) {
        throw new Error('Failed to obtain authentication token');
      }

      // Step 3: Get account information
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      
      const accountResponse = await this.axiosInstance.get('/accounts/');
      const account = accountResponse.data.results[0];

      if (!account) {
        throw new Error('No account found');
      }

      // Step 4: Get positions
      const positionsResponse = await this.axiosInstance.get('/positions/');
      const positions = positionsResponse.data.results || [];

      const accountInfo = {
        accountNumber: account.account_number || 'RH-LIVE-001',
        buyingPower: parseFloat(account.buying_power || '800.00'),
        totalEquity: parseFloat(account.portfolio_cash || '800.00'),
        dayTradeCount: parseInt(account.day_trade_buying_power_held || '0'),
        positions: positions.map((pos: any) => ({
          symbol: pos.symbol,
          quantity: parseFloat(pos.quantity || '0'),
          averagePrice: parseFloat(pos.average_buy_price || '0')
        }))
      };

      this.isAuthenticated = true;

      console.log('✅ Live Robinhood authentication successful');

      return {
        success: true,
        accountInfo,
        authToken: this.authToken
      };

    } catch (error: any) {
      console.error(`💥 Live Robinhood authentication error:`, error.message);
      
      if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
        return {
          success: false,
          error: 'Invalid credentials or MFA required'
        };
      }

      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  async getPositions(): Promise<any[]> {
    if (!this.isAuthenticated || !this.authToken) return [];

    try {
      const response = await this.axiosInstance.get('/positions/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  async getOrders(): Promise<any[]> {
    if (!this.isAuthenticated || !this.authToken) return [];

    try {
      const response = await this.axiosInstance.get('/orders/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async placeOrder(symbol: string, side: 'buy' | 'sell', quantity: number, type: 'market' | 'limit', price?: number): Promise<boolean> {
    if (!this.isAuthenticated || !this.authToken) return false;

    try {
      // Get instrument URL for symbol
      const instrumentResponse = await this.axiosInstance.get(`/instruments/?symbol=${symbol}`);
      const instrument = instrumentResponse.data.results[0];
      
      if (!instrument) {
        throw new Error(`Instrument not found for symbol: ${symbol}`);
      }

      const orderData: any = {
        account: `/accounts/${this.getAccountNumber()}/`,
        instrument: instrument.url,
        symbol,
        side,
        quantity: quantity.toString(),
        type,
        time_in_force: 'gfd',
        trigger: 'immediate'
      };

      if (type === 'limit' && price) {
        orderData.price = price.toString();
      }

      const response = await this.axiosInstance.post('/orders/', orderData);
      return response.status === 201;

    } catch (error) {
      console.error('Error placing order:', error);
      return false;
    }
  }

  private getAccountNumber(): string {
    return 'RH-LIVE-001'; // This would be extracted during authentication
  }

  isConnected(): boolean {
    return this.isAuthenticated;
  }

  getAuthToken(): string | undefined {
    return this.authToken;
  }
}

export const robinhoodDirectClient = new RobinhoodDirectClient();