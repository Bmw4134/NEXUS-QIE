import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Zap, Target, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
  status: string;
}

export default function LiveTradingPanel() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch crypto assets
  const { data: assets } = useQuery({
    queryKey: ['/api/crypto/assets'],
    refetchInterval: 5000,
  });

  // Fetch trading metrics
  const { data: tradingMetrics } = useQuery({
    queryKey: ['/api/robinhood/live-trading-metrics'],
    refetchInterval: 2000,
  });

  // Fetch recent trades
  const { data: tradeHistory } = useQuery({
    queryKey: ['/api/robinhood/live-trading-history'],
    refetchInterval: 5000,
  });

  // Execute trade mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: { symbol: string; side: 'buy' | 'sell'; amount: number; orderType: string }) => {
      return apiRequest('/api/trading/execute-trade', {
        method: 'POST',
        body: JSON.stringify(tradeData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Trade Executed Successfully",
        description: `${data.side.toUpperCase()} ${data.executedAmount} ${data.symbol} at $${data.executedPrice}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/robinhood/live-trading-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/robinhood/live-trading-history'] });
      setTradeAmount('');
    },
    onError: (error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTrade = (side: 'buy' | 'sell') => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      });
      return;
    }

    executeTradeMutation.mutate({
      symbol: selectedAsset,
      side,
      amount: parseFloat(tradeAmount),
      orderType,
    });
  };

  const selectedAssetData = assets?.find((asset: CryptoAsset) => asset.symbol === selectedAsset);
  const accountBalance = tradingMetrics?.metrics?.accountBalance || 756.95;
  const maxBuyAmount = selectedAssetData ? (accountBalance * 0.1) / selectedAssetData.price : 0;

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
          size="lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Live Trading</span>
          <span className="sm:hidden">Trade</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none">
      <Card className="bg-black/90 border-red-500 shadow-red-500/50 shadow-xl backdrop-blur-sm mx-4 sm:mx-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-400 text-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
              LIVE TRADING
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="animate-pulse">REAL MONEY</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs defaultValue="trade" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="trade" className="text-xs">Trade</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
              <TabsTrigger value="metrics" className="text-xs">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="trade" className="space-y-3 mt-3">
              {/* Asset Selection */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Asset</label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets?.map((asset: CryptoAsset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center justify-between w-full">
                          <span>{asset.symbol}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            ${asset.price.toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Price */}
              {selectedAssetData && (
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {selectedAssetData.name}
                    </span>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        ${selectedAssetData.price.toFixed(2)}
                      </div>
                      <div className={`text-xs flex items-center ${
                        selectedAssetData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedAssetData.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {selectedAssetData.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Amount */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Amount ($)</label>
                <Input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="Enter USD amount"
                  className="bg-gray-800 border-gray-600 text-white"
                  step="0.01"
                  min="0"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Max: ${maxBuyAmount.toFixed(2)} (10% of balance)
                </div>
              </div>

              {/* Order Type */}
              <div>
                <label className="text-xs text-gray-300 mb-1 block">Order Type</label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trade Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleTrade('buy')}
                  disabled={executeTradeMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {executeTradeMutation.isPending ? 'Executing...' : 'BUY'}
                </Button>
                <Button
                  onClick={() => handleTrade('sell')}
                  disabled={executeTradeMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {executeTradeMutation.isPending ? 'Executing...' : 'SELL'}
                </Button>
              </div>

              {/* Account Balance */}
              <div className="bg-gray-800/50 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-400">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="text-xs">Available Balance</span>
                  </div>
                  <span className="text-white font-bold">
                    ${accountBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-2 mt-3">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {tradeHistory?.trades?.slice(0, 10).map((trade: Trade) => (
                  <div key={trade.id} className="bg-gray-800/50 rounded p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-medium ${
                          trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.side.toUpperCase()} {trade.symbol}
                        </span>
                        <div className="text-xs text-gray-400">
                          ${trade.amount.toFixed(2)} @ ${trade.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {trade.status}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-400 py-4">
                    No trades yet
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <div className="text-blue-400 text-xs">Total Trades</div>
                  <div className="text-white font-bold">
                    {tradingMetrics?.metrics?.totalTrades || 0}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded p-2 text-center">
                  <div className="text-purple-400 text-xs">Success Rate</div>
                  <div className="text-white font-bold">
                    {((tradingMetrics?.metrics?.successRate || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-orange-400">
                    <Target className="w-4 h-4 mr-1" />
                    <span className="text-xs">Engine Status</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-3 h-3 mr-1 text-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded p-2">
                <div className="text-center">
                  <div className="text-purple-400 text-xs">NEXUS Quantum Mode</div>
                  <div className="text-purple-300 font-bold text-sm">ENABLED</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}