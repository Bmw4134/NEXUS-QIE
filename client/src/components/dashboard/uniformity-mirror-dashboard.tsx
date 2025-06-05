import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Eye, 
  GitBranch, 
  Layers, 
  RefreshCw, 
  Settings,
  Shield,
  Zap,
  Monitor,
  Database,
  Globe,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface ModuleDiffMapEntry {
  module: string;
  frontendState: string;
  backendState: string;
  syncStatus: 'synced' | 'drift' | 'error' | 'updating';
  lastSync: Date;
  driftPercentage: number;
}

interface RouteVisibilityEntry {
  route: string;
  isVisible: boolean;
  accessLevel: 'public' | 'authenticated' | 'admin' | 'system';
  lastAccessed: Date;
  hitCount: number;
  errors: number;
}

interface RealTimeMetric {
  category: string;
  metric: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface UniformityState {
  overall: {
    syncPercentage: number;
    totalModules: number;
    syncedModules: number;
    driftingModules: number;
    errorModules: number;
  };
  credentials: {
    pionex: { status: 'connected' | 'disconnected' | 'error'; lastCheck: Date };
    robinhood: { status: 'connected' | 'disconnected' | 'error'; lastCheck: Date };
    external: Record<string, { status: string; lastCheck: Date }>;
  };
  dashboards: {
    traxovo: { health: number; lastUpdate: Date };
    jdd: { health: number; lastUpdate: Date };
    dwc: { health: number; lastUpdate: Date };
    dwai: { health: number; lastUpdate: Date };
  };
}

export function UniformityMirrorDashboard() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Real-time data from API endpoints
  const { data: uniformityState, isLoading: syncLoading } = useQuery<UniformityState>({
    queryKey: ['/api/uniformity/sync-status'],
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const { data: moduleDiffData, isLoading: moduleLoading } = useQuery({
    queryKey: ['/api/uniformity/module-diff'],
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const { data: routeVisibilityData, isLoading: routeLoading } = useQuery({
    queryKey: ['/api/uniformity/route-visibility'],
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  const { data: realTimeMetricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/uniformity/metrics'],
    refetchInterval: autoRefresh ? refreshInterval : false
  });

  // Use real data from API endpoints
  const moduleDiffMap = moduleDiffData || [];
  const routeVisibility = routeVisibilityData || [];
  const realTimeMetrics = realTimeMetricsData || [];

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-100';
      case 'drift': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'updating': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'connected': return 'text-green-600 bg-green-100';
      case 'warning': case 'disconnected': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Trigger data refresh
        console.log('Auto-refreshing uniformity data...');
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00ff64]" />
            Uniformity Stack Bridge - Full Introspection
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'border-[#00ff64] text-[#00ff64]' : 'border-gray-600'}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Badge className="bg-[#00ff64]/20 text-[#00ff64]">
              {uniformityState.overall.syncPercentage}% Sync
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Stack Overview</TabsTrigger>
            <TabsTrigger value="modules">Module Diff Map</TabsTrigger>
            <TabsTrigger value="routes">Route Visibility</TabsTrigger>
            <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Sync Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00ff64]">
                      {uniformityState.overall.syncPercentage}%
                    </div>
                    <div className="text-sm text-gray-400">Overall Sync</div>
                    <Progress value={uniformityState.overall.syncPercentage} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {uniformityState.overall.syncedModules}
                    </div>
                    <div className="text-sm text-gray-400">Synced Modules</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {uniformityState.overall.driftingModules}
                    </div>
                    <div className="text-sm text-gray-400">Drifting</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {uniformityState.overall.errorModules}
                    </div>
                    <div className="text-sm text-gray-400">Errors</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Credentials Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Credentials Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-600 rounded">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">Pionex.us</span>
                      </div>
                      <Badge className={getStatusColor(uniformityState.credentials.pionex.status)}>
                        {uniformityState.credentials.pionex.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-600 rounded">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">Robinhood Legend</span>
                      </div>
                      <Badge className={getStatusColor(uniformityState.credentials.robinhood.status)}>
                        {uniformityState.credentials.robinhood.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(uniformityState.credentials.external).map(([service, info]) => (
                      <div key={service} className="flex items-center justify-between p-3 border border-gray-600 rounded">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-medium capitalize">{service}</span>
                        </div>
                        <Badge className={getStatusColor(info.status)}>
                          {info.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard Sync Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(uniformityState.dashboards).map(([name, info]) => (
                    <div key={name} className="text-center">
                      <div className="text-lg font-bold text-[#00ff64]">
                        {info.health.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400 uppercase">{name}</div>
                      <Progress value={info.health} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div className="space-y-3">
              {moduleDiffMap.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#00ff64]">{module.module}</h4>
                        <Badge className={getSyncStatusColor(module.syncStatus)}>
                          {module.syncStatus.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-400">Frontend State</div>
                          <div className="font-mono text-sm">{module.frontendState}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Backend State</div>
                          <div className="font-mono text-sm">{module.backendState}</div>
                        </div>
                      </div>
                      
                      {module.driftPercentage > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Drift Percentage</span>
                            <span className="font-medium">{module.driftPercentage}%</span>
                          </div>
                          <Progress value={module.driftPercentage} className="h-2" />
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Last Sync: {module.lastSync.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <div className="space-y-3">
              {routeVisibility.map((route, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Eye className={`w-4 h-4 ${route.isVisible ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="font-mono text-sm">{route.route}</span>
                      </div>
                      <Badge variant="outline">{route.accessLevel}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Visibility</div>
                        <div className={route.isVisible ? 'text-green-500' : 'text-red-500'}>
                          {route.isVisible ? 'Visible' : 'Hidden'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Hit Count</div>
                        <div>{route.hitCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Errors</div>
                        <div className={route.errors > 0 ? 'text-red-500' : 'text-green-500'}>
                          {route.errors}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Last Access</div>
                        <div>{route.lastAccessed.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {realTimeMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-400">{metric.category}</div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xl font-bold mb-1">
                      {metric.value} {metric.unit}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{metric.metric}</span>
                      <span>{getTrendIcon(metric.trend)}</span>
                    </div>
                    
                    <Progress 
                      value={(metric.value / metric.threshold) * 100} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}