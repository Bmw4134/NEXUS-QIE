import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Activity, 
  Users, 
  Settings, 
  Terminal, 
  Play, 
  Camera, 
  Shield,
  Cpu,
  Database,
  TrendingUp,
  Zap,
  Eye,
  Gauge
} from 'lucide-react';

interface ModuleStatus {
  id: string;
  name: string;
  category: 'auth' | 'control' | 'trading' | 'analytics' | 'ai' | 'settings';
  status: 'active' | 'degraded' | 'failed' | 'maintenance';
  qpiScore: number;
  uptime: number;
  lastChecked: string;
  errors: string[];
  logs: string[];
}

interface UserAccount {
  id: string;
  username: string;
  role: 'admin' | 'trader' | 'dev' | 'watson' | 'nexus';
  lastActive: string;
  preferences: {
    theme: 'light' | 'dark';
    layout: 'compact' | 'expanded' | 'focus';
    notifications: boolean;
  };
}

interface QPIMetrics {
  overall: number;
  modules: Record<string, number>;
  userExperience: number;
  systemHealth: number;
  predictiveAccuracy: number;
}

export function AgentCanvas() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ['/api/agent/system-status'],
    refetchInterval: 5000
  });

  const { data: qpiMetrics } = useQuery({
    queryKey: ['/api/agent/qpi-metrics'],
    refetchInterval: 10000
  });

  const simulateUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest(`/api/agent/simulate-user/${userId}`, {
      method: 'POST'
    }),
    onSuccess: (data) => {
      setTerminalOutput(prev => [...prev, `✅ User simulation completed: ${data.message || 'Success'}`]);
      queryClient.invalidateQueries({ queryKey: ['/api/agent/system-status'] });
    }
  });

  const runFullSystemTest = useMutation({
    mutationFn: () => apiRequest('/api/agent/full-system-test', {
      method: 'POST'
    }),
    onSuccess: (data) => {
      setTerminalOutput(prev => [...prev, `🔍 Full system test completed: ${data.message || 'All systems checked'}`]);
      queryClient.invalidateQueries({ queryKey: ['/api/agent/system-status'] });
    }
  });

  const autoFixIssues = useMutation({
    mutationFn: () => apiRequest('/api/agent/auto-fix-issues', {
      method: 'POST'
    }),
    onSuccess: (data) => {
      setTerminalOutput(prev => [...prev, `🔧 Auto-fix completed: ${data.message || 'Issues resolved'}`]);
      queryClient.invalidateQueries({ queryKey: ['/api/agent/system-status'] });
    }
  });

  const generateSnapshotMutation = useMutation({
    mutationFn: () => apiRequest('/api/agent/generate-snapshot', {
      method: 'POST'
    }),
    onSuccess: () => {
      setTerminalOutput(prev => [...prev, '📊 System snapshot generated successfully']);
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return Shield;
      case 'control': return Settings;
      case 'trading': return TrendingUp;
      case 'analytics': return Activity;
      case 'ai': return Cpu;
      case 'settings': return Database;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredModules = systemStatus?.data?.modules?.filter((module: ModuleStatus) => 
    selectedCategory === 'all' || module.category === selectedCategory
  ) || [];

  const categories = ['all', 'auth', 'control', 'trading', 'analytics', 'ai', 'settings'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Master Control</CardTitle>
          <CardDescription>Loading system status...</CardDescription>
        </CardHeader>
        <CardContent>
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
          <CardTitle className="flex items-center">
            <Terminal className="h-5 w-5 mr-2" />
            Agent Master Control Canvas
          </CardTitle>
          <CardDescription>
            Real-time system monitoring, user simulation, and module management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="qpi">QPI Metrics</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium">Filter by category:</span>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModules.map((module: ModuleStatus) => {
                  const IconComponent = getCategoryIcon(module.category);
                  return (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="font-medium text-sm">{module.name}</span>
                          </div>
                          <Badge className={getStatusColor(module.status)}>
                            {module.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>QPI Score:</span>
                          <span className="font-medium">{module.qpiScore}%</span>
                        </div>
                        <Progress value={module.qpiScore} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Uptime: {module.uptime}%</span>
                          <span>Last: {new Date(module.lastChecked).toLocaleTimeString()}</span>
                        </div>
                        {module.logs.length > 0 && (
                          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                            {module.logs[module.logs.length - 1]}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemStatus?.data?.users?.map((user: UserAccount) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Theme:</span>
                          <span className="ml-1 capitalize">{user.preferences.theme}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Layout:</span>
                          <span className="ml-1 capitalize">{user.preferences.layout}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last active: {new Date(user.lastActive).toLocaleString()}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => simulateUserMutation.mutate(user.id)}
                        disabled={simulateUserMutation.isPending}
                        className="w-full"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Simulate User
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="qpi" className="space-y-4">
              {qpiMetrics?.qpiMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Overall QPI</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        {qpiMetrics.qpiMetrics.overall}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">User Experience</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mt-2">
                        {qpiMetrics.qpiMetrics.userExperience}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">System Health</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 mt-2">
                        {qpiMetrics.qpiMetrics.systemHealth}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Predictive Accuracy</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mt-2">
                        {qpiMetrics.qpiMetrics.predictiveAccuracy}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="terminal" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <Button
                  onClick={() => runFullSystemTest.mutate()}
                  disabled={runFullSystemTest.isPending}
                  size="sm"
                  className="w-full"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Full System Test
                </Button>
                <Button
                  onClick={() => autoFixIssues.mutate()}
                  disabled={autoFixIssues.isPending}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Auto-Fix Issues
                </Button>
                <Button
                  onClick={() => simulateUserMutation.mutate('watson-admin')}
                  disabled={simulateUserMutation.isPending}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Simulate User
                </Button>
                <Button
                  onClick={() => generateSnapshotMutation.mutate()}
                  disabled={generateSnapshotMutation.isPending}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Snapshot
                </Button>
              </div>

              <div className="flex space-x-2 mb-4">
                <Button
                  onClick={() => setTerminalOutput([])}
                  variant="destructive"
                  size="sm"
                >
                  Clear Terminal
                </Button>
                <Button
                  onClick={() => {
                    setTerminalOutput(prev => [...prev, '🚀 Starting comprehensive system validation...']);
                    runFullSystemTest.mutate();
                    setTimeout(() => autoFixIssues.mutate(), 2000);
                    setTimeout(() => simulateUserMutation.mutate('watson-admin'), 4000);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Terminal className="h-3 w-3 mr-1" />
                  Run All Tests & Fix
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="bg-black text-green-400 font-mono text-xs p-4 rounded h-64 overflow-y-auto">
                    <div className="text-gray-500">Agent Master Sync Terminal v2.0</div>
                    <div className="text-gray-500">Ready for commands...</div>
                    <div className="mt-2">
                      {terminalOutput.map((line, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {line}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <span className="text-green-400">agent@nexus:~$ </span>
                      <span className="animate-pulse">▊</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}