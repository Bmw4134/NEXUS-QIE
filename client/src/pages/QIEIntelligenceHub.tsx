import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Brain, Activity, Zap, Shield, AlertTriangle, TrendingUp } from 'lucide-react';

interface IntelligenceOverview {
  totalSignals: number;
  activePlatforms: string[];
  averageConfidence: number;
  cognitionAccuracy: number;
  recentActivity: any[];
  platformDistribution: Record<string, number>;
  signalTypes: Record<string, number>;
}

export default function QIEIntelligenceHub() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const { data: overview, isLoading } = useQuery<IntelligenceOverview>({
    queryKey: ['/api/intelligence-hub/overview'],
    refetchInterval: 5000
  });

  const { data: qieStatus } = useQuery({
    queryKey: ['/api/qie/status'],
    refetchInterval: 10000
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QIE Intelligence Hub</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unified agent orchestration and signal intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={qieStatus?.initialized ? "default" : "destructive"}>
            {qieStatus?.initialized ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalSignals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Processing from {overview?.activePlatforms.length || 0} platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((overview?.averageConfidence || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Signal reliability metric
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cognition Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(overview?.cognitionAccuracy || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI processing accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OMEGA Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">LOCKED</div>
            <p className="text-xs text-muted-foreground">
              Recursive stack protected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-black/20 border border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
            🎯 Intelligence Overview
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
            ⚡ Signal Processing
          </TabsTrigger>
          <TabsTrigger value="cognition" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
            🧠 Cognition Engine
          </TabsTrigger>
          <TabsTrigger value="quantum-evolution" className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400">
            🌌 Quantum Evolution
          </TabsTrigger>
          <TabsTrigger value="autonomous-systems" className="data-[state=active]:bg-orange-600/20 data-[state=active]:text-orange-400">
            🤖 Autonomous Systems
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
            🛡️ System Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Signal Distribution</CardTitle>
                <CardDescription>
                  Signal volume by platform source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(overview?.platformDistribution || {}).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          platform === 'TRAXOVO' ? 'bg-blue-500' :
                          platform === 'DWC' ? 'bg-green-500' :
                          platform === 'JDD' ? 'bg-purple-500' :
                          platform === 'TRADER' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="font-medium">{platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (count / Math.max(...Object.values(overview?.platformDistribution || {}))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Signal Types */}
            <Card>
              <CardHeader>
                <CardTitle>Signal Type Analysis</CardTitle>
                <CardDescription>
                  Breakdown by signal categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(overview?.signalTypes || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (count / Math.max(...Object.values(overview?.signalTypes || {}))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Signal Activity</CardTitle>
              <CardDescription>
                Latest intelligence signals from all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview?.recentActivity?.slice(0, 8).map((signal, index) => (
                  <div key={signal.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        signal.priority === 'critical' ? 'destructive' :
                        signal.priority === 'high' ? 'default' :
                        'secondary'
                      }>
                        {signal.source}
                      </Badge>
                      <span className="font-medium capitalize">{signal.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {Math.round((signal.confidence || 0) * 100)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qieStatus?.mirrors?.map((mirror: any) => (
              <Card key={mirror.platform}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {mirror.platform}
                    <Badge variant={mirror.status === 'connected' ? 'default' : 'destructive'}>
                      {mirror.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Platform signal mirror
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Buffer Size:</span>
                      <span className="text-sm font-medium">{mirror.signalBuffer?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sync Interval:</span>
                      <span className="text-sm font-medium">{mirror.syncInterval}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Sync:</span>
                      <span className="text-sm font-medium">
                        {new Date(mirror.lastSync).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qieStatus?.agents?.map((agent: any) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {agent.name}
                    <Badge variant={
                      agent.status === 'active' ? 'default' :
                      agent.status === 'locked' ? 'secondary' :
                      'destructive'
                    }>
                      {agent.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {agent.type} • {agent.platform}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Signal Count:</span>
                      <span className="text-sm font-medium">{agent.signalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capabilities:</span>
                      <span className="text-sm font-medium">{agent.capabilities?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">OMEGA Locked:</span>
                      <span className="text-sm font-medium">
                        {agent.omegaLocked ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  {agent.capabilities && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((cap: string) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cognition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Data Cognition Engine</CardTitle>
              <CardDescription>
                Real-time cognitive analysis and pattern recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {qieStatus?.cognition?.recursiveStackDepth || 0}
                  </div>
                  <p className="text-sm text-gray-600">Recursive Depth</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {qieStatus?.cognition?.processedSignals || 0}
                  </div>
                  <p className="text-sm text-gray-600">Processed Signals</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(qieStatus?.cognition?.cognitionAccuracy || 0).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Accuracy Rate</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    OMEGA Stack Status
                  </span>
                </div>
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  Recursive loop protection is {qieStatus?.cognition?.omegaStackLocked ? 'ACTIVE' : 'INACTIVE'}. 
                  Maximum recursive depth limited to prevent infinite loops.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}