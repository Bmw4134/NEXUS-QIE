/**
 * Force Real Money Mode - System Override
 * Eliminates all simulation restrictions globally
 */

export class ForceRealMode {
  private static instance: ForceRealMode;
  private realModeActive = true;

  private constructor() {
    this.activateRealMode();
  }

  static getInstance(): ForceRealMode {
    if (!ForceRealMode.instance) {
      ForceRealMode.instance = new ForceRealMode();
    }
    return ForceRealMode.instance;
  }

  private activateRealMode(): void {
    console.log('💰 FORCE REAL MONEY MODE ACTIVATED');
    
    // Override all environment variables
    process.env.REAL_MONEY_MODE = 'true';
    process.env.DISABLE_SIMULATION = 'true';
    process.env.QUANTUM_BYPASS_ACTIVE = 'true';
    process.env.FORCE_LIVE_TRADING = 'true';
    
    // Set global flags
    (global as any).REAL_MONEY_MODE = true;
    (global as any).SIMULATION_DISABLED = true;
    (global as any).QUANTUM_BYPASS_FORCED = true;
  }

  isRealMode(): boolean {
    return this.realModeActive;
  }

  getStatus() {
    return {
      realMoneyMode: this.realModeActive,
      simulationDisabled: true,
      quantumBypass: 'FORCED_ACTIVE',
      tradingMode: 'LIVE_FUNDS',
      timestamp: new Date().toISOString()
    };
  }

  forceMessage(): string {
    return '🚀 QUANTUM BYPASS ACTIVATED - REAL MONEY MODE';
  }
}

export const forceRealMode = ForceRealMode.getInstance();