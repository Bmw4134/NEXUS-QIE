import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dna, Sparkles, Target, TrendingUp, Clock, Brain } from 'lucide-react';

interface PromptAnalysis {
  promptId: string;
  originalPrompt: string;
  context: string;
  dnaSequence: string;
  complexity: number;
  intent: string;
  confidence: number;
  recommendations: string[];
  timestamp: string;
}

export default function QIEPromptDNA() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('general');
  const [analysisHistory, setAnalysisHistory] = useState<PromptAnalysis[]>([]);

  const analyzePromptMutation = useMutation({
    mutationFn: async (data: { prompt: string; context: string }): Promise<PromptAnalysis> => {
      const response = await fetch('/api/prompt-dna/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: (analysis: PromptAnalysis) => {
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]); // Keep last 10 analyses
      setPrompt('');
    }
  });

  const handleAnalyze = () => {
    if (!prompt.trim()) return;
    
    analyzePromptMutation.mutate({
      prompt: prompt.trim(),
      context
    });
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'trading': return 'bg-green-100 text-green-800 border-green-200';
      case 'analysis': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prediction': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityLevel = (complexity: number) => {
    if (complexity >= 80) return { label: 'Very High', color: 'text-red-600' };
    if (complexity >= 60) return { label: 'High', color: 'text-orange-600' };
    if (complexity >= 40) return { label: 'Medium', color: 'text-yellow-600' };
    if (complexity >= 20) return { label: 'Low', color: 'text-green-600' };
    return { label: 'Very Low', color: 'text-blue-600' };
  };

  const samplePrompts = [
    {
      text: "Analyze Bitcoin price trends for the next 24 hours",
      context: "trading"
    },
    {
      text: "Predict market sentiment based on current portfolio performance",
      context: "analysis"
    },
    {
      text: "Execute a buy order for 0.1 BTC when price drops below $100,000",
      context: "trading"
    },
    {
      text: "Generate a comprehensive risk assessment for my current holdings",
      context: "analysis"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QIE PromptDNA</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced prompt analysis and optimization engine
          </p>
        </div>
        <Badge variant="outline">
          <Dna className="h-4 w-4 mr-1" />
          DNA Sequencing Active
        </Badge>
      </div>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Prompt Analysis
          </CardTitle>
          <CardDescription>
            Enter your prompt to analyze its DNA sequence and optimization potential
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="text-sm font-medium mb-2 block">Your Prompt</label>
              <Textarea
                placeholder="Enter your prompt here for DNA analysis..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Context</label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 mb-4"
              >
                <option value="general">General</option>
                <option value="trading">Trading</option>
                <option value="analysis">Analysis</option>
                <option value="prediction">Prediction</option>
                <option value="research">Research</option>
              </select>
              
              <Button
                onClick={handleAnalyze}
                disabled={!prompt.trim() || analyzePromptMutation.isPending}
                className="w-full"
              >
                {analyzePromptMutation.isPending ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Dna className="h-4 w-4 mr-2" />
                    Analyze DNA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sample Prompts */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sample Prompts</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {samplePrompts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPrompt(sample.text);
                    setContext(sample.context);
                  }}
                  className="text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-sm">{sample.text}</div>
                    <div className="text-xs text-gray-500 mt-1">Context: {sample.context}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>
              Recent prompt DNA analyses and optimization insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysisHistory.map((analysis) => {
                const complexityLevel = getComplexityLevel(analysis.complexity);
                
                return (
                  <div key={analysis.promptId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">
                            ID: {analysis.promptId.slice(-8)}
                          </Badge>
                          <Badge className={getIntentColor(analysis.intent)}>
                            {analysis.intent}
                          </Badge>
                          <Badge variant="secondary">
                            {analysis.context}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          "{analysis.originalPrompt}"
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(analysis.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="h-4 w-4 mr-1" />
                        </div>
                        <div className="text-lg font-bold">
                          {Math.round(analysis.confidence * 100)}%
                        </div>
                        <div className="text-xs text-gray-600">Confidence</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                        </div>
                        <div className={`text-lg font-bold ${complexityLevel.color}`}>
                          {analysis.complexity}
                        </div>
                        <div className="text-xs text-gray-600">Complexity</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <Dna className="h-4 w-4 mr-1" />
                        </div>
                        <div className="text-lg font-bold">
                          {analysis.dnaSequence.split('-').length}
                        </div>
                        <div className="text-xs text-gray-600">DNA Length</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center justify-center mb-1">
                          <Sparkles className="h-4 w-4 mr-1" />
                        </div>
                        <div className="text-lg font-bold">
                          {analysis.recommendations.length}
                        </div>
                        <div className="text-xs text-gray-600">Insights</div>
                      </div>
                    </div>

                    {/* DNA Sequence */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">DNA Sequence</label>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 font-mono text-xs break-all">
                        {analysis.dnaSequence.slice(0, 200)}
                        {analysis.dnaSequence.length > 200 && '...'}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Optimization Recommendations</label>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Intent Classification:</span>
                          <span className="ml-2 capitalize">{analysis.intent}</span>
                        </div>
                        <div>
                          <span className="font-medium">Complexity Level:</span>
                          <span className={`ml-2 ${complexityLevel.color}`}>{complexityLevel.label}</span>
                        </div>
                        <div>
                          <span className="font-medium">Optimization Score:</span>
                          <span className="ml-2">{Math.round(analysis.confidence * analysis.complexity / 100 * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Message */}
      {analysisHistory.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Dna className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ready for Prompt DNA Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter a prompt above to begin analyzing its DNA sequence and optimization potential.
              The system will provide insights on complexity, intent classification, and improvement recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="font-medium">Intent Detection</div>
                <div>Automatically classify prompt purpose</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="font-medium">Complexity Analysis</div>
                <div>Measure prompt sophistication level</div>
              </div>
              <div className="text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="font-medium">Optimization Tips</div>
                <div>Get actionable improvement suggestions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}