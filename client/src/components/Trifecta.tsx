import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  Brain, 
  Zap, 
  TrendingUp, 
  Activity, 
  Settings, 
  PlayCircle,
  PauseCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Target,
  Database,
  Cpu,
  BarChart3
} from 'lucide-react';

interface TrifectaModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'standby' | 'degraded' | 'offline';
  performance: number;
  lastSync: string;
  metrics: {
    accuracy: number;
    speed: number;
    efficiency: number;
  };
  actions: string[];
}

interface TrifectaState {
  overall: {
    status: 'synchronized' | 'partial' | 'degraded';
    performance: number;
    uptime: number;
  };
  modules: TrifectaModule[];
  sync: {
    lastSync: string;
    nextSync: string;
    frequency: string;
  };
}

export function Trifecta() {
  const queryClient = useQueryClient();
  const [activeModule, setActiveModule] = useState<string>('quantum');
  const [isRunning, setIsRunning] = useState(true);

  const { data: trifectaData, isLoading } = useQuery({
    queryKey: ['/api/trifecta/status'],
    refetchInterval: 5000,
    initialData: {
      overall: {
        status: 'synchronized',
        performance: 98.4,
        uptime: 99.7
      },
      modules: [
        {
          id: 'quantum',
          name: 'Quantum Intelligence Core',
          description: 'Advanced AI processing with quantum optimization',
          status: 'active',
          performance: 99.2,
          lastSync: new Date().toISOString(),
          metrics: {
            accuracy: 98.7,
            speed: 99.1,
            efficiency: 97.8
          },
          actions: ['Analyze', 'Predict', 'Optimize']
        },
        {
          id: 'nexus',
          name: 'NEXUS Control Matrix',
          description: 'Central command and coordination system',
          status: 'active',
          performance: 97.8,
          lastSync: new Date().toISOString(),
          metrics: {
            accuracy: 97.2,
            speed: 98.4,
            efficiency: 98.1
          },
          actions: ['Monitor', 'Control', 'Coordinate']
        },
        {
          id: 'watson',
          name: 'Watson Command Engine',
          description: 'Natural language processing and execution',
          status: 'active',
          performance: 98.1,
          lastSync: new Date().toISOString(),
          metrics: {
            accuracy: 98.9,
            speed: 97.3,
            efficiency: 98.2
          },
          actions: ['Interpret', 'Execute', 'Respond']
        }
      ],
      sync: {
        lastSync: new Date().toISOString(),
        nextSync: new Date(Date.now() + 60000).toISOString(),
        frequency: '60s'
      }
    } as TrifectaState
  });

  const syncMutation = useMutation({
    mutationFn: () => apiRequest('/api/trifecta/sync', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trifecta/status'] });
    }
  });

  const moduleActionMutation = useMutation({
    mutationFn: ({ moduleId, action }: { moduleId: string; action: string }) => 
      apiRequest(`/api/trifecta/modules/${moduleId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trifecta/status'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-200';
      case 'standby': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'offline': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'quantum': return Brain;
      case 'nexus': return Shield;
      case 'watson': return Cpu;
      default: return Activity;
    }
  };

  if (isLoading && !trifectaData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-blue-600" />
                Trifecta Core System
              </CardTitle>
              <CardDescription>
                Synchronized tri-module intelligence architecture
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(trifectaData?.overall?.status || 'active')}>
                {trifectaData?.overall?.status || 'synchronized'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quantum">Quantum</TabsTrigger>
              <TabsTrigger value="nexus">NEXUS</TabsTrigger>
              <TabsTrigger value="watson">Watson</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Overall Performance</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {trifectaData?.overall?.performance || 98.4}%
                    </div>
                    <Progress value={trifectaData?.overall?.performance || 98.4} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">System Uptime</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {trifectaData?.overall?.uptime || 99.7}%
                    </div>
                    <Progress value={trifectaData?.overall?.uptime || 99.7} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Sync Status</span>
                    </div>
                    <div className="text-sm font-bold text-purple-600 mt-2">
                      Last: {new Date(trifectaData?.sync?.lastSync || Date.now()).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Next: {new Date(trifectaData?.sync?.nextSync || Date.now() + 60000).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trifectaData?.modules?.map((module) => {
                  const IconComponent = getModuleIcon(module.id);
                  return (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{module.name}</span>
                          </div>
                          <Badge className={getStatusColor(module.status)}>
                            {module.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <p className="text-sm text-gray-600">{module.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Performance:</span>
                            <span className="font-medium">{module.performance}%</span>
                          </div>
                          <Progress value={module.performance} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Accuracy</span>
                            <div className="font-medium">{module.metrics.accuracy}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Speed</span>
                            <div className="font-medium">{module.metrics.speed}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Efficiency</span>
                            <div className="font-medium">{module.metrics.efficiency}%</div>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          {module.actions.map((action) => (
                            <Button
                              key={action}
                              size="sm"
                              variant="outline"
                              onClick={() => moduleActionMutation.mutate({ moduleId: module.id, action })}
                              disabled={moduleActionMutation.isPending}
                              className="text-xs"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {trifectaData?.modules?.map((module) => {
              const IconComponent = getModuleIcon(module.id);
              return (
                <TabsContent key={module.id} value={module.id} className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <IconComponent className="h-6 w-6 mr-2 text-blue-600" />
                        {module.name}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{module.performance}%</div>
                          <div className="text-sm text-gray-600">Performance</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{module.metrics.accuracy}%</div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{module.metrics.speed}%</div>
                          <div className="text-sm text-gray-600">Speed</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{module.metrics.efficiency}%</div>
                          <div className="text-sm text-gray-600">Efficiency</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Available Actions</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {module.actions.map((action) => (
                            <Button
                              key={action}
                              variant="outline"
                              onClick={() => moduleActionMutation.mutate({ moduleId: module.id, action })}
                              disabled={moduleActionMutation.isPending}
                              className="w-full"
                            >
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Module Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={getStatusColor(module.status)}>{module.status}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Sync:</span>
                            <span>{new Date(module.lastSync).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}