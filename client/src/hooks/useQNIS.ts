import { useState, useEffect, useRef, useCallback } from 'react';

interface QNISMetrics {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  tradingVolume: number;
  aiAccuracy: number;
  systemHealth: number;
}

interface QNISPrediction {
  symbol: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  factors: string[];
  quantumSignal: number;
}

interface QNISAlert {
  id: string;
  type: 'trading' | 'system' | 'market' | 'security' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  context: any;
  timestamp: number;
  autoResolve: boolean;
}

interface QNISState {
  connected: boolean;
  metrics: QNISMetrics | null;
  predictions: QNISPrediction[];
  alerts: QNISAlert[];
  adaptiveLayout: any;
  selfHealStatus: any;
}

export function useQNIS() {
  const [state, setState] = useState<QNISState>({
    connected: false,
    metrics: null,
    predictions: [],
    alerts: [],
    adaptiveLayout: null,
    selfHealStatus: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/qnis-realtime`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('🔮 QNIS WebSocket connected');
      setState(prev => ({ ...prev, connected: true }));
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleQNISMessage(message);
      } catch (error) {
        console.error('QNIS WebSocket message error:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('❌ QNIS WebSocket disconnected');
      setState(prev => ({ ...prev, connected: false }));
      
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('QNIS WebSocket error:', error);
    };
  }, []);

  const handleQNISMessage = (message: any) => {
    switch (message.type) {
      case 'QNIS_INIT':
        console.log('QNIS initialized:', message.data);
        break;
        
      case 'QNIS_METRICS_UPDATE':
        setState(prev => ({
          ...prev,
          metrics: message.data.metrics,
          predictions: message.data.predictions,
          alerts: message.data.alerts
        }));
        break;
        
      case 'QNIS_QUERY_RESPONSE':
        // Handle NLP query responses
        break;
        
      case 'QNIS_UI_ADAPTED':
        setState(prev => ({
          ...prev,
          adaptiveLayout: message.data
        }));
        break;
        
      case 'QNIS_PREDICTION':
        setState(prev => ({
          ...prev,
          predictions: [...prev.predictions, message.data]
        }));
        break;
    }
  };

  const sendQuery = useCallback((query: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'QNIS_QUERY',
        data: query
      }));
    }
  }, []);

  const requestUIAdaptation = useCallback((context: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'QNIS_UI_ADAPT',
        data: context
      }));
    }
  }, []);

  const requestVisualization = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'QNIS_VISUAL_REQUEST',
        data: { type, data }
      }));
    }
  }, []);

  const requestPrediction = useCallback((symbol: string, timeframe: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'QNIS_PREDICTION_REQUEST',
        data: { symbol, timeframe }
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    ...state,
    sendQuery,
    requestUIAdaptation,
    requestVisualization,
    requestPrediction
  };
}