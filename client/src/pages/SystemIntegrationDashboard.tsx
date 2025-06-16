
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  Database, 
  Zap, 
  Brain, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Network,
  Cpu,
  Lock,
  TrendingUp
} from 'lucide-react';

interface ModuleScaffold {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'scaffolding' | 'complete' | 'error';
  recoveryScore: number;
  fileCount: number;
  integrationCount: number;
  apiEndpointCount: number;
}

interface IntegrationStatus {
  scaffold: {
    recoveryProgress: number;
    modules: ModuleScaffold[];
  };
  agentMaster: {
    modules: any[];
    qpiMetrics: {
      overall: number;
      userExperience: number;
      systemHealth: number;
      predictiveAccuracy: number;
    };
  };
  systemHealth: {
    overallStatus: string;
    integrationsCovered: number;
    recoveryProgress: number;
    qpiScore: number;
  };
}

export function SystemIntegrationDashboard() {
  const { data: integrationStatus, isLoading, refetch } = useQuery<IntegrationStatus>({
    queryKey: ['system-integration-status'],
    queryFn: async () => {
      const response = await fetch('/api/system/integration-status');
      if (!response.ok) throw new Error('Failed to fetch integration status');
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: recoveryReport } = useQuery({
    queryKey: ['scaffold-recovery-report'],
    queryFn: async () => {
      const response = await fetch('/api/scaffold/recovery-report');
      if (!response.ok) throw new Error('Failed to fetch recovery report');
      const data = await response.json();
      return data.report;
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trading': return <TrendingUp className="w-5 h-5" />;
      case 'ai': return <Brain className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      case 'automation': return <Zap className="w-5 h-5" />;
      case 'intelligence': return <Network className="w-5 h-5" />;
      case 'security': return <Lock className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scaffolding': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading system integration status...</p>
        </div>
      </div>
    );
  }

  const modulesByCategory = integrationStatus?.scaffold.modules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleScaffold[]>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                System Integration Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Complete scaffolding recovery and integration status
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStatus?.systemHealth.recoveryProgress || 0}%</div>
              <Progress value={integrationStatus?.systemHealth.recoveryProgress || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QPI Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStatus?.agentMaster.qpiMetrics.overall.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Quantum Performance Index</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integrations</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStatus?.systemHealth.integrationsCovered || 0}</div>
              <p className="text-xs text-muted-foreground">Active modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {integrationStatus?.systemHealth.overallStatus || 'Unknown'}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Categories */}
        <div className="space-y-6">
          {Object.entries(modulesByCategory).map(([category, modules]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getCategoryIcon(category)}
                  {category} Modules
                  <Badge variant="outline">{modules.length} modules</Badge>
                </CardTitle>
                <CardDescription>
                  Scaffolded and recovered {category} integration modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module) => (
                    <div key={module.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{module.name}</h4>
                        <Badge className={getStatusColor(module.status)}>
                          {module.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Recovery Score:</span>
                          <span className="font-medium">{module.recoveryScore}%</span>
                        </div>
                        <Progress value={module.recoveryScore} className="h-2" />
                        
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="text-center">
                            <div className="font-medium">{module.fileCount}</div>
                            <div>Files</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{module.integrationCount}</div>
                            <div>Integrations</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{module.apiEndpointCount}</div>
                            <div>APIs</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recovery Report Summary */}
        {recoveryReport && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recovery Report Summary</CardTitle>
              <CardDescription>
                Generated at {new Date(recoveryReport.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{recoveryReport.totalModules}</div>
                    <div className="text-sm text-blue-600">Total Modules</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{recoveryReport.integrationMappings}</div>
                    <div className="text-sm text-green-600">Integration Mappings</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{recoveryReport.recoveryProgress}%</div>
                    <div className="text-sm text-purple-600">Recovery Progress</div>
                  </div>
                </div>

                {recoveryReport.recommendations && recoveryReport.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {recoveryReport.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
