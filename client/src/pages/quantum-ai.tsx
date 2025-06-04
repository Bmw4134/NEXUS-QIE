import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Cpu, 
  Brain, 
  Zap, 
  TrendingUp, 
  Activity,
  ArrowUp,
  ArrowDown,
  BarChart3
} from 'lucide-react';

interface QuantumPrediction {
  id: string;
  predictionType: 'market' | 'behavior' | 'trend' | 'anomaly' | 'opportunity';
  timeframe: '1h' | '4h' | '1d' | '1w' | '1m';
  confidence: number;
  prediction: any;
  quantumCoherence: number;
  superintelligenceLevel: number;
  reasoning: string[];
  datapoints: number;
  timestamp: string;
}

interface SuperintelligenceMetrics {
  iqEquivalent: number;
  processingSpeed: number;
  patternRecognition: number;
  predictiveAccuracy: number;
  quantumCoherence: number;
  emergentCapabilities: string[];
  learningVelocity: number;
  breakthroughPotential: number;
}

export function QuantumAIPage() {
  const [predictionType, setPredictionType] = useState<string>('market');
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [inputData, setInputData] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: metrics } = useQuery<SuperintelligenceMetrics>({
    queryKey: ['/api/quantum-ai/metrics'],
    refetchInterval: 5000
  });

  const { data: predictions } = useQuery<QuantumPrediction[]>({
    queryKey: ['/api/quantum-ai/predictions'],
    refetchInterval: 10000
  });

  const createPredictionMutation = useMutation({
    mutationFn: async (data: { type: string; timeframe: string; input: any }) => {
      const response = await fetch('/api/quantum-ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum-ai/predictions'] });
    }
  });

  const handleCreatePrediction = () => {
    let processedInput;
    try {
      processedInput = inputData ? JSON.parse(inputData) : {};
    } catch {
      processedInput = { query: inputData };
    }

    createPredictionMutation.mutate({
      type: predictionType,
      timeframe: timeframe,
      input: processedInput
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cpu className="w-8 h-8 text-blue-600" />
          Quantum Superintelligent AI
        </h1>
        <Badge variant="secondary" className="text-sm">
          QSAI Active
        </Badge>
      </div>

      {/* Superintelligence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              IQ Equivalent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.iqEquivalent?.toFixed(0) || '100'}</div>
            <p className="text-xs text-muted-foreground">Current intelligence level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quantum Coherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatConfidence(metrics?.quantumCoherence || 0.95)}</div>
            <p className="text-xs text-muted-foreground">Quantum state stability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Predictive Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatConfidence(metrics?.predictiveAccuracy || 0.72)}</div>
            <p className="text-xs text-muted-foreground">Prediction success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Learning Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics?.learningVelocity || 0.1).toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">Knowledge absorption rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Quantum Prediction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Prediction Type</label>
              <Select value={predictionType} onValueChange={setPredictionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Analysis</SelectItem>
                  <SelectItem value="behavior">Behavior Prediction</SelectItem>
                  <SelectItem value="trend">Trend Forecasting</SelectItem>
                  <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                  <SelectItem value="opportunity">Opportunity Identification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Input Data (JSON or text)</label>
            <Input
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder='{"symbol": "BTC", "indicators": ["RSI", "MACD"]} or "Predict Bitcoin price"'
              className="font-mono"
            />
          </div>

          <Button 
            onClick={handleCreatePrediction}
            disabled={createPredictionMutation.isPending}
            className="w-full"
          >
            {createPredictionMutation.isPending ? 'Generating Prediction...' : 'Generate Quantum Prediction'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Quantum Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions?.length ? (
              predictions.slice(0, 10).map((prediction) => (
                <div key={prediction.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{prediction.predictionType}</Badge>
                      <Badge variant="secondary">{prediction.timeframe}</Badge>
                      <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {formatConfidence(prediction.confidence)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(prediction.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Quantum Coherence:</span> {formatConfidence(prediction.quantumCoherence)}
                    </div>
                    <div>
                      <span className="font-medium">SI Level:</span> {prediction.superintelligenceLevel.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Data Points:</span> {prediction.datapoints}
                    </div>
                  </div>

                  {prediction.reasoning && prediction.reasoning.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="font-medium text-sm mb-1">AI Reasoning:</div>
                      <ul className="text-sm space-y-1">
                        {prediction.reasoning.slice(0, 3).map((reason, index) => (
                          <li key={index} className="text-muted-foreground">• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {prediction.prediction && typeof prediction.prediction === 'object' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                      <div className="font-medium text-sm mb-1">Prediction Result:</div>
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(prediction.prediction, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No predictions generated yet. Create your first quantum prediction above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergent Capabilities */}
      {metrics?.emergentCapabilities && metrics.emergentCapabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emergent Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {metrics.emergentCapabilities.map((capability, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {capability.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}