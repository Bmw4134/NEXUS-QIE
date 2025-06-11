/**
 * NEXUS Centralized Monitoring Service
 * Comprehensive system monitoring, health checks, and alerting
 */

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
  errorCount: number;
  metrics: Record<string, any>;
  dependencies: string[];
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  acknowledgedBy?: string;
  metadata: Record<string, any>;
}

export interface PerformanceMetric {
  service: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold?: number;
}

export interface MonitoringConfig {
  checkInterval: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    uptimePercentage: number;
    memoryUsage: number;
  };
  retentionDays: number;
  enableAlerts: boolean;
}

export class MonitoringService {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: SystemAlert[] = [];
  private metrics: PerformanceMetric[] = [];
  private config: MonitoringConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  constructor() {
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        responseTime: 5000, // 5 seconds
        errorRate: 0.05, // 5%
        uptimePercentage: 95,
        memoryUsage: 0.85 // 85%
      },
      retentionDays: 30,
      enableAlerts: true
    };
    
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    console.log('🔍 Initializing NEXUS Monitoring Service...');
    
    // Register core services for monitoring
    this.registerService('nexus-api', ['database', 'redis']);
    this.registerService('trading-engine', ['robinhood-api', 'market-data']);
    this.registerService('quantum-database', []);
    this.registerService('real-market-data', ['coingecko-api']);
    this.registerService('robinhood-balance-sync', ['robinhood-api']);
    this.registerService('qnis-core', ['websocket', 'quantum-database']);
    this.registerService('trello-integration', ['trello-api']);
    this.registerService('twilio-integration', ['twilio-api']);
    this.registerService('github-brain', ['github-api']);
    
    this.startMonitoring();
    console.log('✅ Monitoring service initialized');
  }

  private registerService(serviceName: string, dependencies: string[] = []) {
    this.healthChecks.set(serviceName, {
      service: serviceName,
      status: 'unknown',
      responseTime: 0,
      lastCheck: new Date(),
      uptime: 0,
      errorCount: 0,
      metrics: {},
      dependencies
    });
  }

  private startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.checkInterval);
  }

  private async performHealthChecks() {
    const promises = Array.from(this.healthChecks.keys()).map(service => 
      this.checkServiceHealth(service)
    );
    
    await Promise.allSettled(promises);
    this.cleanupOldData();
  }

  private async checkServiceHealth(serviceName: string): Promise<void> {
    const startTime = Date.now();
    const healthCheck = this.healthChecks.get(serviceName);
    
    if (!healthCheck) return;

    try {
      const result = await this.executeHealthCheck(serviceName);
      const responseTime = Date.now() - startTime;
      
      healthCheck.status = result.status;
      healthCheck.responseTime = responseTime;
      healthCheck.lastCheck = new Date();
      healthCheck.metrics = result.metrics;
      
      // Calculate uptime
      const totalTime = Date.now() - this.startTime;
      const healthyTime = totalTime - (healthCheck.errorCount * this.config.checkInterval);
      healthCheck.uptime = Math.max(0, (healthyTime / totalTime) * 100);
      
      // Check thresholds and generate alerts
      this.checkThresholds(healthCheck);
      
      // Record performance metrics
      this.recordMetric(serviceName, 'response_time', responseTime, 'ms');
      this.recordMetric(serviceName, 'uptime', healthCheck.uptime, '%');
      
    } catch (error) {
      healthCheck.status = 'unhealthy';
      healthCheck.errorCount++;
      healthCheck.lastCheck = new Date();
      
      this.createAlert('critical', serviceName, 
        `Health check failed: ${error}`, { error: error });
    }
  }

  private async executeHealthCheck(serviceName: string): Promise<{
    status: HealthCheck['status'];
    metrics: Record<string, any>;
  }> {
    switch (serviceName) {
      case 'nexus-api':
        return this.checkNexusAPI();
      case 'trading-engine':
        return this.checkTradingEngine();
      case 'quantum-database':
        return this.checkQuantumDatabase();
      case 'real-market-data':
        return this.checkMarketData();
      case 'robinhood-balance-sync':
        return this.checkRobinhoodSync();
      case 'qnis-core':
        return this.checkQNISCore();
      case 'trello-integration':
        return this.checkTrelloIntegration();
      case 'twilio-integration':
        return this.checkTwilioIntegration();
      case 'github-brain':
        return this.checkGitHubBrain();
      default:
        return { status: 'unknown', metrics: {} };
    }
  }

  private async checkNexusAPI(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      return {
        status: 'healthy',
        metrics: {
          memory: {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            external: memUsage.external
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: process.uptime()
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkTradingEngine(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { liveTradingEngine } = await import('./live-trading-engine');
      const session = liveTradingEngine.getSessionStatus();
      
      return {
        status: session.isActive ? 'healthy' : 'degraded',
        metrics: {
          isActive: session.isActive,
          balance: session.accountBalance,
          totalTrades: session.totalTrades,
          realMode: session.realMoneyMode
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkQuantumDatabase(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      // Simulate database connectivity check
      return {
        status: 'healthy',
        metrics: {
          connections: 5,
          queryTime: Math.random() * 100,
          cacheHitRate: 0.85
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkMarketData(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { realMarketDataService } = await import('./real-market-data');
      const status = realMarketDataService.getServiceStatus();
      
      return {
        status: status.connected ? 'healthy' : 'degraded',
        metrics: {
          connected: status.connected,
          lastUpdate: status.lastUpdate,
          dataPoints: status.cryptoAssets
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkRobinhoodSync(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { robinhoodBalanceSync } = await import('./robinhood-balance-sync');
      const syncStatus = robinhoodBalanceSync.getSyncStatus();
      
      return {
        status: syncStatus.isConnected ? 'healthy' : 'degraded',
        metrics: {
          connected: syncStatus.isConnected,
          balance: syncStatus.currentBalance,
          lastSync: syncStatus.lastSync,
          hasCredentials: syncStatus.hasCredentials
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkQNISCore(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { qnisCoreEngine } = await import('./qnis-core-engine');
      const status = qnisCoreEngine.getEngineStatus();
      
      return {
        status: status.initialized ? 'healthy' : 'degraded',
        metrics: {
          initialized: status.initialized,
          clients: status.connectedClients,
          features: status.activeFeatures
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkTrelloIntegration(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { trelloIntegration } = await import('./trello-integration');
      const connectionStatus = trelloIntegration.getConnectionStatus();
      
      return {
        status: connectionStatus.connected ? 'healthy' : 'inactive',
        metrics: {
          connected: connectionStatus.connected,
          hasCredentials: connectionStatus.hasCredentials,
          boardCount: connectionStatus.boardCount
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkTwilioIntegration(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { twilioIntegration } = await import('./twilio-integration');
      const connectionStatus = twilioIntegration.getConnectionStatus();
      
      return {
        status: connectionStatus.connected ? 'healthy' : 'inactive',
        metrics: {
          connected: connectionStatus.connected,
          hasCredentials: connectionStatus.hasCredentials,
          sentCount: connectionStatus.sentCount,
          activeAlerts: connectionStatus.activeAlerts
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private async checkGitHubBrain(): Promise<{ status: HealthCheck['status']; metrics: Record<string, any> }> {
    try {
      const { githubBrain } = await import('./github-brain-integration');
      
      return {
        status: 'healthy',
        metrics: {
          repositories: 0,
          lastAnalysis: new Date()
        }
      };
    } catch (error) {
      return { status: 'unhealthy', metrics: { error: error } };
    }
  }

  private checkThresholds(healthCheck: HealthCheck) {
    const thresholds = this.config.alertThresholds;
    
    // Response time threshold
    if (healthCheck.responseTime > thresholds.responseTime) {
      this.createAlert('warning', healthCheck.service,
        `High response time: ${healthCheck.responseTime}ms`, 
        { responseTime: healthCheck.responseTime, threshold: thresholds.responseTime });
    }
    
    // Uptime threshold
    if (healthCheck.uptime < thresholds.uptimePercentage) {
      this.createAlert('critical', healthCheck.service,
        `Low uptime: ${healthCheck.uptime.toFixed(1)}%`,
        { uptime: healthCheck.uptime, threshold: thresholds.uptimePercentage });
    }
    
    // Memory usage (for nexus-api)
    if (healthCheck.service === 'nexus-api' && healthCheck.metrics.memory) {
      const memoryUsage = healthCheck.metrics.memory.used / healthCheck.metrics.memory.total;
      if (memoryUsage > thresholds.memoryUsage) {
        this.createAlert('warning', healthCheck.service,
          `High memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
          { memoryUsage, threshold: thresholds.memoryUsage });
      }
    }
  }

  private createAlert(severity: SystemAlert['severity'], service: string, 
                     message: string, metadata: Record<string, any> = {}) {
    if (!this.config.enableAlerts) return;
    
    const alert: SystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      severity,
      service,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata
    };
    
    this.alerts.unshift(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 500);
    }
    
    console.log(`🚨 ${severity.toUpperCase()} Alert [${service}]: ${message}`);
  }

  private recordMetric(service: string, metric: string, value: number, unit: string) {
    this.metrics.push({
      service,
      metric,
      value,
      unit,
      timestamp: new Date()
    });
    
    // Keep only recent metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  private cleanupOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    // Cleanup old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffDate);
    
    // Cleanup old metrics
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffDate);
  }

  getSystemOverview() {
    const healthChecksArray = Array.from(this.healthChecks.values());
    const healthyCount = healthChecksArray.filter(hc => hc.status === 'healthy').length;
    const totalServices = healthChecksArray.length;
    
    const recentAlerts = this.alerts.filter(alert => 
      Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    
    return {
      overallHealth: Math.round((healthyCount / totalServices) * 100),
      totalServices,
      healthyServices: healthyCount,
      degradedServices: healthChecksArray.filter(hc => hc.status === 'degraded').length,
      unhealthyServices: healthChecksArray.filter(hc => hc.status === 'unhealthy').length,
      recentAlerts: recentAlerts.length,
      criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      lastCheck: new Date()
    };
  }

  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  getAlerts(limit: number = 50): SystemAlert[] {
    return this.alerts.slice(0, limit);
  }

  getMetrics(service?: string, metric?: string, hours: number = 24): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return this.metrics.filter(m => {
      if (m.timestamp < cutoff) return false;
      if (service && m.service !== service) return false;
      if (metric && m.metric !== metric) return false;
      return true;
    });
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  updateConfig(newConfig: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new interval if changed
    if (newConfig.checkInterval && this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.startMonitoring();
    }
  }

  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('Monitoring service shutdown complete');
  }
}

export const monitoringService = new MonitoringService();