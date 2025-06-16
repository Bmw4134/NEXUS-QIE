import { useState, useEffect, useCallback } from 'react';
import { Shield, TrendingUp, DollarSign, Activity, AlertTriangle, Zap, Brain, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardMetrics {
  totalValue: number;
  tradingBalance: number;
  totalTrades: number;
  successRate: number;
  activeAlerts: number;
  systemHealth: number;
  aiInsights: string[];
  marketTrends: Array<{
    time: string;
    value: number;
    prediction: number;
  }>;
  portfolioDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface AutomatedAlert {
  id: string;
  type: 'trading' | 'system' | 'market' | 'ai';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  resolved: boolean;
}

export function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalValue: 0,
    tradingBalance: 0,
    totalTrades: 0,
    successRate: 0,
    activeAlerts: 0,
    systemHealth: 0,
    aiInsights: [],
    marketTrends: [],
    portfolioDistribution: []
  });

  const [automatedAlerts, setAutomatedAlerts] = useState<AutomatedAlert[]>([]);
  const [alertsVisible, setAlertsVisible] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts/active');
        if (response.ok) {
          const alerts = await response.json();
          setAutomatedAlerts(alerts);
        } else {
          // Silently handle API errors to prevent console spam
          setAutomatedAlerts([]);
        }
      } catch (error) {
        // Silently handle network errors
        setAutomatedAlerts([]);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Reduced frequency
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      if (response.ok) {
        setAutomatedAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, resolved: true } : alert
          )
        );
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex">
          <AppSidebar />
          <SidebarInset className="flex-1">
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SidebarTrigger />
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">NEXUS Command</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Quantum Trading Suite</p>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Live Data
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="p-6">
        {/* Autonomous Alert System */}
        {alertsVisible && automatedAlerts.filter(a => !a.resolved).length > 0 && (
          <div className="mb-6 space-y-3">
            {automatedAlerts.filter(a => !a.resolved).slice(0, 3).map((alert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <strong>{alert.title}</strong>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quantum Trading Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time market intelligence and automated trading insights
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trading Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.tradingBalance.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {metrics.systemHealth}%
                <Zap className="ml-2 h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Market Insights
              </CardTitle>
              <CardDescription>
                Real-time analysis powered by quantum intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.aiInsights.length > 0 ? (
                  metrics.aiInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Loading AI insights...</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution</CardTitle>
              <CardDescription>
                Current asset allocation breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.portfolioDistribution.length > 0 ? (
                  metrics.portfolioDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        ${item.value.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Loading portfolio data...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}