import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain, 
  Zap, 
  Target,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  Cpu,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface KaizenMetrics {
  improvementCycles: number;
  optimizationScore: number;
  systemEfficiency: number;
  learningRate: number;
  adaptationIndex: number;
  innovationFactor: number;
  lastOptimization: string;
}

interface KaizenOptimization {
  id: string;
  type: 'performance' | 'efficiency' | 'intelligence' | 'workflow' | 'security';
  description: string;
  impact: number;
  implementation: string;
  status: 'proposed' | 'testing' | 'deployed' | 'verified';
  timestamp: string;
}

interface KaizenStatus {
  active: boolean;
  safeMode: boolean;
  dashboardSync: boolean;
  totalOptimizations: number;
  deployedOptimizations: number;
  systemHealth: number;
  lastUpdate: string;
}

export function KaizenAgentPage() {
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: status } = useQuery<KaizenStatus>({
    queryKey: ['/api/kaizen/status'],
    refetchInterval: 5000
  });

  const { data: metrics } = useQuery<KaizenMetrics>({
    queryKey: ['/api/kaizen/metrics'],
    refetchInterval: 10000
  });

  const { data: optimizations } = useQuery<KaizenOptimization[]>({
    queryKey: ['/api/kaizen/optimizations'],
    refetchInterval: 15000
  });

  const executeOptimizationMutation = useMutation({
    mutationFn: async (optimizationId: string) => {
      const response = await fetch('/api/kaizen/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimizationId })
      });
      if (!response.ok) throw new Error('Failed to execute optimization');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kaizen/optimizations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kaizen/metrics'] });
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: { safeMode?: boolean; adaptationSpeed?: string }) => {
      const response = await fetch('/api/kaizen/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kaizen/status'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-100';
      case 'verified': return 'text-blue-600 bg-blue-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      case 'proposed': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'efficiency': return <Target className="w-4 h-4" />;
      case 'intelligence': return <Brain className="w-4 h-4" />;
      case 'workflow': return <Activity className="w-4 h-4" />;
      case 'security': return <CheckCircle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          KaizenGPT Infinity Agent
        </h1>
        <div className="flex items-center gap-2">
          <Badge className={status?.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
            {status?.active ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant="outline">
            Final Patch v1.0.0
          </Badge>
        </div>
      </div>

      {/* Agent Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.systemHealth?.toFixed(1) || 0}%</div>
            <Progress value={status?.systemHealth || 0} className="mt-2" />
            <div className="flex items-center gap-1 mt-1">
              {status?.active ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Pause className="w-3 h-3 text-gray-600" />
              )}
              <span className="text-xs">Agent Status</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimization Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.optimizationScore?.toFixed(1) || 0}%</div>
            <Progress value={metrics?.optimizationScore || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground">Continuous improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Active Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.deployedOptimizations || 0}</div>
            <div className="text-sm text-muted-foreground">
              of {status?.totalOptimizations || 0} total
            </div>
            <Progress 
              value={status?.totalOptimizations ? (status.deployedOptimizations / status.totalOptimizations) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Improvement Cycles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.improvementCycles || 0}</div>
            <div className="text-sm text-muted-foreground">
              Learning rate: {((metrics?.learningRate || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Safe Mode</label>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={status?.safeMode || false}
                  onCheckedChange={(checked) => updateConfigMutation.mutate({ safeMode: checked })}
                />
                <span className="text-sm">{status?.safeMode ? 'Enabled' : 'Disabled'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Prevents aggressive optimizations
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Adaptation Speed</label>
              <Select onValueChange={(value) => updateConfigMutation.mutate({ adaptationSpeed: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dashboard Sync</label>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${status?.dashboardSync ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">{status?.dashboardSync ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time dashboard synchronization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Learning Rate</span>
                <span className="text-sm">{((metrics?.learningRate || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(metrics?.learningRate || 0) * 100} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Adaptation Index</span>
                <span className="text-sm">{((metrics?.adaptationIndex || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(metrics?.adaptationIndex || 0) * 100} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Innovation Factor</span>
                <span className="text-sm">{((metrics?.innovationFactor || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(metrics?.innovationFactor || 0) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimizations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Optimizations ({optimizations?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizations?.map((optimization) => (
              <div key={optimization.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(optimization.type)}
                    <span className="font-medium">{optimization.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(optimization.status)}>
                      {optimization.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      +{optimization.impact.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  {optimization.implementation}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(optimization.timestamp).toLocaleString()}
                  </span>
                  {optimization.status === 'proposed' && (
                    <Button 
                      size="sm" 
                      onClick={() => executeOptimizationMutation.mutate(optimization.id)}
                      disabled={executeOptimizationMutation.isPending}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Execute
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {(!optimizations || optimizations.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Cpu className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No optimizations available</p>
                <p className="text-sm">Agent is analyzing system for improvements</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Status Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="font-medium">KaizenGPT Infinity Agent</span>
              <Badge variant="outline">Final Fingerprinted Patch Loaded</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Last optimization: {metrics?.lastOptimization ? new Date(metrics.lastOptimization).toLocaleString() : 'Never'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}