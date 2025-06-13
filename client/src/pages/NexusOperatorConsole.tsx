import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings,
  Terminal,
  Eye,
  Play,
  Pause,
  Power,
  Cpu,
  Database,
  Network,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SystemModule {
  id: string;
  name: string;
  status: 'active' | 'degraded' | 'failed' | 'maintenance';
  health: number;
  uptime: number;
  lastChecked: string;
  errors: string[];
  logs: string[];
  qpiScore: number;
}

interface DiagnosticResult {
  module: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  timestamp: string;
  details?: any;
}

interface TriggerAction {
  id: string;
  name: string;
  description: string;
  type: 'restart' | 'optimize' | 'repair' | 'backup' | 'sync';
  enabled: boolean;
  lastExecuted?: string;
}

export default function NexusOperatorConsole() {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);

  // Fetch system modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['/api/nexus/modules'],
    refetchInterval: 5000
  });

  // Fetch QA results
  const { data: qaResults = [], isLoading: qaLoading } = useQuery({
    queryKey: ['/api/nexus/qa-results'],
    refetchInterval: 10000
  });

  // Fetch trigger actions
  const { data: triggers = [], isLoading: triggersLoading } = useQuery({
    queryKey: ['/api/nexus/triggers']
  });

  // Execute trigger mutation
  const executeTrigger = useMutation({
    mutationFn: async ({ triggerId, moduleId }: { triggerId: string; moduleId?: string }) => {
      const response = await fetch('/api/nexus/execute-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId, moduleId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nexus/modules'] });
    }
  });

  // Run diagnostics
  const runDiagnostics = async () => {
    setDiagnosticsRunning(true);
    try {
      const response = await fetch('/api/nexus/run-diagnostics', {
        method: 'POST'
      });
      const results = await response.json();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      case 'maintenance': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'failed': return XCircle;
      case 'maintenance': return Settings;
      default: return Activity;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            NEXUS Operator Console
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Full system diagnostics and trigger controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={runDiagnostics}
            disabled={diagnosticsRunning}
          >
            {diagnosticsRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            Run Diagnostics
          </Button>
          <Button variant="outline">
            <Terminal className="w-4 h-4 mr-2" />
            Command Line
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">System Modules</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="triggers">Trigger Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.filter((m: SystemModule) => m.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {modules.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.length > 0 
                    ? Math.round(modules.reduce((sum: number, m: SystemModule) => sum + m.health, 0) / modules.length)
                    : 0
                  }%
                </div>
                <Progress 
                  value={modules.length > 0 
                    ? modules.reduce((sum: number, m: SystemModule) => sum + m.health, 0) / modules.length
                    : 0
                  } 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">QPI Score</CardTitle>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.length > 0 
                    ? (modules.reduce((sum: number, m: SystemModule) => sum + m.qpiScore, 0) / modules.length).toFixed(2)
                    : '0.00'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Quality Performance Index
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modules.reduce((sum: number, m: SystemModule) => sum + m.errors.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active alerts
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time module health overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.slice(0, 8).map((module: SystemModule) => {
                  const StatusIcon = getStatusIcon(module.status);
                  return (
                    <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(module.status)}`} />
                        <div>
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-gray-500">
                            Health: {module.health}% • QPI: {module.qpiScore.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={module.status === 'active' ? 'default' : 'destructive'}>
                        {module.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module List</CardTitle>
                <CardDescription>All system modules and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {modules.map((module: SystemModule) => {
                    const StatusIcon = getStatusIcon(module.status);
                    return (
                      <div 
                        key={module.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedModule === module.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedModule(module.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(module.status)}`} />
                            <span className="font-medium">{module.name}</span>
                          </div>
                          <Badge variant={module.status === 'active' ? 'default' : 'destructive'}>
                            {module.status}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Health: {module.health}% • Uptime: {module.uptime}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Details</CardTitle>
                <CardDescription>
                  {selectedModule ? 'Detailed information for selected module' : 'Select a module to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedModule ? (
                  <div className="space-y-4">
                    {(() => {
                      const module = modules.find((m: SystemModule) => m.id === selectedModule);
                      if (!module) return <p>Module not found</p>;
                      
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Health Score</label>
                              <div className="mt-1">
                                <Progress value={module.health} />
                                <span className="text-sm text-gray-500">{module.health}%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">QPI Score</label>
                              <p className="text-lg font-bold">{module.qpiScore.toFixed(2)}</p>
                            </div>
                          </div>

                          {module.errors.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-red-600">Active Errors</label>
                              <div className="mt-1 space-y-1">
                                {module.errors.map((error, index) => (
                                  <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Recent Logs</label>
                            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                              {module.logs.slice(-5).map((log, index) => (
                                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono">
                                  {log}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => executeTrigger.mutate({ triggerId: 'restart', moduleId: module.id })}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Restart
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => executeTrigger.mutate({ triggerId: 'repair', moduleId: module.id })}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Repair
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a module from the list to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Diagnostics</CardTitle>
              <CardDescription>Comprehensive system health checks and QA results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runDiagnostics}
                  disabled={diagnosticsRunning}
                  className="w-full"
                >
                  {diagnosticsRunning ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Activity className="w-4 h-4 mr-2" />
                  )}
                  {diagnosticsRunning ? 'Running Diagnostics...' : 'Run Full System Diagnostics'}
                </Button>

                {diagnosticResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Diagnostic Results</h3>
                    {diagnosticResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-lg ${
                          result.status === 'pass' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
                          result.status === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                          'border-red-200 bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.module}</span>
                          <Badge variant={
                            result.status === 'pass' ? 'default' :
                            result.status === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{result.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}

                {qaResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">QA Results</h3>
                    {qaResults.slice(0, 10).map((result: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.module}</span>
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{result.output}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {triggers.map((trigger: TriggerAction) => (
              <Card key={trigger.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{trigger.name}</CardTitle>
                  <CardDescription>{trigger.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={trigger.enabled ? 'default' : 'secondary'}>
                        {trigger.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    {trigger.lastExecuted && (
                      <div className="text-sm text-gray-500">
                        Last executed: {trigger.lastExecuted}
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled={!trigger.enabled || executeTrigger.isPending}
                      onClick={() => executeTrigger.mutate({ triggerId: trigger.id })}
                    >
                      {trigger.type === 'restart' && <RefreshCw className="w-4 h-4 mr-2" />}
                      {trigger.type === 'optimize' && <Zap className="w-4 h-4 mr-2" />}
                      {trigger.type === 'repair' && <Settings className="w-4 h-4 mr-2" />}
                      {trigger.type === 'backup' && <Database className="w-4 h-4 mr-2" />}
                      {trigger.type === 'sync' && <Network className="w-4 h-4 mr-2" />}
                      Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}