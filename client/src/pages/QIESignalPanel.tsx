import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Radio, Zap, Filter, Search, AlertCircle, TrendingUp, Clock } from 'lucide-react';

interface SignalFeed {
  signals: Array<{
    id: string;
    source: string;
    type: string;
    priority: string;
    confidence: number;
    timestamp: string;
    summary: string;
  }>;
  metadata: {
    totalCount: number;
    lastUpdate: string;
    platforms: string[];
  };
}

export default function QIESignalPanel() {
  const [filterSource, setFilterSource] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: liveFeed, isLoading, refetch } = useQuery<SignalFeed>({
    queryKey: ['/api/signal-panel/live-feed'],
    refetchInterval: autoRefresh ? 3000 : false
  });

  const filteredSignals = liveFeed?.signals.filter(signal => {
    const matchesSource = filterSource === 'all' || signal.source === filterSource;
    const matchesType = filterType === 'all' || signal.type === filterType;
    const matchesSearch = !searchTerm || 
      signal.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSource && matchesType && matchesSearch;
  }) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'TRAXOVO': return 'border-blue-500 text-blue-700 bg-blue-50';
      case 'DWC': return 'border-green-500 text-green-700 bg-green-50';
      case 'JDD': return 'border-purple-500 text-purple-700 bg-purple-50';
      case 'TRADER': return 'border-orange-500 text-orange-700 bg-orange-50';
      default: return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">QIE Signal Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Live signal feed from unified agent orchestration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={autoRefresh ? "default" : "secondary"}>
            <Radio className="h-3 w-3 mr-1" />
            {autoRefresh ? "Live" : "Paused"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveFeed?.metadata.totalCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active signal count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveFeed?.metadata.platforms.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Connected sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSignals.length > 0 
                ? (filteredSignals.reduce((sum, s) => sum + s.confidence, 0) / filteredSignals.length * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Signal reliability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {liveFeed?.metadata.lastUpdate 
                ? new Date(liveFeed.metadata.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : '--:--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time sync
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Signal Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search signals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Source Platform</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="all">All Platforms</option>
                {liveFeed?.metadata.platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Signal Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="all">All Types</option>
                <option value="trading">Trading</option>
                <option value="research">Research</option>
                <option value="monitoring">Monitoring</option>
                <option value="analysis">Analysis</option>
                <option value="prediction">Prediction</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterSource('all');
                  setFilterType('all');
                  setSearchTerm('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredSignals.length} of {liveFeed?.signals.length || 0} signals
          </div>
        </CardContent>
      </Card>

      {/* Live Signal Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Signal Feed</CardTitle>
          <CardDescription>
            Real-time intelligence signals from all connected platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSignals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No signals match your current filters
              </div>
            ) : (
              filteredSignals.map((signal) => (
                <div key={signal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(signal.priority)}`}></div>
                        <Badge className={getSourceColor(signal.source)}>
                          {signal.source}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {signal.type}
                        </Badge>
                        <Badge variant={signal.priority === 'critical' ? 'destructive' : 'secondary'}>
                          {signal.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {signal.summary}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Confidence: {Math.round(signal.confidence * 100)}%</span>
                        <span>•</span>
                        <span>{new Date(signal.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>ID: {signal.id.slice(-8)}</span>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${signal.confidence * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center mt-1 text-gray-500">
                        {Math.round(signal.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveFeed?.metadata.platforms.map(platform => {
          const platformSignals = liveFeed.signals.filter(s => s.source === platform);
          const avgConfidence = platformSignals.length > 0 
            ? platformSignals.reduce((sum, s) => sum + s.confidence, 0) / platformSignals.length
            : 0;
          
          return (
            <Card key={platform}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{platform}</CardTitle>
                <CardDescription>Platform signal summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Signal Count:</span>
                    <span className="text-sm font-medium">{platformSignals.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Confidence:</span>
                    <span className="text-sm font-medium">{(avgConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Latest:</span>
                    <span className="text-sm font-medium">
                      {platformSignals.length > 0 
                        ? new Date(platformSignals[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        : 'No signals'
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      platform === 'TRAXOVO' ? 'bg-blue-500' :
                      platform === 'DWC' ? 'bg-green-500' :
                      platform === 'JDD' ? 'bg-purple-500' :
                      platform === 'TRADER' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${Math.max(10, avgConfidence * 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}