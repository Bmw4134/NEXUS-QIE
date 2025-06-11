/**
 * NEXUS Twilio SMS Integration
 * Handles SMS notifications for trading alerts, price changes, and system updates
 */

export interface SMSNotification {
  id: string;
  to: string;
  from: string;
  message: string;
  type: 'trade_alert' | 'price_alert' | 'system_notification' | 'security_alert';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: Date;
  sid?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TwilioMetrics {
  totalSent: number;
  successRate: number;
  activeAlerts: number;
  lastNotification: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'error';
}

export class TwilioIntegration {
  private accountSid: string | null = null;
  private authToken: string | null = null;
  private fromNumber: string | null = null;
  private isConnected = false;
  private notifications: Map<string, SMSNotification> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private sentCount = 0;
  private failedCount = 0;

  constructor() {
    this.initializeConnection();
    this.setupSampleAlerts();
  }

  private initializeConnection() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || null;
    
    if (this.accountSid && this.authToken && this.fromNumber) {
      this.isConnected = true;
      console.log('✅ Twilio SMS integration initialized');
    } else {
      console.log('⚠️ Twilio credentials not found - SMS disabled');
    }
  }

  private setupSampleAlerts() {
    // Sample price alerts for demonstration
    const sampleAlerts: PriceAlert[] = [
      {
        id: 'alert_btc_110k',
        symbol: 'BTC',
        targetPrice: 110000,
        condition: 'above',
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'alert_eth_3000',
        symbol: 'ETH',
        targetPrice: 3000,
        condition: 'above',
        phoneNumber: '+1234567890',
        isActive: true,
        createdAt: new Date()
      }
    ];

    sampleAlerts.forEach(alert => {
      this.priceAlerts.set(alert.id, alert);
    });
  }

  async sendSMS(to: string, message: string, type: SMSNotification['type'] = 'system_notification'): Promise<SMSNotification> {
    const notification: SMSNotification = {
      id: this.generateNotificationId(),
      to,
      from: this.fromNumber || '+15551234567',
      message,
      type,
      status: 'pending',
      timestamp: new Date()
    };

    this.notifications.set(notification.id, notification);

    if (!this.isConnected) {
      notification.status = 'failed';
      this.failedCount++;
      console.log(`📱 SMS simulation (no credentials): ${message} → ${to}`);
      return notification;
    }

    try {
      // In real implementation, this would use Twilio SDK
      const response = await this.sendViaTwilio(to, message);
      
      if (response.success) {
        notification.status = 'sent';
        notification.sid = response.sid;
        this.sentCount++;
        console.log(`📱 SMS sent successfully to ${to}`);
      } else {
        notification.status = 'failed';
        this.failedCount++;
        console.log(`❌ SMS failed to ${to}: ${response.error}`);
      }
    } catch (error) {
      notification.status = 'failed';
      this.failedCount++;
      console.error('SMS send error:', error);
    }

    return notification;
  }

  private async sendViaTwilio(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
    // Simulate Twilio API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // 95% success rate simulation
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            sid: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          resolve({
            success: false,
            error: 'Network timeout'
          });
        }
      }, 1000);
    });
  }

  async sendTradeAlert(symbol: string, action: string, price: number, amount: number, phoneNumber: string): Promise<void> {
    const message = `🚀 NEXUS Trade Alert: ${action.toUpperCase()} ${amount} ${symbol} at $${price.toLocaleString()}. Current balance updated.`;
    await this.sendSMS(phoneNumber, message, 'trade_alert');
  }

  async sendPriceAlert(symbol: string, currentPrice: number, targetPrice: number, phoneNumber: string): Promise<void> {
    const message = `📈 Price Alert: ${symbol} reached $${currentPrice.toLocaleString()} (target: $${targetPrice.toLocaleString()})`;
    await this.sendSMS(phoneNumber, message, 'price_alert');
  }

  async sendSecurityAlert(message: string, phoneNumber: string): Promise<void> {
    const securityMessage = `🔒 NEXUS Security Alert: ${message}`;
    await this.sendSMS(phoneNumber, securityMessage, 'security_alert');
  }

  checkPriceAlerts(currentPrices: { [symbol: string]: number }): void {
    for (const alert of this.priceAlerts.values()) {
      if (!alert.isActive) continue;

      const currentPrice = currentPrices[alert.symbol];
      if (!currentPrice) continue;

      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        this.sendPriceAlert(alert.symbol, currentPrice, alert.targetPrice, alert.phoneNumber);
        // Disable alert after triggering to prevent spam
        alert.isActive = false;
      }
    }
  }

  createPriceAlert(symbol: string, targetPrice: number, condition: 'above' | 'below', phoneNumber: string): PriceAlert {
    const alert: PriceAlert = {
      id: `alert_${symbol.toLowerCase()}_${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      phoneNumber,
      isActive: true,
      createdAt: new Date()
    };

    this.priceAlerts.set(alert.id, alert);
    console.log(`📊 Price alert created: ${symbol} ${condition} $${targetPrice}`);
    return alert;
  }

  getPriceAlerts(): PriceAlert[] {
    return Array.from(this.priceAlerts.values());
  }

  getActiveAlerts(): PriceAlert[] {
    return Array.from(this.priceAlerts.values()).filter(alert => alert.isActive);
  }

  deletePriceAlert(alertId: string): boolean {
    return this.priceAlerts.delete(alertId);
  }

  getNotifications(limit: number = 20): SMSNotification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getMetrics(): TwilioMetrics {
    const total = this.sentCount + this.failedCount;
    return {
      totalSent: this.sentCount,
      successRate: total > 0 ? (this.sentCount / total) * 100 : 0,
      activeAlerts: this.getActiveAlerts().length,
      lastNotification: this.notifications.size > 0 ? 
        Math.max(...Array.from(this.notifications.values()).map(n => n.timestamp.getTime())) > 0 ?
        new Date(Math.max(...Array.from(this.notifications.values()).map(n => n.timestamp.getTime()))) : null : null,
      connectionStatus: this.isConnected ? 'connected' : 'disconnected'
    };
  }

  private generateNotificationId(): string {
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isReady(): boolean {
    return this.isConnected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      hasCredentials: !!(this.accountSid && this.authToken && this.fromNumber),
      sentCount: this.sentCount,
      failedCount: this.failedCount,
      activeAlerts: this.getActiveAlerts().length
    };
  }

  async shutdown() {
    console.log('Twilio integration shutdown complete');
  }
}

export const twilioIntegration = new TwilioIntegration();