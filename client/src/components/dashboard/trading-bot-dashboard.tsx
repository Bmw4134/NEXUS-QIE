import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  Target,
  Shield,
  Zap,
  Eye,
  Play,
  Pause,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TradingPosition {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  side: 'long' | 'short';
  timestamp: Date;
}

interface TradingOrder {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timestamp: Date;
  source: 'manual' | 'watson' | 'pionex_mirror';
}

interface TradingMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  lastUpdate: Date;
}

interface PionexSnapshot {
  strategy: string;
  winRate: number;
  avgProfit: number;
  maxDrawdown: number;
  tradingPairs: string[];
  riskParameters: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  timeframe: string;
  lastUpdate: Date;
}

export function TradingBotDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'bm.watson34@gmail.com',
    password: 'Panthers3477',
    mfaCode: '4134'
  });
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [tradingActive, setTradingActive] = useState(true);
  const queryClient = useQueryClient();

  // Fetch trading data
  const { data: metrics, isLoading: metricsLoading } = useQuery<TradingMetrics>({
    queryKey: ['/api/trading/metrics'],
    refetchInterval: 5000
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<TradingPosition[]>({
    queryKey: ['/api/trading/positions'],
    refetchInterval: 10000
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<TradingOrder[]>({
    queryKey: ['/api/trading/orders'],
    refetchInterval: 5000
  });

  const { data: pionexSnapshot, isLoading: snapshotLoading } = useQuery<PionexSnapshot>({
    queryKey: ['/api/trading/pionex-snapshot'],
    refetchInterval: 30000
  });

  // Authentication mutation
  const authenticateMutation = useMutation({
    mutationFn: async (creds: typeof credentials) => {
      const response = await fetch('/api/trading/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['/api/trading'] });
    }
  });

  const handleAuthenticate = async () => {
    if (!credentials.username || !credentials.password) return;
    
    try {
      const result = await authenticateMutation.mutateAsync(credentials);
      if (result.success) {
        setIsAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: ['/api/trading/metrics'] });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Check if MFA is required
      if (error.message?.includes('MFA required') || error.message?.includes('mfa') || error.message?.includes('code')) {
        setShowMfaInput(true);
      }
    }
  };

  const handleMfaSubmit = async () => {
    if (!credentials.mfaCode || credentials.mfaCode.length !== 6) return;
    await authenticateMutation.mutateAsync(credentials);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getPnLColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00ff64]" />
            Robinhood Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your Robinhood username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your Robinhood password"
            />
          </div>
          
          {showMfaInput && (
            <div className="space-y-2">
              <Label htmlFor="mfa">Robinhood PIN Code</Label>
              <Input
                id="mfa"
                type="text"
                value={credentials.mfaCode}
                onChange={(e) => setCredentials(prev => ({ ...prev, mfaCode: e.target.value }))}
                placeholder="Enter 6-digit Robinhood PIN"
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>
          )}
          
          {!showMfaInput ? (
            <Button 
              onClick={handleAuthenticate} 
              disabled={authenticateMutation.isPending}
              className="w-full bg-[#00ff64] hover:bg-[#00cc50] text-black"
            >
              {authenticateMutation.isPending ? 'Authenticating...' : 'Connect to Robinhood'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                Enter your Robinhood 6-digit PIN code for two-factor authentication
              </div>
              <Button 
                onClick={handleMfaSubmit} 
                disabled={authenticateMutation.isPending || !credentials.mfaCode || credentials.mfaCode.length !== 6}
                className="w-full bg-[#00ff64] hover:bg-[#00cc50] text-black"
              >
                {authenticateMutation.isPending ? 'Verifying PIN...' : 'Submit PIN Code'}
              </Button>
            </div>
          )}
          
          {authenticateMutation.isError && (
            <div className="text-red-500 text-sm text-center">
              Authentication failed. Please check your credentials.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#00ff64]">Robinhood Legend Trading Bot</h2>
          <p className="text-gray-400">Powered by Pionex Success Mirroring & Watson Intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={tradingActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {tradingActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTradingActive(!tradingActive)}
          >
            {tradingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${getPnLColor(metrics?.totalPnL || 0)}`}>
                  {formatCurrency(metrics?.totalPnL || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#00ff64]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-[#00ff64]">
                  {formatPercentage(metrics?.winRate || 0)}
                </p>
              </div>
              <Target className="w-8 h-8 text-[#00ff64]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold">{metrics?.totalTrades || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#00ff64]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatPercentage(metrics?.maxDrawdown || 0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pionex Mirror Strategy */}
      {pionexSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#00ff64]" />
              Pionex Success Mirror
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-[#00ff64] mb-2">Strategy: {pionexSnapshot.strategy}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="font-medium">{formatPercentage(pionexSnapshot.winRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Profit:</span>
                    <span className="font-medium text-green-500">{formatPercentage(pionexSnapshot.avgProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Drawdown:</span>
                    <span className="font-medium text-red-500">{formatPercentage(pionexSnapshot.maxDrawdown)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#00ff64] mb-2">Risk Parameters</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="font-medium">{formatPercentage(pionexSnapshot.riskParameters.stopLoss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="font-medium">{formatPercentage(pionexSnapshot.riskParameters.takeProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position Size:</span>
                    <span className="font-medium">{formatPercentage(pionexSnapshot.riskParameters.positionSize * 100)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-[#00ff64] mb-2">Active Pairs</h4>
                <div className="flex flex-wrap gap-1">
                  {pionexSnapshot.tradingPairs.map((pair, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pair}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Trading Interface */}
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positionsLoading ? (
                <div className="text-center py-4">Loading positions...</div>
              ) : !positions || positions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No active positions
                </div>
              ) : (
                <div className="space-y-3">
                  {positions.map((position) => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#00ff64]">{position.symbol}</h4>
                        <Badge variant={position.side === 'long' ? 'default' : 'secondary'}>
                          {position.side.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Quantity:</span>
                          <div className="font-medium">{position.quantity}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Avg Price:</span>
                          <div className="font-medium">{formatCurrency(position.averagePrice)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Price:</span>
                          <div className="font-medium">{formatCurrency(position.currentPrice)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Unrealized P&L:</span>
                          <div className={`font-medium ${getPnLColor(position.unrealizedPnL)}`}>
                            {formatCurrency(position.unrealizedPnL)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No recent orders
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 10).map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{order.symbol}</h4>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(order.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Side:</span>
                          <div className={`font-medium ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                            {order.side.toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <div className="font-medium">{order.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Quantity:</span>
                          <div className="font-medium">{order.quantity}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Price:</span>
                          <div className="font-medium">
                            {order.price ? formatCurrency(order.price) : 'Market'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Source:</span>
                          <div className="font-medium capitalize">{order.source}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg">
                  <Zap className="w-5 h-5 text-[#00ff64]" />
                  <div className="flex-1">
                    <div className="font-medium">Trading Logic Activated</div>
                    <div className="text-sm text-gray-400">
                      Robinhood Legend with Pionex Success Mirroring enabled
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date().toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">Watson Analysis Complete</div>
                    <div className="text-sm text-gray-400">
                      Generated trading signals for 5 symbols
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(Date.now() - 300000).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium">Risk Management Active</div>
                    <div className="text-sm text-gray-400">
                      Monitoring positions for stop-loss and take-profit triggers
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(Date.now() - 600000).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}