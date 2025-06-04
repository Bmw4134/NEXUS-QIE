import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Brain, 
  Target, 
  Settings, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Cpu,
  Network,
  Shield
} from 'lucide-react';

interface AutomationMode {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'advanced' | 'expert' | 'quantum';
  capabilities: string[];
  requiredServices: string[];
  isActive: boolean;
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
}

interface AIExcellenceMetrics {
  totalTasks: number;
  completedTasks: number;
  averageAccuracy: number;
  averageSpeed: number;
  successRate: number;
  activeMode: string;
  quantumEnhancement: number;
  asiOptimization: number;
  lastUpdate: string;
}

interface AutomationTask {
  id: string;
  name: string;
  type: 'analysis' | 'research' | 'monitoring' | 'prediction' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  mode: string;
  startTime: string;
  endTime?: string;
  confidence: number;
}

export function AutomationPage() {
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState<string>('');
  const [taskInput, setTaskInput] = useState('');
  const [taskPriority, setTaskPriority] = useState<string>('medium');

  const queryClient = useQueryClient();

  // Get automation modes
  const { data: modes, isLoading: modesLoading } = useQuery<AutomationMode[]>({
    queryKey: ['/api/automation/modes'],
    refetchInterval: 30000
  });

  // Get current mode
  const { data: currentMode } = useQuery<AutomationMode>({
    queryKey: ['/api/automation/current-mode'],
    refetchInterval: 10000
  });

  // Get metrics
  const { data: metrics } = useQuery<AIExcellenceMetrics>({
    queryKey: ['/api/automation/metrics'],
    refetchInterval: 5000
  });

  // Get active tasks
  const { data: activeTasks } = useQuery<AutomationTask[]>({
    queryKey: ['/api/automation/tasks/active'],
    refetchInterval: 3000
  });

  // Get completed tasks
  const { data: completedTasks } = useQuery<AutomationTask[]>({
    queryKey: ['/api/automation/tasks/completed'],
    refetchInterval: 10000
  });

  // Set mode mutation
  const setModeMutation = useMutation({
    mutationFn: async (modeId: string) => {
      const response = await apiRequest('/api/automation/set-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/current-mode'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/metrics'] });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest('/api/automation/create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/metrics'] });
      setTaskName('');
      setTaskInput('');
    }
  });

  const handleSetMode = () => {
    if (selectedMode) {
      setModeMutation.mutate(selectedMode);
    }
  };

  const handleCreateTask = () => {
    if (taskName && taskType && taskInput) {
      createTaskMutation.mutate({
        name: taskName,
        type: taskType,
        input: JSON.parse(taskInput || '{}'),
        priority: taskPriority
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-blue-500';
      case 'advanced': return 'bg-green-500';
      case 'expert': return 'bg-orange-500';
      case 'quantum': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'basic': return <Cpu className="w-4 h-4" />;
      case 'advanced': return <Network className="w-4 h-4" />;
      case 'expert': return <Target className="w-4 h-4" />;
      case 'quantum': return <Brain className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (modesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading automation suite...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Excellence Automation Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Advanced AI modes for quantum-enhanced automation and intelligence
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {currentMode?.name || 'No Active Mode'}
        </Badge>
      </div>

      {/* Current Mode Status */}
      {currentMode && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              {getLevelIcon(currentMode.level)}
              <CardTitle className="text-xl">{currentMode.name}</CardTitle>
              <Badge className={`${getLevelColor(currentMode.level)} text-white`}>
                {currentMode.level.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{currentMode.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                <Progress value={currentMode.performance.accuracy * 100} className="mt-1" />
                <div className="text-xs text-gray-500 mt-1">
                  {(currentMode.performance.accuracy * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Speed</div>
                <Progress value={currentMode.performance.speed * 100} className="mt-1" />
                <div className="text-xs text-gray-500 mt-1">
                  {(currentMode.performance.speed * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reliability</div>
                <Progress value={currentMode.performance.reliability * 100} className="mt-1" />
                <div className="text-xs text-gray-500 mt-1">
                  {(currentMode.performance.reliability * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Capabilities</div>
              <div className="flex flex-wrap gap-2">
                {currentMode.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="text-xs">
                    {capability.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{metrics.totalTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{(metrics.averageAccuracy * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{metrics.asiOptimization.toFixed(2)}x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ASI Enhancement</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="modes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modes">AI Modes</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* AI Modes Tab */}
        <TabsContent value="modes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select AI Excellence Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AI mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {modes?.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(mode.level)}
                          <span>{mode.name}</span>
                          <Badge className={`${getLevelColor(mode.level)} text-white text-xs`}>
                            {mode.level}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSetMode} 
                  disabled={!selectedMode || setModeMutation.isPending}
                  className="w-full"
                >
                  {setModeMutation.isPending ? 'Switching Mode...' : 'Activate Selected Mode'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mode Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modes?.map((mode) => (
              <Card key={mode.id} className={mode.id === currentMode?.id ? 'ring-2 ring-purple-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(mode.level)}
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                    </div>
                    <Badge className={`${getLevelColor(mode.level)} text-white`}>
                      {mode.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {mode.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Capabilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {mode.capabilities.slice(0, 4).map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap.replace('_', ' ')}
                        </Badge>
                      ))}
                      {mode.capabilities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{mode.capabilities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="prediction">Prediction</SelectItem>
                    <SelectItem value="optimization">Optimization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Task input (JSON format)"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                rows={4}
              />

              <Select value={taskPriority} onValueChange={setTaskPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleCreateTask}
                disabled={!taskName || !taskType || !taskInput || createTaskMutation.isPending}
                className="w-full"
              >
                {createTaskMutation.isPending ? 'Creating Task...' : 'Create Task'}
              </Button>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks ({activeTasks?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeTasks?.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTaskStatusIcon(task.status)}
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {task.type} • {task.priority} priority
                        </div>
                      </div>
                    </div>
                    <Badge variant={task.status === 'running' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {(!activeTasks || activeTasks.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    No active tasks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedTasks?.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTaskStatusIcon(task.status)}
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Confidence: {(task.confidence * 100).toFixed(1)}% • Mode: {task.mode}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(task.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {(!completedTasks || completedTasks.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    No completed tasks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Task Completion Rate</div>
                      <Progress value={metrics.successRate * 100} className="mt-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {(metrics.successRate * 100).toFixed(1)}% of {metrics.totalTasks} total tasks
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Accuracy</div>
                      <Progress value={metrics.averageAccuracy * 100} className="mt-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {(metrics.averageAccuracy * 100).toFixed(1)}% across all completed tasks
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{metrics.quantumEnhancement}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Quantum Enhancement</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{metrics.asiOptimization.toFixed(2)}x</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">ASI Optimization</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metrics.averageSpeed.toFixed(2)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Speed</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}