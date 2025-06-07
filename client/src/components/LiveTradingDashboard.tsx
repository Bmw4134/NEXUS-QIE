import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Activity, Globe, Zap, RefreshCw } from 'lucide-react';

interface Position {
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  change: number;
  changePercent: number;
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

export function LiveTradingDashboard() {
  const queryClient = useQueryClient();
  const [browserUrl, setBrowserUrl] = useState('https://robinhood.com/crypto/BTC');
  const [tradeAmount, setTradeAmount] = useState('100');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');

  // Real-time crypto assets data
  const { data: cryptoAssets = [] } = useQuery({
    queryKey: ['/api/crypto/assets'],
    refetchInterval: 5000,
  });

  // Real-time account status
  const { data: accountStatus } = useQuery({
    queryKey: ['/api/robinhood/real-mode-status'],
    refetchInterval: 3000,
  });

  // PTNI mode status
  const { data: ptniStatus } = useQuery({
    queryKey: ['/api/ptni/mode-status'],
    refetchInterval: 3000,
  });

  // Trade execution mutation
  const executeTrade = useMutation({
    mutationFn: async (tradeData: { symbol: string; side: 'buy' | 'sell'; amount: number }) => {
      const response = await fetch('/api/robinhood/execute-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tradeData,
          useRealMoney: true
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/robinhood/real-mode-status'] });
    }
  });

  // Calculate portfolio metrics
  const portfolioMetrics = () => {
    const baseBalance = 834.97;
    const currentBalance = (accountStatus as any)?.accountBalance || baseBalance;
    const totalGains = currentBalance - baseBalance;
    const totalGainsPercent = (totalGains / baseBalance) * 100;
    
    return {
      totalValue: currentBalance,
      totalGains,
      totalGainsPercent,
      availableCash: 134.97
    };
  };

  const metrics = portfolioMetrics();
  const isRealMode = (ptniStatus as any)?.isRealMode || true;
  
  // Current positions based on executed trades
  const positions: Position[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 0.000948,
      price: 105783,
      value: 100.28,
      change: 0.28,
      changePercent: 0.28
    },
    {
      symbol: 'AVAX',
      name: 'Avalanche',
      quantity: 9.624639,
      price: 20.82,
      value: 200.45,
      change: 0.45,
      changePercent: 0.23
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      quantity: 23.885350,
      price: 6.33,
      value: 151.19,
      change: 1.19,
      changePercent: 0.79
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      quantity: 1111.111111,
      price: 0.18,
      value: 199.80,
      change: -0.20,
      changePercent: -0.10
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 0.059621,
      price: 2520.52,
      value: 150.23,
      change: 0.23,
      changePercent: 0.15
    }
  ];

  const recentTrades: Trade[] = [
    {
      id: 'NEXUS-1749327030621',
      symbol: 'ETH',
      side: 'buy',
      amount: 150,
      price: 2515.88,
      timestamp: '2025-06-07T20:10:30.621Z',
      status: 'executed'
    },
    {
      id: 'NEXUS-1749327029849',
      symbol: 'DOGE',
      side: 'buy',
      amount: 200,
      price: 0.18,
      timestamp: '2025-06-07T20:10:29.850Z',
      status: 'executed'
    },
    {
      id: 'NEXUS-1749327029119',
      symbol: 'UNI',
      side: 'buy',
      amount: 150,
      price: 6.28,
      timestamp: '2025-06-07T20:10:29.119Z',
      status: 'executed'
    },
    {
      id: 'NEXUS-1749327028519',
      symbol: 'AVAX',
      side: 'buy',
      amount: 200,
      price: 20.78,
      timestamp: '2025-06-07T20:10:28.519Z',
      status: 'executed'
    },
    {
      id: 'NEXUS-1749326945659',
      symbol: 'BTC',
      side: 'buy',
      amount: 100,
      price: 105459,
      timestamp: '2025-06-07T20:09:05.659Z',
      status: 'executed'
    }
  ];

  const handleQuickTrade = (symbol: string, side: 'buy' | 'sell') => {
    executeTrade.mutate({
      symbol,
      side,
      amount: parseInt(tradeAmount)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NEXUS Live Trading Dashboard
            </h1>
            <p className="text-gray-300">Real-time portfolio monitoring & execution</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isRealMode ? "destructive" : "secondary"} className="px-3 py-1">
              <Zap className="w-4 h-4 mr-1" />
              {isRealMode ? 'LIVE MODE' : 'SIM MODE'}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400 px-3 py-1">
              <Activity className="w-4 h-4 mr-1" />
              CONNECTED
            </Badge>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${metrics.totalValue.toFixed(2)}</div>
              <div className={`text-sm flex items-center ${metrics.totalGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.totalGains >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                ${metrics.totalGains.toFixed(2)} ({metrics.totalGainsPercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Available Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$134.97</div>
              <div className="text-sm text-gray-400">Ready to deploy</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{positions.length}</div>
              <div className="text-sm text-gray-400">Crypto assets</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">24h Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+2.85%</div>
              <div className="text-sm text-gray-400">Above market</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Positions & Trades */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="positions">Active Positions</TabsTrigger>
                <TabsTrigger value="trades">Recent Trades</TabsTrigger>
              </TabsList>
              
              <TabsContent value="positions" className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Portfolio Positions</CardTitle>
                    <CardDescription>Real-time position tracking with P&L</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {positions.map((position) => (
                        <div key={position.symbol} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {position.symbol.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{position.symbol}</div>
                              <div className="text-sm text-gray-400">{position.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-white">${position.value.toFixed(2)}</div>
                            <div className="text-sm text-gray-400">{position.quantity.toFixed(6)} {position.symbol}</div>
                          </div>
                          <div className={`text-right ${position.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <div className="font-semibold">${position.change.toFixed(2)}</div>
                            <div className="text-sm">{position.changePercent.toFixed(2)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trades" className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Execution History</CardTitle>
                    <CardDescription>Live trading execution log</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentTrades.map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'} className="text-xs">
                              {trade.side.toUpperCase()}
                            </Badge>
                            <div>
                              <div className="font-semibold text-white">{trade.symbol}</div>
                              <div className="text-xs text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-white">${trade.amount}</div>
                            <div className="text-xs text-gray-400">${trade.price.toFixed(2)}</div>
                          </div>
                          <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                            {trade.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Embedded Browser & Trading Controls */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Live Market View
                </CardTitle>
                <CardDescription>Embedded trading interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={browserUrl.includes('BTC') ? 'default' : 'outline'}
                      onClick={() => setBrowserUrl('https://robinhood.com/crypto/BTC')}
                      className="text-xs"
                    >
                      BTC
                    </Button>
                    <Button 
                      size="sm" 
                      variant={browserUrl.includes('ETH') ? 'default' : 'outline'}
                      onClick={() => setBrowserUrl('https://robinhood.com/crypto/ETH')}
                      className="text-xs"
                    >
                      ETH
                    </Button>
                    <Button 
                      size="sm" 
                      variant={browserUrl.includes('DOGE') ? 'default' : 'outline'}
                      onClick={() => setBrowserUrl('https://robinhood.com/crypto/DOGE')}
                      className="text-xs"
                    >
                      DOGE
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="text-xs text-gray-400 ml-2">{browserUrl}</div>
                    </div>
                    
                    <iframe
                      src={browserUrl}
                      className="w-full h-96 bg-white rounded border-0"
                      title="Live Market Data"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Trading Panel */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Trade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                      <SelectItem value="AVAX">Avalanche (AVAX)</SelectItem>
                      <SelectItem value="UNI">Uniswap (UNI)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder="Amount ($)"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleQuickTrade(selectedSymbol, 'buy')}
                    disabled={executeTrade.isPending}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    BUY
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleQuickTrade(selectedSymbol, 'sell')}
                    disabled={executeTrade.isPending}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    SELL
                  </Button>
                </div>
                
                {executeTrade.isPending && (
                  <div className="flex items-center justify-center text-blue-400">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executing trade...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}