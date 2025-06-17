
import { EventBus } from './event-bus';

interface StateSnapshot {
  id: string;
  timestamp: Date;
  state: any;
  description: string;
}

class StateSnapshotManager {
  private snapshots: StateSnapshot[] = [];
  private maxSnapshots = 50;
  private eventBus: EventBus | null = null;

  initialize(eventBus: EventBus): void {
    this.eventBus = eventBus;
    
    // Auto-snapshot on important events
    eventBus.subscribe('kaizen_system_ready', () => {
      this.createSnapshot('System initialization complete');
    });

    eventBus.subscribe('widget_registered', () => {
      this.createSnapshot('Widget registered');
    });

    eventBus.subscribe('metrics_update', () => {
      this.createSnapshot('Metrics updated');
    });
  }

  createSnapshot(description: string): StateSnapshot {
    const snapshot: StateSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      state: this.captureCurrentState(),
      description
    };

    this.snapshots.unshift(snapshot);
    
    // Keep only the latest snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(0, this.maxSnapshots);
    }

    if (this.eventBus) {
      this.eventBus.emit('state_snapshot_created', snapshot);
    }

    return snapshot;
  }

  getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }

  restoreSnapshot(snapshotId: string): boolean {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return false;

    try {
      // In a real implementation, this would restore the actual state
      console.log('Restoring state snapshot:', snapshot.description);
      if (this.eventBus) {
        this.eventBus.emit('state_snapshot_restored', snapshot);
      }
      return true;
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      return false;
    }
  }

  private captureCurrentState(): any {
    return {
      timestamp: new Date(),
      url: window.location.href,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      // Add more state capture logic as needed
    };
  }
}

export const stateSnapshotManager = new StateSnapshotManager();
export const initialize = stateSnapshotManager.initialize.bind(stateSnapshotManager);
