import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain, 
  Command, 
  Activity,
  History,
  Eye,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Database,
  Server,
  Shield,
  Crown,
  Cpu
} from 'lucide-react';

interface WatsonCommand {
  id: string;
  type: 'system' | 'optimization' | 'analysis' | 'emergency' | 'evolution';
  command: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'executing' | 'completed' | 'failed';
  result?: any;
  timestamp: string;
  fingerprint: string;
}

interface SystemMemory {
  chatHistory: Array<{
    timestamp: string;
    context: string;
    decisions: string[];
    outcomes: string[];
  }>;
  evolutionState: {
    currentVersion: string;
    appliedPatches: string[];
    systemFingerprint: string;
    lastEvolution: string;
  };
  userIntent: {
    primaryGoals: string[];
    preferences: Record<string, any>;
    constraints: string[];
  };
}

interface WatsonState {
  memory: SystemMemory;
  playwright: {
    isReady: boolean;
    browserContexts: string[];
    automationScripts: string[];
    testSuites: string[];
    monitoringTargets: string[];
  };
  commandQueue: number;
  isMemoryAware: boolean;
  fingerprintLock: string;
}

interface VisualState {
  systemDashboard: {
    health: string;
    modules: number;
    status: string;
  };
  memoryDashboard: {
    awareness: string;
    retention: string;
    sync: string;
  };
  commandDashboard: {
    queued: number;
    executing: number;
    completed: number;
  };
}

export function WatsonCommandPage() {
  const [commandType, setCommandType] = useState<string>('system');
  const [commandText, setCommandText] = useState('');
  const [commandParams, setCommandParams] = useState('{}');
  const [priority, setPriority] = useState<string>('medium');
  const [naturalCommand, setNaturalCommand] = useState('');
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(true);
  const queryClient = useQueryClient();

  const { data: watsonState } = useQuery<WatsonState>({
    queryKey: ['/api/watson/state'],
    refetchInterval: 10000
  });

  const { data: commandHistory } = useQuery<WatsonCommand[]>({
    queryKey: ['/api/watson/history'],
    refetchInterval: 15000
  });

  const { data: visualState } = useQuery<VisualState>({
    queryKey: ['/api/watson/visual-state'],
    refetchInterval: 5000
  });

  const executeCommandMutation = useMutation({
    mutationFn: async (commandData: any) => {
      const response = await fetch('/api/watson/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commandData)
      });
      if (!response.ok) throw new Error('Failed to execute command');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watson/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/watson/state'] });
      setCommandText('');
      setCommandParams('{}');
      setNaturalCommand('');
    }
  });

  const handleExecuteCommand = () => {
    if (useNaturalLanguage) {
      if (!naturalCommand.trim()) return;
      
      executeCommandMutation.mutate({
        naturalCommand: naturalCommand,
        fingerprint: 'WATSON_USER'
      });
    } else {
      if (!commandText.trim()) return;
      
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(commandParams);
      } catch (error) {
        parsedParams = {};
      }

      executeCommandMutation.mutate({
        type: commandType,
        command: commandText,
        parameters: parsedParams,
        priority: priority,
        fingerprint: 'WATSON_COMMAND_READY'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'executing': return 'text-blue-600 bg-blue-100';
      case 'queued': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          Watson Command Engine
        </h1>
        <div className="flex items-center gap-2">
          <Badge className={watsonState?.isMemoryAware ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
            {watsonState?.isMemoryAware ? 'Memory Active' : 'Memory Inactive'}
          </Badge>
          <Badge variant="outline">
            {watsonState?.fingerprintLock?.slice(-8) || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Visual System State */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              System Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visualState?.systemDashboard?.health || '0%'}</div>
            <div className="text-sm text-muted-foreground">
              {visualState?.systemDashboard?.modules || 0} modules active
            </div>
            <Badge className="mt-2 bg-green-100 text-green-800">
              {visualState?.systemDashboard?.status || 'Unknown'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Memory Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visualState?.memoryDashboard?.awareness || 'Inactive'}</div>
            <div className="text-sm text-muted-foreground">
              Retention: {visualState?.memoryDashboard?.retention || 'Unknown'}
            </div>
            <Badge className="mt-2 bg-blue-100 text-blue-800">
              {visualState?.memoryDashboard?.sync || 'No Sync'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Command className="w-4 h-4" />
              Command Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Queued:</span>
                <span className="font-medium">{visualState?.commandDashboard?.queued || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Executing:</span>
                <span className="font-medium">{visualState?.commandDashboard?.executing || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completed:</span>
                <span className="font-medium">{visualState?.commandDashboard?.completed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Command Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Command className="w-5 h-5" />
            Execute Watson Command
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle between Natural Language and Technical Mode */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={useNaturalLanguage}
              onCheckedChange={setUseNaturalLanguage}
            />
            <label className="text-sm font-medium">
              {useNaturalLanguage ? 'Natural Language Mode' : 'Technical Mode'}
            </label>
          </div>

          {useNaturalLanguage ? (
            /* Natural Language Interface */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tell Watson what you need:</label>
                <div className="space-y-2">
                  <Input
                    placeholder="e.g., 'Check system health', 'Run optimization', 'Show me the current status'"
                    value={naturalCommand}
                    onChange={(e) => setNaturalCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
                  />
                  <div className="text-xs text-muted-foreground">
                    Examples: "How are you?", "Optimize the system", "Run a full scan", "Show insights", "Enable safe mode"
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Technical Interface */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Command Type</label>
                  <Select value={commandType} onValueChange={setCommandType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="optimization">Optimization</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="evolution">Evolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Command</label>
                <Input
                  value={commandText}
                  onChange={(e) => setCommandText(e.target.value)}
                  placeholder="system_status, full_system_scan, emergency_shutdown..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parameters (JSON)</label>
                <Textarea
                  value={commandParams}
                  onChange={(e) => setCommandParams(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={3}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleExecuteCommand}
            disabled={useNaturalLanguage ? !naturalCommand.trim() : !commandText.trim() || executeCommandMutation.isPending}
            className="w-full"
          >
            <Command className="w-4 h-4 mr-2" />
            {useNaturalLanguage ? 'Send Message to Watson' : 'Execute Command'}
          </Button>

          {executeCommandMutation.data && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-sm font-medium text-green-800 dark:text-green-300">
                {executeCommandMutation.data.message || 'Command Queued Successfully'}
              </div>
              <div className="text-xs text-green-700 dark:text-green-400">
                ID: {executeCommandMutation.data.commandId}
                {executeCommandMutation.data.interpretedFrom && (
                  <div>Interpreted from: "{executeCommandMutation.data.interpretedFrom}"</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Memory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Memory ({watsonState?.memory?.chatHistory?.length || 0} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Evolution State</h3>
              <div className="space-y-2 text-sm">
                <div>Version: {watsonState?.memory?.evolutionState?.currentVersion}</div>
                <div>Patches: {watsonState?.memory?.evolutionState?.appliedPatches?.length || 0}</div>
                <div>Fingerprint: {watsonState?.memory?.evolutionState?.systemFingerprint?.slice(-12)}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">User Intent</h3>
              <div className="space-y-2 text-sm">
                <div>Goals: {watsonState?.memory?.userIntent?.primaryGoals?.length || 0}</div>
                <div>Constraints: {watsonState?.memory?.userIntent?.constraints?.length || 0}</div>
                <div>Safe Mode: {watsonState?.memory?.userIntent?.preferences?.safeMode ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Command History ({commandHistory?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commandHistory?.map((command) => (
              <div key={command.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{command.type}</Badge>
                    <span className="font-medium">{command.command}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(command.status)}>
                      {command.status}
                    </Badge>
                    <Badge className={getPriorityColor(command.priority)}>
                      {command.priority}
                    </Badge>
                  </div>
                </div>
                
                {command.result && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 mt-2">
                    <div className="text-xs font-medium mb-1">Result:</div>
                    <pre className="text-xs overflow-x-auto">
                      {typeof command.result === 'string' ? command.result : JSON.stringify(command.result, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(command.timestamp).toLocaleString()}
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                <Command className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No commands executed yet</p>
                <p className="text-sm">Execute your first Watson command above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Playwright Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Playwright Automation Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="font-medium mb-2">Browser Contexts</div>
              <div className="space-y-1">
                {watsonState?.playwright?.browserContexts?.map((context) => (
                  <Badge key={context} variant="outline" className="text-xs">
                    {context}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Automation Scripts</div>
              <div className="space-y-1">
                {watsonState?.playwright?.automationScripts?.map((script) => (
                  <Badge key={script} variant="outline" className="text-xs">
                    {script}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Test Suites</div>
              <div className="space-y-1">
                {watsonState?.playwright?.testSuites?.map((suite) => (
                  <Badge key={suite} variant="outline" className="text-xs">
                    {suite}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Monitoring</div>
              <div className="space-y-1">
                {watsonState?.playwright?.monitoringTargets?.map((target) => (
                  <Badge key={target} variant="outline" className="text-xs">
                    {target}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${watsonState?.playwright?.isReady ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">
                Playwright Status: {watsonState?.playwright?.isReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}