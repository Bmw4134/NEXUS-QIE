import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/lib/websocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  Zap, 
  Database, 
  Search, 
  Settings, 
  Minimize2,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  Network,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { CodexControlPanel } from '@/components/codex-control-panel';

interface QuantumMetrics {
  quantumNodes: number;
  asiFactor: number;
  successRate: number;
  connections: number;
  queriesPerHour: number;
  avgQueryTime: number;
}

interface ResearchMetrics {
  totalTargets: number;
  activeTargets: number;
  totalScrapes: number;
  rulesActive: number;
  isRunning: boolean;
  lastUpdate: string;
}

interface MarketSummary {
  totalDataPoints: number;
  activeSources: string[];
  latestPrices: Array<{ symbol: string; price: number }>;
  economicEvents: number;
  newsItems: number;
  cryptoAssets: number;
  commodities: number;
  lastUpdate: string;
}

export function QuantumAdminControl() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();

  // Real-time data queries
  const { data: quantumStats } = useQuery<QuantumMetrics>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 5000
  });

  const { data: researchMetrics } = useQuery<ResearchMetrics>({
    queryKey: ['/api/research/metrics'],
    refetchInterval: 10000
  });

  const { data: marketSummary } = useQuery<MarketSummary>({
    queryKey: ['/api/market/summary'],
    refetchInterval: 15000
  });

  const { data: researchTargets } = useQuery({
    queryKey: ['/api/research/targets']
  });

  const { data: marketAlerts } = useQuery({
    queryKey: ['/api/market/alerts'],
    refetchInterval: 30000
  });

  // Research execution mutation
  const executeResearch = useMutation({
    mutationFn: async (targetId: string) => {
      const response = await apiRequest('/api/research/execute', {
        method: 'POST',
        body: JSON.stringify({ targetId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research/metrics'] });
    }
  });

  // Handle WebSocket updates - removed lastMessage dependency due to interface changes

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Calculate quantum efficiency
  const quantumEfficiency = quantumStats ? 
    (quantumStats.successRate * quantumStats.asiFactor * 100) / (quantumStats.avgQueryTime || 1) : 0;

  // Calculate research velocity
  const researchVelocity = researchMetrics ?
    (researchMetrics.totalScrapes * researchMetrics.activeTargets) / 24 : 0;

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 bg-black/90 backdrop-blur border border-blue-500/30 rounded-full p-3 cursor-pointer hover:bg-black/95 transition-all"
        style={{ left: position.x, top: position.y }}
        onClick={() => setIsMinimized(false)}
      >
        <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 bg-black/95 backdrop-blur border border-blue-500/30 rounded-lg shadow-2xl max-w-md"
      style={{ 
        left: position.x, 
        top: position.y,
        width: isCollapsed ? '320px' : '480px'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-white">NEXUS Quantum Control</span>
          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
            ACTIVE
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 h-6 w-6 text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="p-1 h-6 w-6 text-gray-400 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          <Tabs defaultValue="quantum" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
              <TabsTrigger value="quantum" className="text-xs">Quantum</TabsTrigger>
              <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
              <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
              <TabsTrigger value="codex" className="text-xs">Codex</TabsTrigger>
              <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
            </TabsList>

            {/* Quantum Tab */}
            <TabsContent value="quantum" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-gray-900/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-gray-300">ASI Factor</span>
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {quantumStats?.asiFactor.toFixed(2) || '0.00'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-green-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-300">Success Rate</span>
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      {((quantumStats?.successRate || 0) * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-900/50 border-purple-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-300">Quantum Efficiency</span>
                    <span className="text-xs text-purple-400">{quantumEfficiency.toFixed(1)}</span>
                  </div>
                  <Progress value={Math.min(quantumEfficiency, 100)} className="h-2" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Nodes</div>
                  <div className="text-white font-semibold">{quantumStats?.quantumNodes || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Connections</div>
                  <div className="text-white font-semibold">{quantumStats?.connections || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Queries/Hr</div>
                  <div className="text-white font-semibold">{quantumStats?.queriesPerHour || 0}</div>
                </div>
              </div>
            </TabsContent>

            {/* Research Tab */}
            <TabsContent value="research" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-gray-900/50 border-orange-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-gray-300">Active Targets</span>
                    </div>
                    <div className="text-lg font-bold text-orange-400">
                      {researchMetrics?.activeTargets || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-cyan-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-gray-300">Velocity</span>
                    </div>
                    <div className="text-lg font-bold text-cyan-400">
                      {researchVelocity.toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Research Status</span>
                  <Badge variant={researchMetrics?.isRunning ? "default" : "destructive"} className="text-xs">
                    {researchMetrics?.isRunning ? 'RUNNING' : 'STOPPED'}
                  </Badge>
                </div>
                
                <ScrollArea className="h-24">
                  {researchTargets?.slice(0, 3).map((target: any) => (
                    <div key={target.id} className="flex items-center justify-between py-1">
                      <div className="text-xs text-gray-300 truncate">{target.name}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => executeResearch.mutate(target.id)}
                        disabled={executeResearch.isPending}
                      >
                        {executeResearch.isPending ? 'Running...' : 'Execute'}
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Total Scrapes</div>
                  <div className="text-white font-semibold">{researchMetrics?.totalScrapes || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Rules Active</div>
                  <div className="text-white font-semibold">{researchMetrics?.rulesActive || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Targets</div>
                  <div className="text-white font-semibold">{researchMetrics?.totalTargets || 0}</div>
                </div>
              </div>
            </TabsContent>

            {/* Codex Tab */}
            <TabsContent value="codex" className="space-y-3 mt-3">
              <CodexControlPanel />
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-gray-900/50 border-yellow-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-300">Data Points</span>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">
                      {marketSummary?.totalDataPoints || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-red-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-gray-300">Alerts</span>
                    </div>
                    <div className="text-lg font-bold text-red-400">
                      {marketAlerts?.length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ScrollArea className="h-20">
                <div className="space-y-1">
                  {marketSummary?.latestPrices?.slice(0, 4).map((price) => (
                    <div key={price.symbol} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300">{price.symbol}</span>
                      <span className="text-green-400 font-mono">${price.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Sources</div>
                  <div className="text-white font-semibold">{marketSummary?.activeSources?.length || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Crypto</div>
                  <div className="text-white font-semibold">{marketSummary?.cryptoAssets || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">News</div>
                  <div className="text-white font-semibold">{marketSummary?.newsItems || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Economic</div>
                  <div className="text-white font-semibold">{marketSummary?.economicEvents || 0}</div>
                </div>
              </div>

              {marketAlerts && marketAlerts.length > 0 && (
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardContent className="p-2">
                    <div className="text-xs text-red-400 font-semibold mb-1">Latest Alert</div>
                    <div className="text-xs text-gray-300">{marketAlerts[0].message}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => queryClient.invalidateQueries()}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Refresh All
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('/api/research/targets', '_blank')}
                >
                  <Database className="w-3 h-3 mr-1" />
                  API Debug
                </Button>
              </div>

              <Card className="bg-gray-900/50 border-gray-600/20">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-300 mb-2">System Status</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Quantum DB</span>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Research Engine</span>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Market Feed</span>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">WebSocket</span>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-gray-400 text-center">
                <Clock className="w-3 h-3 inline mr-1" />
                Last Update: {new Date().toLocaleTimeString()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}