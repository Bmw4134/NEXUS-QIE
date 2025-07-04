import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  protocols?: string[];
}

export class NexusWebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectInterval = 3000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldConnect = true;

  constructor(config: WebSocketConfig = {}) {
    // Construct WebSocket URL properly
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = config.url || `${protocol}//${host}/ws`;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 3;
    this.reconnectInterval = config.reconnectInterval || 3000;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.shouldConnect || this.isConnecting) {
          resolve();
          return;
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max WebSocket reconnection attempts reached');
          this.connectionState = 'error';
          reject(new Error('Max WebSocket reconnection attempts reached'));
          return;
        }

        this.connectionState = 'connecting';
        console.log(`🔌 Connecting to WebSocket: ${this.url}`);
        this.isConnecting = true;

        // Validate URL before creating WebSocket
        try {
          new URL(this.url);
        } catch (urlError) {
          console.error('Invalid WebSocket URL:', this.url);
          this.connectionState = 'error';
          this.isConnecting = false;
          reject(new Error('Invalid WebSocket URL'));
          return;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason);
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.isConnecting = false;

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts && this.shouldConnect) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.connectionState = 'error';
          this.stopHeartbeat();
          this.isConnecting = false;

          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

        // Timeout for connection attempt
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            console.warn('⚠️ WebSocket connection timeout');
            this.ws?.close();
            this.connectionState = 'error';
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.connectionState = 'error';
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (!this.shouldConnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max WebSocket reconnection attempts reached or shouldConnect is false');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(`🔄 Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000); // 30 second heartbeat
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => {
      try {
        listener(message.data);
      } catch (error) {
        console.error('WebSocket message handler error:', error);
      }
    });
  }

  send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };

      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }

  subscribe(type: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  disconnect(): void {
    this.shouldConnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.connectionState = 'disconnected';
  }
}

// Global WebSocket manager instance
export const nexusWebSocket = new NexusWebSocketManager();

// React hook for WebSocket connection
export function useNexusWebSocket(autoConnect: boolean = true) {
  const [connectionState, setConnectionState] = useState(nexusWebSocket.getConnectionState());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoConnect && connectionState === 'disconnected') {
      // Small delay to prevent immediate connection on mount
      reconnectTimeoutRef.current = setTimeout(() => {
        nexusWebSocket.connect().catch(error => {
          console.error('WebSocket connection failed:', error);
          setConnectionState('error');
        });
      }, 1000);
    }

    // Update connection state
    const checkState = () => {
      setConnectionState(nexusWebSocket.getConnectionState());
    };

    const interval = setInterval(checkState, 1000);

    return () => {
      clearInterval(interval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [autoConnect, connectionState]);

  return {
    connectionState,
    connect: () => nexusWebSocket.connect(),
    disconnect: () => nexusWebSocket.disconnect(),
    send: (type: string, data: any) => nexusWebSocket.send(type, data),
    subscribe: (type: string, listener: (data: any) => void) => nexusWebSocket.subscribe(type, listener)
  };
}

// Utility function to safely handle WebSocket operations
export function withWebSocketErrorHandling<T>(
  operation: () => T,
  fallback?: T
): T | undefined {
  try {
    return operation();
  } catch (error) {
    if (error instanceof DOMException) {
      console.error('DOM Exception in WebSocket operation:', error.message);
    } else {
      console.error('WebSocket operation failed:', error);
    }
    return fallback;
  }
}