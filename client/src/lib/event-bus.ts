
type EventCallback = (data: any) => void;

export class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  subscribe(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    this.events.get(eventName)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(eventName);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(eventName: string, data?: any): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus error in ${eventName}:`, error);
        }
      });
    }
  }

  removeAllListeners(): void {
    this.events.clear();
  }

  getListenerCount(eventName: string): number {
    return this.events.get(eventName)?.length || 0;
  }
}
