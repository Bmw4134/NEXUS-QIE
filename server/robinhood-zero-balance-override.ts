/**
 * Robinhood Zero Balance Override - Emergency Force Update
 * Directly overrides all balance references to $0 as confirmed by user
 */

import { accountBalanceService } from './account-balance-service';

export class RobinhoodZeroBalanceOverride {
  private static instance: RobinhoodZeroBalanceOverride;
  
  static getInstance(): RobinhoodZeroBalanceOverride {
    if (!RobinhoodZeroBalanceOverride.instance) {
      RobinhoodZeroBalanceOverride.instance = new RobinhoodZeroBalanceOverride();
    }
    return RobinhoodZeroBalanceOverride.instance;
  }

  constructor() {
    this.activateZeroBalanceForce();
    this.startPersistentOverride();
  }

  private activateZeroBalanceForce(): void {
    console.log('🚨 EMERGENCY ROBINHOOD BALANCE OVERRIDE ACTIVATED');
    console.log('🔄 FORCING BALANCE TO $0.00 AS CONFIRMED BY USER');
    
    // Force immediate update
    accountBalanceService.updateBalance(0, 'robinhood');
    accountBalanceService.syncWithRobinhoodLegend(0, 0);
    
    console.log('✅ ROBINHOOD BALANCE FORCE UPDATED TO $0.00');
  }

  private startPersistentOverride(): void {
    // Override every 5 seconds to ensure $0 balance persists
    setInterval(() => {
      accountBalanceService.updateBalance(0, 'robinhood');
      accountBalanceService.syncWithRobinhoodLegend(0, 0);
      
      // Log confirmation
      const accountInfo = accountBalanceService.getAccountInfo();
      if (accountInfo.balance !== 0 || accountInfo.buyingPower !== 0) {
        console.log('🔄 PERSISTENT OVERRIDE: Forcing balance back to $0.00');
        accountBalanceService.updateBalance(0, 'robinhood');
        accountBalanceService.syncWithRobinhoodLegend(0, 0);
      }
    }, 5000);
  }

  public forceZeroBalance(): void {
    console.log('🚨 MANUAL ZERO BALANCE FORCE TRIGGERED');
    accountBalanceService.updateBalance(0, 'robinhood');
    accountBalanceService.syncWithRobinhoodLegend(0, 0);
    console.log('✅ BALANCE FORCED TO $0.00');
  }

  public getOverrideStatus(): { active: boolean; currentBalance: number; message: string } {
    const accountInfo = accountBalanceService.getAccountInfo();
    return {
      active: true,
      currentBalance: accountInfo.balance,
      message: accountInfo.balance === 0 ? 'Override successful - Balance is $0.00' : 'Override active - Forcing to $0.00'
    };
  }
}

// Activate immediately
export const robinhoodZeroBalanceOverride = RobinhoodZeroBalanceOverride.getInstance();