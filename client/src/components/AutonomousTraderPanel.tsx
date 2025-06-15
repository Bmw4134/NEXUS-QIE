import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Loader2, Bot, Play, Square, Settings, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingConfig {
  enabled: boolean;
  maxTradeAmount: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  minConfidence: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  tradingPairs: string[];
  maxDailyTrades: number;
}

interface AutonomousStatus {
  active: boolean;
  config: TradingConfig;
  dailyTrades: number;
  totalTrades: number;
  recentTrades: any[];
  performance: {
    totalTrades: number;
    successRate: number;
    estimatedProfit: number;
    averageTradeSize: number;
  };
}

export function AutonomousTraderPanel() {
  const [status, setStatus] = useState<AutonomousStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [config, setConfig] = useState<TradingConfig>({
    enabled: false,
    maxTradeAmount: 100,
    riskLevel: 'conservative',
    minConfidence: 0.75,
    stopLossPercentage: 5,
    takeProfitPercentage: 10,
    tradingPairs: ['BTC', 'ETH', 'SOL', 'DOGE'],
    maxDailyTrades: 10
  });

  const { toast } = useToast();

  const cryptoOptions = ['BTC', 'ETH', 'DOGE', 'SOL', 'ADA', 'MATIC', 'AVAX', 'LINK', 'UNI', 'LTC'];

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/autonomous/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load autonomous status:', error);
    }
  };

  const startAutonomousTrading = async () => {
    setIsStarting(true);
    try {
      const response = await fetch('/api/autonomous/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
        toast({
          title: "Autonomous Trading Started",
          description: "AI trading bot is now analyzing markets and executing trades with your real funds",
        });
      } else {
        throw new Error(data.error || 'Failed to start autonomous trading');
      }
    } catch (error: any) {
      toast({
        title: "Failed to Start",
        description: error.message || 'Could not start autonomous trading',
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  const stopAutonomousTrading = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/autonomous/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
        toast({
          title: "Autonomous Trading Stopped",
          description: "AI trading bot has been deactivated",
        });
      } else {
        throw new Error(data.error || 'Failed to stop autonomous trading');
      }
    } catch (error: any) {
      toast({
        title: "Failed to Stop",
        description: error.message || 'Could not stop autonomous trading',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async () => {
    try {
      const response = await fetch('/api/autonomous/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Configuration Updated",
          description: "Trading parameters have been updated",
        });
      } else {
        throw new Error(data.error || 'Failed to update configuration');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || 'Could not update configuration',
        variant: "destructive",
      });
    }
  };

  const toggleTradingPair = (pair: string) => {
    setConfig(prev => ({
      ...prev,
      tradingPairs: prev.tradingPairs.includes(pair)
        ? prev.tradingPairs.filter(p => p !== pair)
        : [...prev.tradingPairs, pair]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Autonomous Quantum Trader
            </div>
            <Badge variant={status?.active ? "default" : "secondary"} className="text-sm">
              {status?.active ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Today's Trades</div>
              <div className="text-2xl font-bold">{status?.dailyTrades || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Trades</div>
              <div className="text-2xl font-bold">{status?.totalTrades || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-2xl font-bold">
                {status?.performance?.successRate ? (status.performance.successRate * 100).toFixed(1) : '0'}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Est. Profit</div>
              <div className="text-2xl font-bold text-green-600">
                ${status?.performance?.estimatedProfit?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!status?.active ? (
              <Button
                onClick={startAutonomousTrading}
                disabled={isStarting}
                className="flex-1"
                size="lg"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting AI Trader...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    START AUTONOMOUS TRADING
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopAutonomousTrading}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Square className="mr-2 h-4 w-4" />
                )}
                STOP TRADING
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Trading Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Trade Amount (USD)</label>
              <Input
                type="number"
                value={config.maxTradeAmount}
                onChange={(e) => setConfig(prev => ({ ...prev, maxTradeAmount: parseFloat(e.target.value) || 0 }))}
                min="1"
                max="1000"
              />
              <div className="text-xs text-muted-foreground">Maximum amount per individual trade</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select value={config.riskLevel} onValueChange={(value: any) => setConfig(prev => ({ ...prev, riskLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum Confidence: {(config.minConfidence * 100).toFixed(0)}%
              </label>
              <Slider
                value={[config.minConfidence]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, minConfidence: value[0] }))}
                min={0.5}
                max={0.95}
                step={0.05}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">Minimum AI confidence to execute trades</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Daily Trades</label>
              <Input
                type="number"
                value={config.maxDailyTrades}
                onChange={(e) => setConfig(prev => ({ ...prev, maxDailyTrades: parseInt(e.target.value) || 0 }))}
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Trading Pairs</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {cryptoOptions.map(crypto => (
                <Button
                  key={crypto}
                  variant={config.tradingPairs.includes(crypto) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTradingPair(crypto)}
                  className="text-xs"
                >
                  {crypto}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Stop Loss: {config.stopLossPercentage}%
              </label>
              <Slider
                value={[config.stopLossPercentage]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, stopLossPercentage: value[0] }))}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Take Profit: {config.takeProfitPercentage}%
              </label>
              <Slider
                value={[config.takeProfitPercentage]}
                onValueChange={(value) => setConfig(prev => ({ ...prev, takeProfitPercentage: value[0] }))}
                min={5}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Button onClick={updateConfig} className="w-full">
            Update Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      {status?.recentTrades && status.recentTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent AI Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.recentTrades.map((trade, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {trade.signal?.action?.toUpperCase()} {trade.signal?.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trade.signal?.reasoning}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${trade.signal?.suggestedAmount?.toFixed(2)}
                    </div>
                    <Badge variant={trade.status === 'executed' ? 'default' : trade.status === 'failed' ? 'destructive' : 'secondary'}>
                      {trade.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {(trade.signal?.confidence * 100).toFixed(1)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Live Trading with Real Funds
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                This system executes real trades with your Coinbase account balance. 
                Monitor performance and adjust risk settings as needed. Start with small amounts to test strategy effectiveness.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}