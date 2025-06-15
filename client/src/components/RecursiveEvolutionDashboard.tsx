import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  Cpu,
  MemoryStick,
  Network,
  Heart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface KpiMetric {
  id: string;
  metricType: string;
  metricValue: number;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
}

interface ModuleHealth {
  moduleId: string;
  status: 'active' | 'degraded' | 'failed' | 'healing';
  errorCount: number;
  healingAttempts: number;
  uptime: number;
}

interface ApiKeyStatus {
  service: string;
  status: 'active' | 'rate_limited' | 'expired' | 'invalid';
  usageCount: number;
  errorCount: number;
}

interface SystemIntelligence {
  overallHealth: number;
  activeModules: number;
  failedModules: number;
  apiKeysActive: number;
  avgResponseTime: number;
  errorRate: number;
  healingEfficiency: number;
}

interface PlatformHeartbeat {
  systemStatus: 'online' | 'degraded' | 'offline';
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  activeUsers: number;
}

export function RecursiveEvolutionDashboard() {
  const [isEvolutionActive, setIsEvolutionActive] = useState(false);
  
  const { data: systemIntelligence, isLoading: intelligenceLoading } = useQuery({
    queryKey: ['/api/evolution/intelligence'],
    refetchInterval: 10000,
  });

  const { data: kpiMetrics, isLoading: kpiLoading } = useQuery({
    queryKey: ['/api/evolution/kpi-metrics'],
    refetchInterval: 5000,
  });

  const { data: moduleHealth, isLoading: moduleLoading } = useQuery({
    queryKey: ['/api/evolution/module-health'],
    refetchInterval: 10000,
  });

  const { data: apiKeyStatuses, isLoading: apiLoading } = useQuery({
    queryKey: ['/api/evolution/api-keys'],
    refetchInterval: 30000,
  });

  const { data: platformHeartbeat, isLoading: heartbeatLoading } = useQuery({
    queryKey: ['/api/evolution/heartbeat'],
    refetchInterval: 10000,
  });

  const toggleEvolution = async () => {
    try {
      const endpoint = isEvolutionActive ? '/api/evolution/stop' : '/api/evolution/start';
      await fetch(endpoint, { method: 'POST' });
      setIsEvolutionActive(!isEvolutionActive);
    } catch (error) {
      console.error('Failed to toggle evolution mode:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'failed':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'healing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'online':
        return 'bg-green-500';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
      case 'failed':
      case 'offline':
        return 'bg-red-500';
      case 'healing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Recursive Evolution Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered self-healing dashboard with real-time intelligence
          </p>
        </div>
        <Button
          onClick={toggleEvolution}
          variant={isEvolutionActive ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isEvolutionActive ? 'Stop Evolution' : 'Start Evolution'}
        </Button>
      </div>

      {/* System Status Alert */}
      {systemIntelligence && (
        <Alert className={`${
          systemIntelligence.overallHealth > 80 ? 'border-green-500' :
          systemIntelligence.overallHealth > 60 ? 'border-yellow-500' : 'border-red-500'
        }`}>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            System Health: {systemIntelligence.overallHealth.toFixed(1)}% | 
            Active Modules: {systemIntelligence.activeModules} | 
            Error Rate: {systemIntelligence.errorRate}/24h | 
            Healing Efficiency: {systemIntelligence.healingEfficiency.toFixed(1)}%
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpi">KPI Monitor</TabsTrigger>
          <TabsTrigger value="modules">Module Health</TabsTrigger>
          <TabsTrigger value="apis">API Vault</TabsTrigger>
          <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Health */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemIntelligence?.overallHealth?.toFixed(1) || '0'}%
                </div>
                <Progress 
                  value={systemIntelligence?.overallHealth || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* CPU Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platformHeartbeat?.cpuUsage?.toFixed(1) || '0'}%
                </div>
                <Progress 
                  value={platformHeartbeat?.cpuUsage || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <MemoryStick className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platformHeartbeat?.memoryUsage?.toFixed(1) || '0'}%
                </div>
                <Progress 
                  value={platformHeartbeat?.memoryUsage || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* API Latency */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Latency</CardTitle>
                <Network className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platformHeartbeat?.apiLatency || 0}ms
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg response time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">System optimization</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">Module health monitoring</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm">API fallback management</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Monitor Tab */}
        <TabsContent value="kpi" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpiMetrics?.map((metric: KpiMetric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {metric.metricType.replace('_', ' ')}
                  </CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.metricValue.toFixed(2)}
                    {metric.metricType.includes('percentage') ? '%' : 
                     metric.metricType.includes('latency') ? 'ms' : ''}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${getStatusColor(metric.status)} text-white`}>
                    {metric.status.toUpperCase()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Module Health Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {moduleHealth?.map((module: ModuleHealth) => (
              <Card key={module.moduleId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(module.status)}
                      <div>
                        <h3 className="font-medium capitalize">
                          {module.moduleId.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {Math.floor(module.uptime / 3600)}h {Math.floor((module.uptime % 3600) / 60)}m
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={module.status === 'active' ? 'default' : 'destructive'}>
                        {module.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Errors: {module.errorCount} | Healing: {module.healingAttempts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Vault Tab */}
        <TabsContent value="apis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiKeyStatuses?.map((api: ApiKeyStatus) => (
              <Card key={api.service}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {api.service}
                  </CardTitle>
                  {getStatusIcon(api.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Usage Count:</span>
                      <span className="text-sm font-medium">{api.usageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Error Count:</span>
                      <span className="text-sm font-medium">{api.errorCount}</span>
                    </div>
                    <Badge variant={api.status === 'active' ? 'default' : 'destructive'}>
                      {api.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Cognitive Load Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>UI Complexity:</span>
                    <Progress value={75} className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Density:</span>
                    <Progress value={60} className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Response Time:</span>
                    <Progress value={90} className="w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Self-Healing Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Error Detection:</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-Recovery:</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fallback Systems:</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-muted-foreground">Uptime Prediction</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-muted-foreground">Performance Score</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-purple-600">97%</div>
                    <div className="text-sm text-muted-foreground">Healing Success</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}