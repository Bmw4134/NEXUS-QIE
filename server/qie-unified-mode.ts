/**
 * QIE Unified Mode - Cross-Dashboard Integration
 * Embeds QIE panels across all dashboards with ops daemon and signal mirroring
 */

import { EventEmitter } from 'events';
import { qieSystemCore } from './qie-system-core';
import { qnisCoreEngine } from './qnis-core-engine';

interface QIEEmbeddedPanel {
  id: string;
  type: 'mini_intelligence' | 'signal_feed' | 'prompt_assist' | 'ops_daemon';
  position: 'top_right' | 'bottom_left' | 'sidebar' | 'floating';
  dashboard: string;
  isActive: boolean;
  lastUpdate: Date;
  config: {
    width: number;
    height: number;
    opacity: number;
    autoHide: boolean;
    refreshInterval: number;
  };
}

interface OpsDaemonStatus {
  isRunning: boolean;
  processedSignals: number;
  activeMirrors: number;
  lastHealthCheck: Date;
  systemLoad: number;
  memoryUsage: number;
  networkLatency: number;
}

interface UnifiedModeConfig {
  enabled: boolean;
  globalSignalMirroring: boolean;
  crossDashboardSync: boolean;
  embeddedPanelsActive: boolean;
  opsDaemonRunning: boolean;
  realTimeMode: boolean;
  maxConcurrentPanels: number;
}

export class QIEUnifiedMode extends EventEmitter {
  private config: UnifiedModeConfig;
  private embeddedPanels: Map<string, QIEEmbeddedPanel> = new Map();
  private opsDaemon: OpsDaemonStatus;
  private signalMirrorInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    super();
    
    this.config = {
      enabled: false,
      globalSignalMirroring: true,
      crossDashboardSync: true,
      embeddedPanelsActive: false,
      opsDaemonRunning: false,
      realTimeMode: true,
      maxConcurrentPanels: 12
    };

    this.opsDaemon = {
      isRunning: false,
      processedSignals: 0,
      activeMirrors: 0,
      lastHealthCheck: new Date(),
      systemLoad: 0,
      memoryUsage: 0,
      networkLatency: 0
    };

    this.initializeUnifiedMode();
  }

  private async initializeUnifiedMode() {
    console.log('🌐 Initializing QIE Unified Mode...');
    
    await this.setupEmbeddedPanels();
    await this.startOpsDaemon();
    await this.enableGlobalSignalMirroring();
    await this.activateCrossDashboardSync();
    
    this.config.enabled = true;
    this.isInitialized = true;
    
    console.log('✅ QIE Unified Mode activated across all dashboards');
    this.emit('unified_mode_activated');
  }

  private async setupEmbeddedPanels() {
    const dashboards = [
      'enhanced_dashboard',
      'smart_planner',
      'wealth_pulse',
      'quantum_insights',
      'nexus_notes',
      'family_sync',
      'family_boards',
      'canvas_boards',
      'ai_configuration',
      'qnis_admin'
    ];

    for (const dashboard of dashboards) {
      // Mini Intelligence Panel
      const intelligencePanel: QIEEmbeddedPanel = {
        id: `${dashboard}_intelligence`,
        type: 'mini_intelligence',
        position: 'top_right',
        dashboard,
        isActive: true,
        lastUpdate: new Date(),
        config: {
          width: 300,
          height: 200,
          opacity: 0.95,
          autoHide: false,
          refreshInterval: 5000
        }
      };

      // Signal Feed Panel
      const signalPanel: QIEEmbeddedPanel = {
        id: `${dashboard}_signals`,
        type: 'signal_feed',
        position: 'bottom_left',
        dashboard,
        isActive: true,
        lastUpdate: new Date(),
        config: {
          width: 400,
          height: 150,
          opacity: 0.9,
          autoHide: true,
          refreshInterval: 3000
        }
      };

      // Ops Daemon Panel
      const opsPanel: QIEEmbeddedPanel = {
        id: `${dashboard}_ops`,
        type: 'ops_daemon',
        position: 'floating',
        dashboard,
        isActive: true,
        lastUpdate: new Date(),
        config: {
          width: 250,
          height: 100,
          opacity: 0.8,
          autoHide: true,
          refreshInterval: 2000
        }
      };

      this.embeddedPanels.set(intelligencePanel.id, intelligencePanel);
      this.embeddedPanels.set(signalPanel.id, signalPanel);
      this.embeddedPanels.set(opsPanel.id, opsPanel);
    }

    this.config.embeddedPanelsActive = true;
    console.log(`📱 Embedded panels deployed across ${dashboards.length} dashboards`);
  }

  private async startOpsDaemon() {
    this.opsDaemon.isRunning = true;
    this.config.opsDaemonRunning = true;

    // Start health monitoring
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 10000);

    // Start signal processing
    this.signalMirrorInterval = setInterval(async () => {
      await this.processGlobalSignals();
    }, 2000);

    console.log('⚙️ QIE Ops Daemon started with health monitoring');
  }

  private async performHealthCheck() {
    this.opsDaemon.lastHealthCheck = new Date();
    
    // Simulate system metrics
    this.opsDaemon.systemLoad = Math.random() * 100;
    this.opsDaemon.memoryUsage = Math.random() * 100;
    this.opsDaemon.networkLatency = Math.random() * 50 + 10;
    
    // Get actual metrics from QIE System Core
    const qieStatus = qieSystemCore.getQIEStatus();
    if (qieStatus.mirrors) {
      this.opsDaemon.activeMirrors = qieStatus.mirrors.filter((m: any) => m.status === 'connected').length;
    }

    // Update processed signals count
    const signalMetrics = qieSystemCore.getSignalMetrics();
    this.opsDaemon.processedSignals = signalMetrics.processedSignals || 0;

    this.emit('health_check', this.opsDaemon);
  }

  private async processGlobalSignals() {
    const recentSignals = qieSystemCore.getRecentSignals(10);
    
    if (recentSignals.length > 0) {
      // Process signals for cross-dashboard distribution
      const processedSignals = recentSignals.map(signal => ({
        ...signal,
        processedAt: new Date(),
        distributionTargets: Array.from(this.embeddedPanels.keys())
          .filter(id => id.includes('signals'))
      }));

      // Emit to all embedded signal panels
      this.emit('global_signals', processedSignals);
      
      // Update panel timestamps
      for (const [id, panel] of Array.from(this.embeddedPanels.entries())) {
        if (panel.type === 'signal_feed') {
          panel.lastUpdate = new Date();
        }
      }
    }
  }

  private async enableGlobalSignalMirroring() {
    this.config.globalSignalMirroring = true;
    
    // Connect to QIE System Core events
    qieSystemCore.on('signal', (signal) => {
      this.distributeSignalToEmbeddedPanels(signal);
    });

    qieSystemCore.on('batch_cognition', (analysis) => {
      this.distributeCognitionToIntelligencePanels(analysis);
    });

    console.log('🔄 Global signal mirroring enabled across all dashboards');
  }

  private async activateCrossDashboardSync() {
    this.config.crossDashboardSync = true;
    
    // Sync panel states across dashboards
    setInterval(() => {
      this.syncPanelStates();
    }, 5000);

    console.log('🔗 Cross-dashboard synchronization activated');
  }

  private distributeSignalToEmbeddedPanels(signal: any) {
    const signalPanels = Array.from(this.embeddedPanels.values())
      .filter(panel => panel.type === 'signal_feed' && panel.isActive);

    for (const panel of signalPanels) {
      this.emit(`panel_signal_${panel.id}`, signal);
    }
  }

  private distributeCognitionToIntelligencePanels(analysis: any) {
    const intelligencePanels = Array.from(this.embeddedPanels.values())
      .filter(panel => panel.type === 'mini_intelligence' && panel.isActive);

    for (const panel of intelligencePanels) {
      this.emit(`panel_cognition_${panel.id}`, analysis);
    }
  }

  private syncPanelStates() {
    const panelStates = Array.from(this.embeddedPanels.values()).map(panel => ({
      id: panel.id,
      dashboard: panel.dashboard,
      isActive: panel.isActive,
      lastUpdate: panel.lastUpdate
    }));

    this.emit('panel_sync', panelStates);
  }

  // Public API Methods

  async activateUnifiedMode(): Promise<boolean> {
    if (this.config.enabled) {
      console.log('⚠️ QIE Unified Mode already active');
      return true;
    }

    try {
      await this.initializeUnifiedMode();
      return true;
    } catch (error) {
      console.error('❌ Failed to activate QIE Unified Mode:', error);
      return false;
    }
  }

  async deactivateUnifiedMode(): Promise<boolean> {
    try {
      this.config.enabled = false;
      this.config.embeddedPanelsActive = false;
      this.config.opsDaemonRunning = false;

      if (this.signalMirrorInterval) {
        clearInterval(this.signalMirrorInterval);
        this.signalMirrorInterval = null;
      }

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      this.opsDaemon.isRunning = false;
      
      console.log('🔴 QIE Unified Mode deactivated');
      this.emit('unified_mode_deactivated');
      return true;
    } catch (error) {
      console.error('❌ Failed to deactivate QIE Unified Mode:', error);
      return false;
    }
  }

  getUnifiedModeStatus(): any {
    return {
      config: this.config,
      opsDaemon: this.opsDaemon,
      embeddedPanels: Array.from(this.embeddedPanels.values()),
      isInitialized: this.isInitialized,
      activePanelCount: Array.from(this.embeddedPanels.values()).filter(p => p.isActive).length
    };
  }

  getEmbeddedPanelData(panelId: string): any {
    const panel = this.embeddedPanels.get(panelId);
    if (!panel) return null;

    switch (panel.type) {
      case 'mini_intelligence':
        return this.getMiniIntelligenceData();
      case 'signal_feed':
        return this.getSignalFeedData();
      case 'ops_daemon':
        return this.getOpsDaemonData();
      default:
        return null;
    }
  }

  private getMiniIntelligenceData(): any {
    const metrics = qieSystemCore.getSignalMetrics();
    return {
      totalSignals: metrics.totalSignals,
      averageConfidence: Math.round(metrics.averageConfidence * 100),
      activePlatforms: metrics.activePlatforms.length,
      cognitionAccuracy: Math.round(metrics.cognitionAccuracy),
      lastUpdate: new Date()
    };
  }

  private getSignalFeedData(): any {
    const recentSignals = qieSystemCore.getRecentSignals(5);
    return {
      signals: recentSignals.map(signal => ({
        id: signal.id.slice(-6),
        source: signal.source,
        type: signal.type,
        confidence: Math.round(signal.confidence * 100),
        timestamp: signal.timestamp
      })),
      count: recentSignals.length
    };
  }

  private getOpsDaemonData(): any {
    return {
      status: this.opsDaemon.isRunning ? 'active' : 'inactive',
      processedSignals: this.opsDaemon.processedSignals,
      activeMirrors: this.opsDaemon.activeMirrors,
      systemLoad: Math.round(this.opsDaemon.systemLoad),
      memoryUsage: Math.round(this.opsDaemon.memoryUsage),
      networkLatency: Math.round(this.opsDaemon.networkLatency)
    };
  }

  togglePanel(panelId: string): boolean {
    const panel = this.embeddedPanels.get(panelId);
    if (!panel) return false;

    panel.isActive = !panel.isActive;
    panel.lastUpdate = new Date();
    
    this.emit('panel_toggled', { panelId, isActive: panel.isActive });
    return true;
  }

  updatePanelConfig(panelId: string, config: Partial<QIEEmbeddedPanel['config']>): boolean {
    const panel = this.embeddedPanels.get(panelId);
    if (!panel) return false;

    panel.config = { ...panel.config, ...config };
    panel.lastUpdate = new Date();
    
    this.emit('panel_config_updated', { panelId, config: panel.config });
    return true;
  }
}

export const qieUnifiedMode = new QIEUnifiedMode();