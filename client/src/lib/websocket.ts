import { useEffect, useRef, useState } from 'react';
import { queryClient } from './queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'stats_update':
        // Invalidate and refetch dashboard data
        queryClient.setQueryData(['/api/dashboard/stats'], message.data.stats);
        queryClient.setQueryData(['/api/dashboard/activity'], message.data.activity);
        queryClient.setQueryData(['/api/dashboard/learning-progress'], message.data.learningProgress);
        break;
        
      case 'query_processed':
        // Invalidate activity and stats queries
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activity'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        break;
        
      case 'node_created':
        // Invalidate knowledge graph and stats
        queryClient.invalidateQueries({ queryKey: ['/api/quantum/knowledge-graph'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activity'] });
        break;
        
      case 'market_update':
        // Handle real-time market data updates
        queryClient.invalidateQueries({ queryKey: ['/api/market/summary'] });
        queryClient.invalidateQueries({ queryKey: ['/api/market/alerts'] });
        if (message.data) {
          queryClient.setQueryData(['/api/market/summary'], message.data.summary);
        }
        break;
        
      case 'kaizen_update':
        // Handle KaizenGPT optimization updates
        queryClient.invalidateQueries({ queryKey: ['/api/kaizen/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/kaizen/optimizations'] });
        break;
        
      case 'watson_update':
        // Handle Watson Command Engine updates
        queryClient.invalidateQueries({ queryKey: ['/api/watson/state'] });
        queryClient.invalidateQueries({ queryKey: ['/api/watson/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/watson/visual-state'] });
        break;
        
      case 'system_health':
        // Handle system health updates
        queryClient.invalidateQueries({ queryKey: ['/api/infinity/health'] });
        queryClient.invalidateQueries({ queryKey: ['/api/infinity/modules'] });
        break;
        
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    disconnect,
    reconnect: connect
  };
}
