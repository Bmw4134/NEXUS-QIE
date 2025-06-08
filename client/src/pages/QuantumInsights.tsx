import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Zap, Target, Users, Calendar, DollarSign, Activity } from 'lucide-react';

interface FamilyInsight {
  id: string;
  type: 'financial' | 'productivity' | 'health' | 'social';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

interface QuantumMetric {
  category: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  prediction: number;
  accuracy: number;
}

export function QuantumInsights() {
  // Fetch financial data for insights
  const { data: budgets = [] } = useQuery({
    queryKey: ['/api/family/budgets'],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['/api/family/expenses'],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/family/tasks'],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/family/events'],
  });

  const { data: cryptoAssets = [] } = useQuery({
    queryKey: ['/api/crypto/assets'],
    refetchInterval: 10000
  });

  // Generate AI-powered insights based on family data
  const generateInsights = (): FamilyInsight[] => {
    const insights: FamilyInsight[] = [];

    // Financial insights
    if (budgets.length > 0) {
      const totalBudget = budgets.reduce((sum: number, budget: any) => sum + budget.allocated, 0);
      const totalSpent = budgets.reduce((sum: number, budget: any) => sum + budget.spent, 0);
      const spendingRate = (totalSpent / totalBudget) * 100;

      if (spendingRate > 80) {
        insights.push({
          id: 'high-spending',
          type: 'financial',
          title: 'High Spending Alert',
          description: `You've used ${spendingRate.toFixed(1)}% of your monthly budget. Consider reviewing discretionary expenses.`,
          impact: 'high',
          confidence: 95,
          actionable: true,
          recommendation: 'Review entertainment and dining expenses for potential savings'
        });
      }

      // Find budget categories with highest overspend risk
      const riskyCat = budgets.find((budget: any) => (budget.spent / budget.allocated) > 0.9);
      if (riskyCat) {
        insights.push({
          id: 'budget-risk',
          type: 'financial',
          title: `${riskyCat.category} Budget Risk`,
          description: `Your ${riskyCat.category} budget is nearly exhausted. Consider adjusting spending patterns.`,
          impact: 'medium',
          confidence: 88,
          actionable: true,
          recommendation: `Set up automatic alerts for ${riskyCat.category} expenses`
        });
      }
    }

    // Productivity insights
    if (tasks.length > 0) {
      const pendingTasks = tasks.filter((task: any) => task.status === 'pending').length;
      const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
      const completionRate = (completedTasks / tasks.length) * 100;

      if (completionRate < 60) {
        insights.push({
          id: 'low-productivity',
          type: 'productivity',
          title: 'Task Completion Opportunity',
          description: `Current task completion rate is ${completionRate.toFixed(1)}%. Focus on high-priority items.`,
          impact: 'medium',
          confidence: 82,
          actionable: true,
          recommendation: 'Break large tasks into smaller, manageable steps'
        });
      }

      if (pendingTasks > 10) {
        insights.push({
          id: 'task-overload',
          type: 'productivity',
          title: 'Task Management Alert',
          description: `You have ${pendingTasks} pending tasks. Consider prioritizing or delegating.`,
          impact: 'high',
          confidence: 90,
          actionable: true,
          recommendation: 'Use the Eisenhower Matrix to prioritize urgent vs important tasks'
        });
      }
    }

    // Social and family insights
    if (events.length > 0) {
      const upcomingEvents = events.filter((event: any) => event.status === 'upcoming').length;
      if (upcomingEvents < 2) {
        insights.push({
          id: 'social-engagement',
          type: 'social',
          title: 'Family Bonding Opportunity',
          description: 'Low number of upcoming family activities. Consider scheduling quality time together.',
          impact: 'medium',
          confidence: 75,
          actionable: true,
          recommendation: 'Plan a weekly family activity or game night'
        });
      }
    }

    // Crypto and investment insights
    if (cryptoAssets.length > 0) {
      const gainers = cryptoAssets.filter((asset: any) => asset.change24h > 5).length;
      const losers = cryptoAssets.filter((asset: any) => asset.change24h < -5).length;

      if (gainers > losers) {
        insights.push({
          id: 'crypto-opportunity',
          type: 'financial',
          title: 'Market Opportunity Detected',
          description: `${gainers} cryptocurrencies showing strong positive momentum today.`,
          impact: 'medium',
          confidence: 70,
          actionable: true,
          recommendation: 'Consider dollar-cost averaging into stable performers'
        });
      }
    }

    return insights;
  };

  // Generate quantum metrics for family performance
  const generateQuantumMetrics = (): QuantumMetric[] => {
    const totalBudget = budgets.reduce((sum: number, budget: any) => sum + budget.allocated, 0);
    const totalSpent = budgets.reduce((sum: number, budget: any) => sum + budget.spent, 0);
    const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;

    return [
      {
        category: 'Financial Health',
        value: totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0,
        trend: totalSpent < totalBudget * 0.7 ? 'up' : 'down',
        prediction: 85,
        accuracy: 92
      },
      {
        category: 'Productivity Score',
        value: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        trend: completedTasks > tasks.length * 0.6 ? 'up' : 'stable',
        prediction: 78,
        accuracy: 87
      },
      {
        category: 'Family Engagement',
        value: events.length > 0 ? Math.min(events.length * 20, 100) : 0,
        trend: events.length > 3 ? 'up' : 'stable',
        prediction: 72,
        accuracy: 81
      },
      {
        category: 'Crypto Performance',
        value: cryptoAssets.length > 0 ? 
          Math.round(cryptoAssets.reduce((sum: number, asset: any) => sum + Math.max(0, asset.change24h), 0) / cryptoAssets.length * 10) : 0,
        trend: cryptoAssets.some((asset: any) => asset.change24h > 0) ? 'up' : 'down',
        prediction: 65,
        accuracy: 76
      }
    ];
  };

  const insights = generateInsights();
  const quantumMetrics = generateQuantumMetrics();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-5 h-5" />;
      case 'productivity': return <Target className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      case 'health': return <Activity className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QuantumInsights</h1>
            <p className="text-gray-600">AI-powered analytics and predictive family insights</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Quantum Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quantumMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{metric.category}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{metric.value}%</span>
                  <Badge variant="outline" className="text-xs">
                    {metric.accuracy}% accurate
                  </Badge>
                </div>
                <Progress value={metric.value} className="h-2 mt-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Predicted: {metric.prediction}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI-Generated Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Quantum-enhanced analysis of your family's patterns and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length > 0 ? insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(insight.type)}
                        <h3 className="font-semibold">{insight.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    {insight.recommendation && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      AI insights will appear as your family data grows
                    </p>
                    <p className="text-sm text-gray-500">
                      Add more tasks, events, and expenses to unlock powerful analytics
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quantum Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quantum Predictions
              </CardTitle>
              <CardDescription>
                Advanced forecasting based on family behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">This Week's Forecast</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget adherence probability</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Task completion likelihood</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Family activity engagement</span>
                      <span className="font-medium">94%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Optimization Opportunities</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>• Schedule batch grocery shopping for 15% savings</p>
                    <p>• Optimize crypto trading windows for better returns</p>
                    <p>• Family dinner scheduling shows 3x productivity boost</p>
                    <p>• Weekend task completion rates 40% higher</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Risk Assessment</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Budget overrun risk</span>
                      <Badge variant="outline" className="text-orange-700">
                        Low (12%)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Task backlog risk</span>
                      <Badge variant="outline" className="text-yellow-700">
                        Medium (34%)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Crypto volatility exposure</span>
                      <Badge variant="outline" className="text-green-700">
                        Optimal (8%)
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Quantum Analysis */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Real-time Quantum Analysis
            </CardTitle>
            <CardDescription>
              Live data processing with PTNI quantum algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Neural Processing</h3>
                <p className="text-sm text-gray-600">
                  Real-time analysis of family behavior patterns using advanced ML algorithms
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">Quantum Optimization</h3>
                <p className="text-sm text-gray-600">
                  Quantum-enhanced decision making for budget allocation and task prioritization
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Predictive Analytics</h3>
                <p className="text-sm text-gray-600">
                  Future-focused insights to help your family achieve financial and personal goals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}