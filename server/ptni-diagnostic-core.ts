import { robinhoodRealClient } from './robinhood-real-client';
import { cryptoTradingEngine } from './crypto-trading-engine';
import { ptniAnalyticsEngine } from './ptni-analytics-engine';

export interface SystemDiagnostic {
  timestamp: Date;
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  issue?: string;
  resolution?: string;
  metrics: Record<string, any>;
}

export interface DataSyncReport {
  robinhoodAccount: {
    realClient: any;
    legendClient: any;
    syncStatus: 'synced' | 'diverged' | 'error';
    lastSync: Date;
  };
  tradingEngine: {
    positions: any[];
    trades: any[];
    lastUpdate: Date;
  };
  ptniMetrics: {
    portfolioValue: number;
    lastCalculation: Date;
    confidence: number;
  };
}

export class PTNIDiagnosticCore {
  private diagnostics: SystemDiagnostic[] = [];
  private isRunning = false;
  private diagnosticInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startDiagnosticEngine();
  }

  private startDiagnosticEngine() {
    console.log('🔍 PTNI Diagnostic Core: Initializing system health monitoring...');
    
    this.isRunning = true;
    this.diagnosticInterval = setInterval(async () => {
      await this.runComprehensiveDiagnostics();
      await this.synchronizeDataSources();
      await this.validateSystemIntegrity();
    }, 3000); // Run every 3 seconds for real-time monitoring
    
    console.log('✅ PTNI Diagnostic Core: Real-time system monitoring active');
  }

  private async runComprehensiveDiagnostics() {
    const diagnostics: SystemDiagnostic[] = [];

    // Robinhood Account Diagnostic
    try {
      const account = robinhoodRealClient.getAccount();
      const isConnected = robinhoodRealClient.isConnected();
      
      if (!account) {
        diagnostics.push({
          timestamp: new Date(),
          component: 'Robinhood Account',
          status: 'critical',
          issue: 'No account data available',
          resolution: 'Refresh account connection',
          metrics: { connected: isConnected }
        });
      } else if (account.balance < 0) {
        diagnostics.push({
          timestamp: new Date(),
          component: 'Robinhood Account',
          status: 'warning',
          issue: 'Negative account balance detected',
          resolution: 'Review recent transactions',
          metrics: { balance: account.balance, connected: isConnected }
        });
      } else {
        diagnostics.push({
          timestamp: new Date(),
          component: 'Robinhood Account',
          status: 'healthy',
          metrics: { 
            balance: account.balance,
            connected: isConnected,
            lastUpdated: account.lastUpdated
          }
        });
      }
    } catch (error) {
      diagnostics.push({
        timestamp: new Date(),
        component: 'Robinhood Account',
        status: 'critical',
        issue: `Account access error: ${error}`,
        resolution: 'Verify credentials and connection',
        metrics: { error: String(error) }
      });
    }

    // Trading Engine Diagnostic
    try {
      const assets = cryptoTradingEngine.getCryptoAssets();
      const positions = cryptoTradingEngine.getCryptoPositions();
      const trades = cryptoTradingEngine.getCryptoTrades();
      
      if (assets.length === 0) {
        diagnostics.push({
          timestamp: new Date(),
          component: 'Trading Engine',
          status: 'warning',
          issue: 'No crypto assets loaded',
          resolution: 'Restart crypto trading engine',
          metrics: { assetsCount: 0, positionsCount: positions.length }
        });
      } else {
        diagnostics.push({
          timestamp: new Date(),
          component: 'Trading Engine',
          status: 'healthy',
          metrics: {
            assetsCount: assets.length,
            positionsCount: positions.length,
            tradesCount: trades.length,
            liveTrading: cryptoTradingEngine.isLiveTrading ? cryptoTradingEngine.isLiveTrading() : false
          }
        });
      }
    } catch (error) {
      diagnostics.push({
        timestamp: new Date(),
        component: 'Trading Engine',
        status: 'critical',
        issue: `Trading engine error: ${error}`,
        resolution: 'Restart trading services',
        metrics: { error: String(error) }
      });
    }

    // PTNI Analytics Diagnostic
    try {
      const status = ptniAnalyticsEngine.getAnalyticsStatus();
      const metrics = ptniAnalyticsEngine.getCurrentMetrics();
      
      if (!status.isRunning) {
        diagnostics.push({
          timestamp: new Date(),
          component: 'PTNI Analytics',
          status: 'critical',
          issue: 'Analytics engine not running',
          resolution: 'Restart PTNI analytics engine',
          metrics: status
        });
      } else if (metrics.confidenceLevel < 50) {
        diagnostics.push({
          timestamp: new Date(),
          component: 'PTNI Analytics',
          status: 'warning',
          issue: 'Low confidence level in analytics',
          resolution: 'Increase data quality and model training',
          metrics: { confidenceLevel: metrics.confidenceLevel, status }
        });
      } else {
        diagnostics.push({
          timestamp: new Date(),
          component: 'PTNI Analytics',
          status: 'healthy',
          metrics: {
            isRunning: status.isRunning,
            metricsCount: status.metricsCount,
            confidenceLevel: metrics.confidenceLevel,
            portfolioValue: metrics.portfolioValue
          }
        });
      }
    } catch (error) {
      diagnostics.push({
        timestamp: new Date(),
        component: 'PTNI Analytics',
        status: 'critical',
        issue: `Analytics error: ${error}`,
        resolution: 'Restart analytics engine',
        metrics: { error: String(error) }
      });
    }

    // Store diagnostics
    this.diagnostics.push(...diagnostics);
    if (this.diagnostics.length > 1000) {
      this.diagnostics = this.diagnostics.slice(-1000);
    }

    // Log critical issues
    diagnostics.forEach(diag => {
      if (diag.status === 'critical') {
        console.error(`🚨 CRITICAL: ${diag.component} - ${diag.issue}`);
        console.log(`💡 Resolution: ${diag.resolution}`);
      } else if (diag.status === 'warning') {
        console.warn(`⚠️ WARNING: ${diag.component} - ${diag.issue}`);
      }
    });
  }

  private async synchronizeDataSources() {
    try {
      // Force refresh of all data sources
      await robinhoodRealClient.refreshAccountData();
      
      // Get current data from all sources
      const account = robinhoodRealClient.getAccount();
      const positions = cryptoTradingEngine.getCryptoPositions();
      const trades = cryptoTradingEngine.getCryptoTrades();
      const ptniMetrics = ptniAnalyticsEngine.getCurrentMetrics();

      // Check for data consistency
      const accountBalance = account?.balance || 0;
      const ptniPortfolioValue = ptniMetrics.portfolioValue;
      
      if (Math.abs(accountBalance - ptniPortfolioValue) > 1) {
        console.log(`🔄 Data sync required: Account=${accountBalance}, PTNI=${ptniPortfolioValue}`);
        
        // Force PTNI to recalculate with fresh data
        await this.forcePTNIRecalculation();
      }

      console.log(`📊 Data sync check: Account=$${accountBalance}, PTNI=$${ptniPortfolioValue}`);
      
    } catch (error) {
      console.error(`❌ Data synchronization error: ${error}`);
    }
  }

  private async forcePTNIRecalculation() {
    try {
      // Trigger a fresh calculation in PTNI
      const freshMetrics = await ptniAnalyticsEngine.generateRealTimeMetrics();
      console.log(`🔄 PTNI recalculated: Portfolio value updated to $${freshMetrics?.portfolioValue || 0}`);
    } catch (error) {
      console.error(`❌ PTNI recalculation failed: ${error}`);
    }
  }

  private async validateSystemIntegrity() {
    const now = new Date();
    const recentDiagnostics = this.diagnostics.filter(d => 
      (now.getTime() - d.timestamp.getTime()) < 30000 // Last 30 seconds
    );

    const criticalIssues = recentDiagnostics.filter(d => d.status === 'critical');
    const warningIssues = recentDiagnostics.filter(d => d.status === 'warning');

    if (criticalIssues.length > 0) {
      console.log(`🚨 System Integrity: ${criticalIssues.length} critical issues detected`);
      await this.executeEmergencyProtocols();
    } else if (warningIssues.length > 3) {
      console.log(`⚠️ System Integrity: ${warningIssues.length} warning issues require attention`);
      await this.executeMaintenanceProtocols();
    } else {
      console.log(`✅ System Integrity: All systems operating normally`);
    }
  }

  private async executeEmergencyProtocols() {
    console.log('🛡️ Executing emergency protocols...');
    
    // Refresh all connections
    try {
      await robinhoodRealClient.refreshAccountData();
      console.log('✅ Robinhood connection refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh Robinhood connection');
    }

    // Force PTNI recalculation
    await this.forcePTNIRecalculation();
  }

  private async executeMaintenanceProtocols() {
    console.log('🔧 Executing maintenance protocols...');
    
    // Gentle data refresh
    await this.synchronizeDataSources();
    
    // Clear old diagnostics
    this.diagnostics = this.diagnostics.slice(-500);
  }

  async generateDataSyncReport(): Promise<DataSyncReport> {
    const account = robinhoodRealClient.getAccount();
    const positions = cryptoTradingEngine.getCryptoPositions();
    const trades = cryptoTradingEngine.getCryptoTrades();
    const ptniMetrics = ptniAnalyticsEngine.getCurrentMetrics();

    return {
      robinhoodAccount: {
        realClient: {
          balance: account?.balance || 0,
          connected: robinhoodRealClient.isConnected(),
          lastUpdated: account?.lastUpdated || new Date()
        },
        legendClient: null, // Legacy system
        syncStatus: 'synced',
        lastSync: new Date()
      },
      tradingEngine: {
        positions,
        trades,
        lastUpdate: new Date()
      },
      ptniMetrics: {
        portfolioValue: ptniMetrics.portfolioValue,
        lastCalculation: ptniMetrics.timestamp ? new Date(ptniMetrics.timestamp) : new Date(),
        confidence: ptniMetrics.confidenceLevel
      }
    };
  }

  getDiagnostics(limit: number = 50): SystemDiagnostic[] {
    return this.diagnostics.slice(-limit);
  }

  getCriticalIssues(): SystemDiagnostic[] {
    return this.diagnostics.filter(d => d.status === 'critical').slice(-10);
  }

  getSystemHealth(): { 
    overall: 'healthy' | 'warning' | 'critical';
    components: Record<string, 'healthy' | 'warning' | 'critical'>;
    lastCheck: Date;
  } {
    const recentDiagnostics = this.diagnostics.slice(-20);
    const componentStatus: Record<string, 'healthy' | 'warning' | 'critical'> = {};
    
    // Get latest status for each component
    const components = [...new Set(recentDiagnostics.map(d => d.component))];
    components.forEach(component => {
      const latestDiag = recentDiagnostics
        .filter(d => d.component === component)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      if (latestDiag) {
        componentStatus[component] = latestDiag.status;
      }
    });

    // Determine overall health
    const statuses = Object.values(componentStatus);
    const overall = statuses.includes('critical') ? 'critical' :
                   statuses.includes('warning') ? 'warning' : 'healthy';

    return {
      overall,
      components: componentStatus,
      lastCheck: new Date()
    };
  }

  async shutdown() {
    if (this.diagnosticInterval) {
      clearInterval(this.diagnosticInterval);
      this.diagnosticInterval = null;
    }
    this.isRunning = false;
    console.log('🔍 PTNI Diagnostic Core: Shutdown complete');
  }
}

export const ptniDiagnosticCore = new PTNIDiagnosticCore();