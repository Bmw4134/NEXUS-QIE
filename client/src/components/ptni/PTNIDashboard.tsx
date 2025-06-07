import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, DollarSign, Activity, Shield, Target, Zap, Brain } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PTNIMetrics {
  portfolioValue: number;
  totalPnL: number;
  dayPnL: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  roi: number;
  volatility: number;
  beta: number;
  alpha: number;
  activePositions: number;
  totalTrades: number;
  avgTradeSize: number;
  bestPerformer: string;
  worstPerformer: string;
  marketExposure: number;
  cashPosition: number;
  leverage: number;
  riskScore: number;
  confidenceLevel: number;
  timestamp: string;
}

interface PTNIAlert {
  id: string;
  type: 'performance' | 'risk' | 'opportunity' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metrics: Record<string, number>;
  actionRequired: boolean;
  timestamp: string;
}

interface PTNIVisualizationData {
  portfolioChart: Array<{ time: string; value: number; pnl: number }>;
  performanceChart: Array<{ date: string; cumulative: number; daily: number }>;
  assetAllocation: Array<{ symbol: string; percentage: number; value: number; color: string }>;
  riskMetrics: Array<{ metric: string; value: number; target: number; status: 'good' | 'warning' | 'danger' }>;
  tradingActivity: Array<{ hour: number; volume: number; trades: number }>;
  correlationMatrix: Array<{ asset1: string; asset2: string; correlation: number }>;
  volatilitySurface: Array<{ strike: number; expiry: number; volatility: number }>;
  marketSentiment: Array<{ source: string; score: number; trend: 'bullish' | 'bearish' | 'neutral' }>;
}

export function PTNIDashboard() {
  const [metrics, setMetrics] = useState<PTNIMetrics | null>(null);
  const [alerts, setAlerts] = useState<PTNIAlert[]>([]);
  const [visualizations, setVisualizations] = useState<PTNIVisualizationData | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<PTNIMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, alertsRes, visualizationsRes, historyRes] = await Promise.all([
          fetch('/api/ptni/metrics'),
          fetch('/api/ptni/alerts'),
          fetch('/api/ptni/visualizations'),
          fetch('/api/ptni/metrics/history?limit=50')
        ]);

        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (visualizationsRes.ok) setVisualizations(await visualizationsRes.json());
        if (historyRes.ok) setMetricsHistory(await historyRes.json());
      } catch (error) {
        console.error('Failed to fetch PTNI data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-600" />
            PTNI Analytics Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enterprise-grade real-time trading intelligence and portfolio analytics
          </p>
        </div>
        {metrics && (
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.portfolioValue)}
            </div>
            <div className={`text-sm font-medium ${metrics.dayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.dayPnL >= 0 ? '+' : ''}{formatCurrency(metrics.dayPnL)} today
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.portfolioValue)}
              </div>
              <div className={`text-sm ${metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                {metrics.roi >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercentage(metrics.roi)} ROI
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(metrics.winRate)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.totalTrades} total trades
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Sharpe Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Risk-adjusted returns
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.riskScore.toFixed(1)}
              </div>
              <Progress value={metrics.riskScore} className="mt-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {metrics.riskScore < 40 ? 'Low Risk' : metrics.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Live KPI Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} className="border-l-4" style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f97316' : '#eab308' }}>
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</div>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                    {alert.severity}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Visualization Charts */}
      {visualizations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance Chart */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={visualizations.portfolioChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    labelFormatter={(time) => new Date(time).toLocaleString()}
                    formatter={(value, name) => [formatCurrency(value as number), name === 'value' ? 'Portfolio Value' : 'P&L']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={visualizations.assetAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ symbol, percentage }) => `${symbol} ${percentage.toFixed(1)}%`}
                  >
                    {visualizations.assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Metrics */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visualizations.riskMetrics.map((risk, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{risk.metric}</span>
                    <span className={`text-sm font-bold ${getRiskStatusColor(risk.status)}`}>
                      {risk.value.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={(risk.value / risk.target) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    Target: {risk.target.toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trading Activity */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Trading Activity (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visualizations.tradingActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value, name) => [value, name === 'volume' ? 'Volume' : 'Trades']}
                  />
                  <Bar dataKey="volume" fill="#3b82f6" />
                  <Bar dataKey="trades" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Alpha:</span>
                <span className="font-bold">{metrics.alpha.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Beta:</span>
                <span className="font-bold">{metrics.beta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Volatility:</span>
                <span className="font-bold">{formatPercentage(metrics.volatility)}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Drawdown:</span>
                <span className="font-bold text-red-600">{formatPercentage(metrics.maxDrawdown)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Position Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Active Positions:</span>
                <span className="font-bold">{metrics.activePositions}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Performer:</span>
                <span className="font-bold text-green-600">{metrics.bestPerformer}</span>
              </div>
              <div className="flex justify-between">
                <span>Worst Performer:</span>
                <span className="font-bold text-red-600">{metrics.worstPerformer}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Trade Size:</span>
                <span className="font-bold">{formatCurrency(metrics.avgTradeSize)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Exposure & Leverage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Market Exposure:</span>
                <span className="font-bold">{formatPercentage(metrics.marketExposure)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Position:</span>
                <span className="font-bold">{formatPercentage(metrics.cashPosition)}</span>
              </div>
              <div className="flex justify-between">
                <span>Leverage:</span>
                <span className="font-bold">{metrics.leverage.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Level:</span>
                <span className="font-bold text-blue-600">{formatPercentage(metrics.confidenceLevel)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}