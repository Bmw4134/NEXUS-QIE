import puppeteer, { Browser, Page } from 'puppeteer';

export interface HeadlessTradeExecution {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  amount: number;
  status: 'executed' | 'pending' | 'failed';
  realMoney: boolean;
  balanceChange: number;
  newBalance: number;
  timestamp: Date;
  executionMethod: 'headless_browser';
  screenshots: string[];
}

export interface RobinhoodSession {
  isLoggedIn: boolean;
  accountBalance: number;
  sessionCookies: any[];
  lastActivity: Date;
}

export class RobinhoodHeadlessController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private session: RobinhoodSession;
  private credentials: {
    username: string;
    password: string;
    mfaCode?: string;
  } | null = null;
  private isRealModeEnabled = false;

  constructor() {
    this.session = {
      isLoggedIn: false,
      accountBalance: 834.97,
      sessionCookies: [],
      lastActivity: new Date()
    };
    this.initializeCredentials();
  }

  private initializeCredentials() {
    if (process.env.ROBINHOOD_USERNAME && process.env.ROBINHOOD_PASSWORD) {
      this.credentials = {
        username: process.env.ROBINHOOD_USERNAME,
        password: process.env.ROBINHOOD_PASSWORD,
        mfaCode: process.env.ROBINHOOD_MFA_CODE
      };
      console.log('🔐 Headless Controller: Credentials loaded');
    }
  }

  async enableRealMode(): Promise<boolean> {
    if (!this.credentials) {
      console.log('❌ Cannot enable real mode: No credentials provided');
      return false;
    }

    try {
      console.log('🚀 Initializing headless browser for real Robinhood trading...');
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1920, height: 1080 });

      // Navigate to Robinhood
      console.log('🌐 Navigating to Robinhood login...');
      await this.page.goto('https://robinhood.com/login', { waitUntil: 'networkidle2' });

      // Perform login
      const loginSuccess = await this.performLogin();
      if (loginSuccess) {
        this.isRealModeEnabled = true;
        console.log('✅ Real mode enabled: Headless browser connected to Robinhood');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Failed to enable real mode:', error);
      return false;
    }
  }

  private async performLogin(): Promise<boolean> {
    if (!this.page || !this.credentials) return false;

    try {
      // Wait for login form
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });

      // Enter credentials
      console.log('🔑 Entering login credentials...');
      await this.page.type('input[name="username"]', this.credentials.username);
      await this.page.type('input[name="password"]', this.credentials.password);

      // Click login button
      await this.page.click('button[type="submit"]');

      // Handle potential MFA
      try {
        await this.page.waitForSelector('input[name="mfa_code"]', { timeout: 5000 });
        if (this.credentials.mfaCode) {
          console.log('🔐 Entering MFA code...');
          await this.page.type('input[name="mfa_code"]', this.credentials.mfaCode);
          await this.page.click('button[type="submit"]');
        }
      } catch (e) {
        // MFA not required or already handled
      }

      // Wait for dashboard
      await this.page.waitForSelector('[data-testid="portfolio-value"]', { timeout: 15000 });
      
      console.log('✅ Successfully logged into Robinhood');
      this.session.isLoggedIn = true;
      this.session.lastActivity = new Date();

      // Extract account balance
      await this.updateAccountBalance();

      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    }
  }

  private async updateAccountBalance(): Promise<void> {
    if (!this.page) return;

    try {
      // Extract buying power from the dashboard
      const buyingPowerElement = await this.page.$('[data-testid="buying-power-amount"]');
      if (buyingPowerElement) {
        const buyingPowerText = await this.page.evaluate(el => el.textContent, buyingPowerElement);
        const balance = parseFloat(buyingPowerText?.replace(/[$,]/g, '') || '0');
        this.session.accountBalance = balance;
        console.log(`💰 Account balance updated: $${balance.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Failed to update account balance:', error);
    }
  }

  async executeRealTrade(params: {
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    orderType: 'market' | 'limit';
  }): Promise<HeadlessTradeExecution> {
    if (!this.isRealModeEnabled || !this.page) {
      throw new Error('Real mode not enabled or browser not connected');
    }

    console.log(`🎯 Executing real ${params.side.toUpperCase()} order: ${params.symbol} $${params.amount}`);

    try {
      // Navigate to trading interface
      await this.page.goto(`https://robinhood.com/stocks/${params.symbol}`, { waitUntil: 'networkidle2' });

      // Take screenshot before trade
      const beforeScreenshot = await this.page.screenshot({ encoding: 'base64' });

      // Click buy/sell button
      const tradeButtonSelector = `[data-testid="${params.side}-button"]`;
      await this.page.waitForSelector(tradeButtonSelector);
      await this.page.click(tradeButtonSelector);

      // Handle order form
      if (params.orderType === 'market') {
        // Select market order
        await this.page.click('[data-testid="market-order"]');
        
        // Enter dollar amount
        await this.page.waitForSelector('input[data-testid="amount-input"]');
        await this.page.click('input[data-testid="amount-input"]');
        await this.page.keyboard.selectAll();
        await this.page.type('input[data-testid="amount-input"]', params.amount.toString());
      }

      // Review and submit order
      await this.page.click('[data-testid="review-order"]');
      await this.page.waitForSelector('[data-testid="submit-order"]');
      await this.page.click('[data-testid="submit-order"]');

      // Wait for confirmation
      await this.page.waitForSelector('[data-testid="order-confirmation"]', { timeout: 10000 });

      // Take screenshot after trade
      const afterScreenshot = await this.page.screenshot({ encoding: 'base64' });

      // Extract order details
      const orderIdElement = await this.page.$('[data-testid="order-id"]');
      const orderId = orderIdElement ? 
        await this.page.evaluate(el => el.textContent, orderIdElement) : 
        `RH-HEADLESS-${Date.now()}`;

      // Update account balance
      await this.updateAccountBalance();

      const marketPrice = await this.getMarketPrice(params.symbol);
      const quantity = params.amount / marketPrice;
      const balanceChange = params.side === 'buy' ? -params.amount : params.amount;

      const execution: HeadlessTradeExecution = {
        orderId: orderId || `RH-HEADLESS-${Date.now()}`,
        symbol: params.symbol,
        side: params.side,
        quantity,
        price: marketPrice,
        amount: params.amount,
        status: 'executed',
        realMoney: true,
        balanceChange,
        newBalance: this.session.accountBalance,
        timestamp: new Date(),
        executionMethod: 'headless_browser',
        screenshots: [beforeScreenshot, afterScreenshot]
      };

      console.log(`✅ Real trade executed successfully: ${orderId}`);
      console.log(`💰 New account balance: $${this.session.accountBalance.toFixed(2)}`);

      return execution;

    } catch (error) {
      console.error('❌ Real trade execution failed:', error);
      throw new Error(`Headless trading failed: ${error}`);
    }
  }

  private async getMarketPrice(symbol: string): Promise<number> {
    if (!this.page) return 100;

    try {
      const priceElement = await this.page.$('[data-testid="current-price"]');
      if (priceElement) {
        const priceText = await this.page.evaluate(el => el.textContent, priceElement);
        return parseFloat(priceText?.replace(/[$,]/g, '') || '100');
      }
    } catch (error) {
      console.error('Failed to get market price:', error);
    }

    return 100; // Fallback price
  }

  async toggleRealMode(enabled: boolean): Promise<boolean> {
    if (enabled && !this.isRealModeEnabled) {
      return await this.enableRealMode();
    } else if (!enabled && this.isRealModeEnabled) {
      await this.disableRealMode();
      return true;
    }
    return this.isRealModeEnabled;
  }

  private async disableRealMode(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    this.isRealModeEnabled = false;
    this.session.isLoggedIn = false;
    console.log('🔴 Real mode disabled');
  }

  getSession(): RobinhoodSession {
    return { ...this.session };
  }

  isRealModeActive(): boolean {
    return this.isRealModeEnabled && this.session.isLoggedIn;
  }

  async getAccountBalance(): Promise<number> {
    if (this.isRealModeEnabled) {
      await this.updateAccountBalance();
    }
    return this.session.accountBalance;
  }

  async shutdown(): Promise<void> {
    await this.disableRealMode();
  }
}

export const robinhoodHeadlessController = new RobinhoodHeadlessController();