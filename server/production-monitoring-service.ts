
/**
 * NEXUS Production Monitoring Service
 * Enterprise-grade monitoring, alerting, and performance tracking
 */

import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import { productionDatabase } from './production-database-layer';

export interface MonitoringAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  metadata: Record<string, any>;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  dependencies: string[];
  metrics: Record<string, number>;
}

export interface PerformanceMetric {
  service: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface AlertingConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  webhookEnabled: boolean;
  emailRecipients: string[];
  smsRecipients: string[];
  webhookUrl: string;
  alertCooldown: number; // minutes
}

export class ProductionMonitoringService extends EventEmitter {
  private static instance: ProductionMonitoringService;
  private alerts: Map<string, MonitoringAlert> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private metrics: PerformanceMetric[] = [];
  private alertConfig: AlertingConfig;
  private emailTransporter: any;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCooldowns: Map<string, Date> = new Map();

  private constructor() {
    super();
    this.alertConfig = {
      emailEnabled: !!process.env.SMTP_HOST,
      smsEnabled: !!process.env.TWILIO_SID,
      webhookEnabled: !!process.env.ALERT_WEBHOOK_URL,
      emailRecipients: (process.env.ALERT_EMAILS || '').split(',').filter(Boolean),
      smsRecipients: (process.env.ALERT_PHONES || '').split(',').filter(Boolean),
      webhookUrl: process.env.ALERT_WEBHOOK_URL || '',
      alertCooldown: parseInt(process.env.ALERT_COOLDOWN_MINUTES || '15')
    };

    this.initializeMonitoring();
    this.setupEmailTransporter();
  }

  static getInstance(): ProductionMonitoringService {
    if (!ProductionMonitoringService.instance) {
      ProductionMonitoringService.instance = new ProductionMonitoringService();
    }
    return ProductionMonitoringService.instance;
  }

  private initializeMonitoring() {
    console.log('🔍 Initializing Production Monitoring Service...');
    
    // Register core services
    this.registerService('nexus-api', ['database', 'redis'], {
      responseTimeThreshold: 2000,
      errorRateThreshold: 0.05,
      uptimeThreshold: 99.0
    });

    this.registerService('trading-engine', ['market-data', 'auth'], {
      responseTimeThreshold: 1000,
      errorRateThreshold: 0.01,
      uptimeThreshold: 99.9
    });

    this.registerService('database', [], {
      responseTimeThreshold: 500,
      errorRateThreshold: 0.001,
      uptimeThreshold: 99.95
    });

    this.registerService('market-data', ['external-apis'], {
      responseTimeThreshold: 3000,
      errorRateThreshold: 0.1,
      uptimeThreshold: 98.0
    });

    this.registerService('auth-service', ['database'], {
      responseTimeThreshold: 1000,
      errorRateThreshold: 0.01,
      uptimeThreshold: 99.9
    });

    // Start monitoring
    this.startMonitoring();
    console.log('✅ Production monitoring initialized');
  }

  private registerService(name: string, dependencies: string[], thresholds: any) {
    this.serviceHealth.set(name, {
      service: name,
      status: 'unknown',
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      lastCheck: new Date(),
      dependencies,
      metrics: {}
    });
  }

  private startMonitoring() {
    // Check every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);

    // Performance metrics collection every 10 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 10000);

    // Alert cleanup every hour
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 60 * 60 * 1000);
  }

  private async performHealthChecks() {
    const services = Array.from(this.serviceHealth.keys());
    
    for (const service of services) {
      await this.checkServiceHealth(service);
    }
  }

  private async checkServiceHealth(serviceName: string) {
    const startTime = Date.now();
    const health = this.serviceHealth.get(serviceName);
    if (!health) return;

    try {
      const result = await this.executeHealthCheck(serviceName);
      const responseTime = Date.now() - startTime;
      
      // Update health status
      health.status = result.status;
      health.responseTime = responseTime;
      health.lastCheck = new Date();
      health.metrics = { ...health.metrics, ...result.metrics };

      // Calculate uptime (simplified)
      if (result.status === 'healthy') {
        health.uptime = Math.min(100, health.uptime + 0.1);
      } else {
        health.uptime = Math.max(0, health.uptime - 1);
      }

      // Check thresholds and create alerts
      this.checkThresholds(health);

      // Store metrics in database
      await this.storeMetrics(serviceName, responseTime, result.metrics);

    } catch (error) {
      health.status = 'unhealthy';
      health.errorRate = Math.min(1, health.errorRate + 0.1);
      health.lastCheck = new Date();

      await this.createAlert('critical', serviceName, 'health_check_failed', 0, 1, 
        `Health check failed: ${error}`, { error: error?.toString() });
    }
  }

  private async executeHealthCheck(serviceName: string): Promise<{
    status: ServiceHealth['status'];
    metrics: Record<string, number>;
  }> {
    switch (serviceName) {
      case 'nexus-api':
        return this.checkNexusAPI();
      case 'trading-engine':
        return this.checkTradingEngine();
      case 'database':
        return this.checkDatabase();
      case 'market-data':
        return this.checkMarketData();
      case 'auth-service':
        return this.checkAuthService();
      default:
        return { status: 'unknown', metrics: {} };
    }
  }

  private async checkNexusAPI(): Promise<{ status: ServiceHealth['status']; metrics: Record<string, number> }> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const memoryUtilization = memUsage.heapUsed / memUsage.heapTotal;
      const status = memoryUtilization > 0.9 ? 'degraded' : 'healthy';
      
      return {
        status,
        metrics: {
          memoryUsed: memUsage.heapUsed,
          memoryTotal: memUsage.heapTotal,
          memoryUtilization,
          cpuUser: cpuUsage.user,
          cpuSystem: cpuUsage.system,
          uptime: process.uptime()
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: {} };
    }
  }

  private async checkTradingEngine(): Promise<{ status: ServiceHealth['status']; metrics: Record<string, number> }> {
    try {
      // Check if trading engine is responsive
      const { liveTradingEngine } = await import('./live-trading-engine');
      const session = liveTradingEngine.getSessionStatus();
      
      return {
        status: session.isActive ? 'healthy' : 'degraded',
        metrics: {
          isActive: session.isActive ? 1 : 0,
          accountBalance: session.accountBalance,
          totalTrades: session.totalTrades,
          successfulTrades: session.successfulTrades
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: {} };
    }
  }

  private async checkDatabase(): Promise<{ status: ServiceHealth['status']; metrics: Record<string, number> }> {
    try {
      const healthData = await productionDatabase.getConnectionHealth();
      const metrics = productionDatabase.getMetrics();
      
      const status = healthData.status === 'healthy' && metrics.failedQueries < 10 ? 'healthy' : 'degraded';
      
      return {
        status,
        metrics: {
          totalConnections: healthData.totalConnections,
          activeConnections: healthData.activeConnections,
          totalQueries: metrics.totalQueries,
          avgResponseTime: metrics.avgResponseTime,
          failedQueries: metrics.failedQueries
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: {} };
    }
  }

  private async checkMarketData(): Promise<{ status: ServiceHealth['status']; metrics: Record<string, number> }> {
    try {
      const { realMarketDataService } = await import('./real-market-data');
      const status = realMarketDataService.getServiceStatus();
      
      return {
        status: status.connected ? 'healthy' : 'degraded',
        metrics: {
          connected: status.connected ? 1 : 0,
          dataPoints: status.cryptoAssets || 0,
          lastUpdateAge: status.lastUpdate ? (Date.now() - new Date(status.lastUpdate).getTime()) / 1000 : 999999
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: {} };
    }
  }

  private async checkAuthService(): Promise<{ status: ServiceHealth['status']; metrics: Record<string, number> }> {
    try {
      const { productionAuthService } = await import('./production-auth-service');
      const sessionMetrics = productionAuthService.getSessionMetrics();
      
      return {
        status: 'healthy',
        metrics: {
          activeSessions: sessionMetrics.activeSessions,
          uniqueUsers: sessionMetrics.uniqueUsers || 0
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: {} };
    }
  }

  private checkThresholds(health: ServiceHealth) {
    // Response time threshold
    if (health.responseTime > 2000) {
      this.createAlert('warning', health.service, 'high_response_time', 2000, health.responseTime,
        `High response time: ${health.responseTime}ms`);
    }

    // Uptime threshold
    if (health.uptime < 99.0) {
      this.createAlert('critical', health.service, 'low_uptime', 99.0, health.uptime,
        `Low uptime: ${health.uptime.toFixed(1)}%`);
    }

    // Error rate threshold
    if (health.errorRate > 0.05) {
      this.createAlert('warning', health.service, 'high_error_rate', 0.05, health.errorRate,
        `High error rate: ${(health.errorRate * 100).toFixed(1)}%`);
    }

    // Service-specific thresholds
    if (health.service === 'nexus-api' && health.metrics.memoryUtilization > 0.85) {
      this.createAlert('warning', health.service, 'high_memory_usage', 0.85, health.metrics.memoryUtilization,
        `High memory usage: ${(health.metrics.memoryUtilization * 100).toFixed(1)}%`);
    }
  }

  async createAlert(
    severity: MonitoringAlert['severity'],
    service: string,
    metric: string,
    threshold: number,
    currentValue: number,
    message: string,
    metadata: Record<string, any> = {}
  ) {
    const alertKey = `${service}-${metric}`;
    
    // Check cooldown
    const lastAlert = this.alertCooldowns.get(alertKey);
    if (lastAlert && Date.now() - lastAlert.getTime() < this.alertConfig.alertCooldown * 60 * 1000) {
      return; // Skip alert due to cooldown
    }

    const alert: MonitoringAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      severity,
      service,
      metric,
      threshold,
      currentValue,
      message,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      metadata
    };

    this.alerts.set(alert.id, alert);
    this.alertCooldowns.set(alertKey, new Date());

    // Send notifications
    await this.sendAlertNotifications(alert);

    // Store in database
    await this.storeAlert(alert);

    // Emit event
    this.emit('alert', alert);

    console.log(`🚨 ${severity.toUpperCase()} Alert [${service}]: ${message}`);
  }

  private async sendAlertNotifications(alert: MonitoringAlert) {
    if (alert.severity === 'info') return; // Don't send notifications for info alerts

    try {
      // Email notifications
      if (this.alertConfig.emailEnabled && this.alertConfig.emailRecipients.length > 0) {
        await this.sendEmailAlert(alert);
      }

      // Webhook notifications
      if (this.alertConfig.webhookEnabled) {
        await this.sendWebhookAlert(alert);
      }

      // SMS notifications for critical alerts
      if (alert.severity === 'critical' && this.alertConfig.smsEnabled) {
        await this.sendSMSAlert(alert);
      }
    } catch (error) {
      console.error('Failed to send alert notifications:', error);
    }
  }

  private async sendEmailAlert(alert: MonitoringAlert) {
    if (!this.emailTransporter) return;

    const subject = `[NEXUS ${alert.severity.toUpperCase()}] ${alert.service} - ${alert.message}`;
    const html = `
      <h3>NEXUS Production Alert</h3>
      <p><strong>Service:</strong> ${alert.service}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Metric:</strong> ${alert.metric}</p>
      <p><strong>Current Value:</strong> ${alert.currentValue}</p>
      <p><strong>Threshold:</strong> ${alert.threshold}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
      <p><strong>Metadata:</strong> ${JSON.stringify(alert.metadata, null, 2)}</p>
    `;

    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'alerts@nexus.ai',
      to: this.alertConfig.emailRecipients.join(','),
      subject,
      html
    });
  }

  private async sendWebhookAlert(alert: MonitoringAlert) {
    const payload = {
      alert_id: alert.id,
      severity: alert.severity,
      service: alert.service,
      metric: alert.metric,
      message: alert.message,
      threshold: alert.threshold,
      current_value: alert.currentValue,
      timestamp: alert.timestamp.toISOString(),
      metadata: alert.metadata
    };

    await fetch(this.alertConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  private async sendSMSAlert(alert: MonitoringAlert) {
    // Implementation would use Twilio or similar SMS service
    console.log(`SMS Alert would be sent: ${alert.message}`);
  }

  private setupEmailTransporter() {
    if (!process.env.SMTP_HOST) return;

    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  private async collectPerformanceMetrics() {
    const timestamp = new Date();
    
    // System metrics
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.recordMetric('system', 'memory_used', memUsage.heapUsed, 'bytes', timestamp);
    this.recordMetric('system', 'memory_total', memUsage.heapTotal, 'bytes', timestamp);
    this.recordMetric('system', 'cpu_user', cpuUsage.user, 'microseconds', timestamp);
    this.recordMetric('system', 'cpu_system', cpuUsage.system, 'microseconds', timestamp);

    // Database metrics
    try {
      const dbMetrics = productionDatabase.getMetrics();
      this.recordMetric('database', 'total_queries', dbMetrics.totalQueries, 'count', timestamp);
      this.recordMetric('database', 'avg_response_time', dbMetrics.avgResponseTime, 'ms', timestamp);
      this.recordMetric('database', 'failed_queries', dbMetrics.failedQueries, 'count', timestamp);
    } catch (error) {
      // Database metrics unavailable
    }
  }

  private recordMetric(service: string, metric: string, value: number, unit: string, timestamp: Date) {
    const performanceMetric: PerformanceMetric = {
      service,
      metric,
      value,
      unit,
      timestamp,
      tags: { environment: process.env.NODE_ENV || 'development' }
    };

    this.metrics.push(performanceMetric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  private async storeMetrics(service: string, responseTime: number, metrics: Record<string, number>) {
    try {
      await productionDatabase.storeSystemMetric({
        service,
        metric_name: 'response_time',
        value: responseTime,
        unit: 'ms',
        metadata: metrics
      });
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  private async storeAlert(alert: MonitoringAlert) {
    try {
      await productionDatabase.query(`
        INSERT INTO alerts (id, severity, service, metric, threshold, current_value, message, timestamp, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        alert.id,
        alert.severity,
        alert.service,
        alert.metric,
        alert.threshold,
        alert.currentValue,
        alert.message,
        alert.timestamp,
        JSON.stringify(alert.metadata)
      ]);
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  private cleanupOldAlerts() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.timestamp < cutoff) {
        this.alerts.delete(id);
      }
    }
  }

  // Public API methods
  getSystemOverview() {
    const services = Array.from(this.serviceHealth.values());
    const alerts = Array.from(this.alerts.values());
    
    return {
      totalServices: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length,
      degradedServices: services.filter(s => s.status === 'degraded').length,
      unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
      warningAlerts: alerts.filter(a => a.severity === 'warning' && !a.resolved).length,
      overallHealth: Math.round((services.filter(s => s.status === 'healthy').length / services.length) * 100),
      lastCheck: new Date()
    };
  }

  getServiceHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  getAlerts(limit: number = 50): MonitoringAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.metadata.acknowledgedBy = acknowledgedBy;
      alert.metadata.acknowledgedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.metadata.resolvedBy = resolvedBy;
      alert.metadata.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  getMetrics(service?: string, hours: number = 24): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return this.metrics.filter(m => {
      if (m.timestamp < cutoff) return false;
      if (service && m.service !== service) return false;
      return true;
    });
  }

  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('Production monitoring service shutdown complete');
  }
}

export const productionMonitoring = ProductionMonitoringService.getInstance();
