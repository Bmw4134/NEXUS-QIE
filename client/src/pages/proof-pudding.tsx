import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Database, 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  Zap,
  DollarSign,
  Users,
  Clock,
  Shield,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';

interface MetricCategory {
  id: string;
  name: string;
  metrics: Metric[];
  status: 'excellent' | 'good' | 'warning' | 'critical';
  overallScore: number;
}

interface Metric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  drillDown: DrillDownData[];
}

interface DrillDownData {
  dimension: string;
  value: number | string;
  percentage?: number;
  subMetrics?: DrillDownData[];
}

export function ProofPuddingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('performance');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories } = useQuery<MetricCategory[]>({
    queryKey: ['/api/proof-pudding/categories', timeRange],
    queryFn: () => {
      return Promise.resolve([
        {
          id: 'performance',
          name: 'System Performance',
          status: 'good',
          overallScore: 87,
          metrics: [
            {
              id: 'response_time',
              name: 'Average Response Time',
              value: 245,
              unit: 'ms',
              trend: 'down',
              change: -8.3,
              target: 200,
              status: 'warning',
              drillDown: [
                { dimension: 'API Endpoints', value: 189, percentage: 77 },
                { dimension: 'Database Queries', value: 156, percentage: 64 },
                { dimension: 'External Services', value: 423, percentage: 173 },
                { dimension: 'File Operations', value: 98, percentage: 40 }
              ]
            },
            {
              id: 'throughput',
              name: 'Request Throughput',
              value: 2847,
              unit: 'req/min',
              trend: 'up',
              change: 12.7,
              target: 3000,
              status: 'good',
              drillDown: [
                { dimension: 'Peak Hours', value: 4200, percentage: 147 },
                { dimension: 'Business Hours', value: 3100, percentage: 108 },
                { dimension: 'Off Hours', value: 1200, percentage: 42 },
                { dimension: 'Weekend', value: 900, percentage: 31 }
              ]
            },
            {
              id: 'error_rate',
              name: 'Error Rate',
              value: 0.34,
              unit: '%',
              trend: 'down',
              change: -0.12,
              target: 0.1,
              status: 'warning',
              drillDown: [
                { dimension: '4xx Client Errors', value: 0.21, percentage: 62 },
                { dimension: '5xx Server Errors', value: 0.13, percentage: 38 },
                { dimension: 'Timeout Errors', value: 0.08, percentage: 24 },
                { dimension: 'Database Errors', value: 0.05, percentage: 15 }
              ]
            }
          ]
        },
        {
          id: 'business',
          name: 'Business Metrics',
          status: 'excellent',
          overallScore: 94,
          metrics: [
            {
              id: 'revenue',
              name: 'Revenue',
              value: 847523,
              unit: '$',
              trend: 'up',
              change: 18.5,
              target: 1000000,
              status: 'good',
              drillDown: [
                { dimension: 'Subscriptions', value: 623400, percentage: 73.6 },
                { dimension: 'One-time Purchases', value: 156800, percentage: 18.5 },
                { dimension: 'Enterprise Licenses', value: 67323, percentage: 7.9 }
              ]
            },
            {
              id: 'active_users',
              name: 'Active Users',
              value: 15647,
              unit: 'users',
              trend: 'up',
              change: 23.1,
              target: 20000,
              status: 'good',
              drillDown: [
                { dimension: 'Daily Active', value: 8934, percentage: 57.1 },
                { dimension: 'Weekly Active', value: 12456, percentage: 79.6 },
                { dimension: 'Monthly Active', value: 15647, percentage: 100 },
                { dimension: 'Enterprise Users', value: 2847, percentage: 18.2 }
              ]
            },
            {
              id: 'conversion_rate',
              name: 'Conversion Rate',
              value: 3.4,
              unit: '%',
              trend: 'up',
              change: 0.7,
              target: 5.0,
              status: 'good',
              drillDown: [
                { dimension: 'Landing Page', value: 4.2, percentage: 124 },
                { dimension: 'Product Page', value: 2.8, percentage: 82 },
                { dimension: 'Email Campaign', value: 5.1, percentage: 150 },
                { dimension: 'Social Media', value: 1.9, percentage: 56 }
              ]
            }
          ]
        },
        {
          id: 'infrastructure',
          name: 'Infrastructure',
          status: 'good',
          overallScore: 89,
          metrics: [
            {
              id: 'cpu_usage',
              name: 'CPU Usage',
              value: 67,
              unit: '%',
              trend: 'stable',
              change: 2.1,
              target: 80,
              status: 'good',
              drillDown: [
                { dimension: 'Web Servers', value: 72, percentage: 90 },
                { dimension: 'Database Servers', value: 84, percentage: 105 },
                { dimension: 'Background Workers', value: 45, percentage: 56 },
                { dimension: 'Load Balancers', value: 23, percentage: 29 }
              ]
            },
            {
              id: 'memory_usage',
              name: 'Memory Usage',
              value: 78,
              unit: '%',
              trend: 'up',
              change: 5.4,
              target: 85,
              status: 'warning',
              drillDown: [
                { dimension: 'Application Memory', value: 12.4, percentage: 62 },
                { dimension: 'Database Cache', value: 4.8, percentage: 24 },
                { dimension: 'File System Cache', value: 2.1, percentage: 11 },
                { dimension: 'Other Processes', value: 0.7, percentage: 3 }
              ]
            },
            {
              id: 'disk_usage',
              name: 'Disk Usage',
              value: 56,
              unit: '%',
              trend: 'up',
              change: 3.2,
              target: 80,
              status: 'good',
              drillDown: [
                { dimension: 'Application Data', value: 1.2, percentage: 42 },
                { dimension: 'Database Files', value: 0.8, percentage: 28 },
                { dimension: 'Log Files', value: 0.5, percentage: 18 },
                { dimension: 'Backup Files', value: 0.3, percentage: 12 }
              ]
            }
          ]
        },
        {
          id: 'security',
          name: 'Security & Compliance',
          status: 'excellent',
          overallScore: 96,
          metrics: [
            {
              id: 'security_score',
              name: 'Security Score',
              value: 96,
              unit: '/100',
              trend: 'up',
              change: 2.1,
              target: 95,
              status: 'excellent',
              drillDown: [
                { dimension: 'Vulnerability Assessment', value: 98, percentage: 102 },
                { dimension: 'Access Control', value: 95, percentage: 99 },
                { dimension: 'Data Encryption', value: 100, percentage: 105 },
                { dimension: 'Audit Compliance', value: 91, percentage: 96 }
              ]
            },
            {
              id: 'failed_logins',
              name: 'Failed Login Attempts',
              value: 47,
              unit: 'attempts',
              trend: 'down',
              change: -23.5,
              status: 'excellent',
              drillDown: [
                { dimension: 'Brute Force Attempts', value: 28, percentage: 60 },
                { dimension: 'Invalid Credentials', value: 12, percentage: 26 },
                { dimension: 'Expired Sessions', value: 7, percentage: 15 }
              ]
            }
          ]
        }
      ]);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const selectedCategoryData = categories?.find(cat => cat.id === selectedCategory);
  const selectedMetricData = selectedCategoryData?.metrics.find(m => m.id === selectedMetric);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="w-8 h-8 text-purple-600" />
          Proof in the Pudding
        </h1>
        <Badge variant="default" className="bg-purple-600">
          Comprehensive Metrics
        </Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Metrics Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories?.map((category) => (
          <Card key={category.id} 
                className={`cursor-pointer transition-all ${selectedCategory === category.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedCategory(category.id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{category.name}</span>
                <Badge className={getStatusColor(category.status)}>
                  {category.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.overallScore}/100</div>
              <Progress value={category.overallScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {category.metrics.length} metrics tracked
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Metrics */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Metrics List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Metrics Overview</h3>
              {selectedCategoryData?.metrics.map((metric) => (
                <Card key={metric.id} 
                      className={`cursor-pointer transition-all ${selectedMetric === metric.id ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setSelectedMetric(metric.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{metric.name}</h4>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {typeof metric.value === 'number' && metric.value > 1000
                          ? metric.value.toLocaleString()
                          : metric.value} {metric.unit}
                      </div>
                      <div className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                    {metric.target && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress to Target</span>
                          <span>{metric.target} {metric.unit}</span>
                        </div>
                        <Progress value={(Number(metric.value) / metric.target) * 100} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Drill Down View */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Drill Down Analysis
              </h3>
              {selectedMetricData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      {selectedMetricData.name} Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMetricData.drillDown.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.dimension}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {typeof item.value === 'number' && item.value > 1000
                                ? item.value.toLocaleString()
                                : item.value}
                            </span>
                            {item.percentage && (
                              <Badge variant="outline" className="text-xs">
                                {item.percentage}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        {item.percentage && (
                          <Progress value={Math.min(item.percentage, 100)} />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a metric to view detailed breakdown</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center">
              <Server className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Uptime</div>
              <div className="text-lg font-bold">99.9%</div>
            </div>
            <div className="text-center">
              <Cpu className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">CPU</div>
              <div className="text-lg font-bold">67%</div>
            </div>
            <div className="text-center">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-sm font-medium">Storage</div>
              <div className="text-lg font-bold">56%</div>
            </div>
            <div className="text-center">
              <Network className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">Network</div>
              <div className="text-lg font-bold">98%</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-sm font-medium">Users</div>
              <div className="text-lg font-bold">15.6K</div>
            </div>
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Revenue</div>
              <div className="text-lg font-bold">$847K</div>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Security</div>
              <div className="text-lg font-bold">96/100</div>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Health</div>
              <div className="text-lg font-bold">Excellent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}