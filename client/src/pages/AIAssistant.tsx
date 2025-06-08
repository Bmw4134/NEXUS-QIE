import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageSquare, Target, TrendingUp, Lightbulb, Send, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIInsight {
  title: string;
  description: string;
  category: 'financial' | 'productivity' | 'health' | 'social';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
}

interface FamilyGoal {
  title: string;
  description: string;
  category: 'health' | 'financial' | 'educational' | 'social' | 'personal';
  timeframe: 'short-term' | 'medium-term' | 'long-term';
  difficulty: 'easy' | 'moderate' | 'challenging';
  benefits: string[];
  action_steps: string[];
}

export function AIAssistant() {
  const [userQuery, setUserQuery] = useState('');
  const [activeTab, setActiveTab] = useState('insights');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecommendation, setCurrentRecommendation] = useState('');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch family data for AI analysis
  const { data: tasks = [] } = useQuery({ queryKey: ['/api/family/tasks'] });
  const { data: events = [] } = useQuery({ queryKey: ['/api/family/events'] });
  const { data: expenses = [] } = useQuery({ queryKey: ['/api/family/expenses'] });
  const { data: budgets = [] } = useQuery({ queryKey: ['/api/family/budgets'] });
  const { data: notes = [] } = useQuery({ queryKey: ['/api/family/notes'] });

  // Generate AI insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const familyData = { tasks, events, expenses, budgets, notes };
      const response = await fetch('/api/ai/family-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyData })
      });
      if (!response.ok) throw new Error('Failed to generate insights');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-insights'], data.insights);
      toast({ title: "AI Insights Generated", description: "Fresh insights are now available" });
    }
  });

  // Generate smart recommendations
  const generateRecommendationMutation = useMutation({
    mutationFn: async (query: string) => {
      const context = `Family has ${tasks.length} tasks, ${events.length} events, ${expenses.length} expenses`;
      const response = await fetch('/api/ai/smart-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, query })
      });
      if (!response.ok) throw new Error('Failed to generate recommendation');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentRecommendation(data.recommendation);
      setIsGenerating(false);
    }
  });

  // Generate family goals
  const generateGoalsMutation = useMutation({
    mutationFn: async () => {
      const familyData = { tasks, events, expenses, budgets, notes };
      const response = await fetch('/api/ai/family-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyData })
      });
      if (!response.ok) throw new Error('Failed to generate goals');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-goals'], data.goals);
      toast({ title: "Family Goals Generated", description: "Personalized goals created for your family" });
    }
  });

  // Analyze expenses
  const analyzeExpensesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/expense-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses })
      });
      if (!response.ok) throw new Error('Failed to analyze expenses');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['expense-analysis'], data);
      toast({ title: "Expense Analysis Complete", description: "AI has analyzed your spending patterns" });
    }
  });

  const { data: aiInsights = [] } = useQuery<AIInsight[]>({
    queryKey: ['ai-insights'],
    enabled: false
  });

  const { data: familyGoals = [] } = useQuery<FamilyGoal[]>({
    queryKey: ['ai-goals'],
    enabled: false
  });

  const { data: expenseAnalysis } = useQuery({
    queryKey: ['expense-analysis'],
    enabled: false
  });

  const handleAskAI = () => {
    if (!userQuery.trim()) return;
    
    setIsGenerating(true);
    generateRecommendationMutation.mutate(userQuery);
    setUserQuery('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'productivity': return 'bg-blue-100 text-blue-800';
      case 'health': return 'bg-red-100 text-red-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Brain className="w-8 h-8 mr-3 text-purple-600" />
              AI Assistant
            </h1>
            <p className="text-gray-600">Intelligent insights and recommendations for your family</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* AI Chat Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Ask AI Assistant
            </CardTitle>
            <CardDescription>
              Get personalized recommendations for family management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Textarea
                  placeholder="Ask me anything about family management, budgeting, task prioritization, or goal setting..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleAskAI} 
                disabled={isGenerating || !userQuery.trim()}
                className="self-end"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Ask AI
              </Button>
            </div>
            
            {currentRecommendation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">AI Recommendation:</h3>
                <p className="text-blue-800 whitespace-pre-wrap">{currentRecommendation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Smart Insights</TabsTrigger>
            <TabsTrigger value="goals">Family Goals</TabsTrigger>
            <TabsTrigger value="analysis">Expense Analysis</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI-Generated Family Insights</h2>
              <Button 
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
              >
                {generateInsightsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate New Insights
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Badge className={getCategoryColor(insight.category)}>
                          {insight.category}
                        </Badge>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    {insight.recommendation && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-2 text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No insights generated yet</p>
                  <Button onClick={() => generateInsightsMutation.mutate()}>
                    Generate AI Insights
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Personalized Family Goals</h2>
              <Button 
                onClick={() => generateGoalsMutation.mutate()}
                disabled={generateGoalsMutation.isPending}
              >
                {generateGoalsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Generate Goals
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyGoals.length > 0 ? familyGoals.map((goal, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                      <Badge className={getDifficultyColor(goal.difficulty)}>
                        {goal.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{goal.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {goal.benefits.map((benefit, i) => (
                          <li key={i}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Action Steps:</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {goal.action_steps.map((step, i) => (
                          <li key={i}>{i + 1}. {step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No family goals generated yet</p>
                  <Button onClick={() => generateGoalsMutation.mutate()}>
                    Generate Family Goals
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI Expense Analysis</h2>
              <Button 
                onClick={() => analyzeExpensesMutation.mutate()}
                disabled={analyzeExpensesMutation.isPending}
              >
                {analyzeExpensesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Analyze Expenses
              </Button>
            </div>

            {expenseAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expenseAnalysis.patterns?.map((pattern: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">• {pattern}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Savings Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expenseAnalysis.savings_opportunities?.map((opportunity: string, index: number) => (
                        <li key={index} className="text-sm text-green-700">• {opportunity}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expenseAnalysis.budget_recommendations?.map((recommendation: string, index: number) => (
                        <li key={index} className="text-sm text-blue-700">• {recommendation}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No expense analysis available</p>
                <Button onClick={() => analyzeExpensesMutation.mutate()}>
                  Start Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <h2 className="text-xl font-semibold">Family Optimization Center</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Smart Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    AI analyzes your family's patterns to suggest optimal scheduling for tasks and events.
                  </p>
                  <Button variant="outline" className="w-full">
                    Optimize Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Budget Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Get AI-powered recommendations for better budget allocation and expense management.
                  </p>
                  <Button variant="outline" className="w-full">
                    Optimize Budget
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Habit Formation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    AI suggests personalized strategies for building positive family habits and routines.
                  </p>
                  <Button variant="outline" className="w-full">
                    Build Habits
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}