import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, TrendingDown, RefreshCw, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingStatus {
  active: boolean;
  balance: number;
  initialized: boolean;
}

interface AccountSnapshot {
  totalBalance: number;
  availableBalance: number;
  positions: Array<{
    symbol: string;
    amount: number;
    value: number;
    avgCost: number;
  }>;
  lastUpdated: string;
}

interface TradeResult {
  orderId: string;
  symbol: string;
  side: string;
  amount: number;
  executedPrice: number;
  status: string;
  timestamp: string;
  fees: number;
  realBalance: number;
}

export function CoinbaseLiveTradingPanel() {
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);
  const [accountSnapshot, setAccountSnapshot] = useState<AccountSnapshot | null>(null);
  const [recentTrades, setRecentTrades] = useState<TradeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  
  // Trade form state
  const [tradeSymbol, setTradeSymbol] = useState('BTC');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');

  const { toast } = useToast();

  const cryptoSymbols = ['BTC', 'ETH', 'DOGE', 'SOL', 'ADA', 'MATIC', 'AVAX', 'LINK', 'UNI', 'LTC'];

  useEffect(() => {
    loadTradingStatus();
    loadAccountSnapshot();
  }, []);

  const loadTradingStatus = async () => {
    try {
      const response = await fetch('/api/coinbase/trading-status');
      const data = await response.json();
      
      if (data.success) {
        setTradingStatus(data);
      }
    } catch (error) {
      console.error('Failed to load trading status:', error);
    }
  };

  const loadAccountSnapshot = async () => {
    try {
      const response = await fetch('/api/coinbase/account-snapshot');
      const data = await response.json();
      
      if (data.success) {
        setAccountSnapshot(data);
      }
    } catch (error) {
      console.error('Failed to load account snapshot:', error);
    }
  };

  const activateTrading = async () => {
    setIsActivating(true);
    try {
      const response = await fetch('/api/coinbase/activate-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setTradingStatus(data);
        await loadAccountSnapshot();
        toast({
          title: "Trading Activated",
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Failed to activate trading');
      }
    } catch (error: any) {
      toast({
        title: "Activation Failed",
        description: error.message || 'Failed to activate live trading',
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const executeTrade = async () => {
    if (!tradeSymbol || !tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast({
        title: "Invalid Trade",
        description: "Please enter valid symbol and amount",
        variant: "destructive",
      });
      return;
    }

    if (tradeType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter valid limit price",
        variant: "destructive",
      });
      return;
    }

    setIsTrading(true);
    try {
      const tradePayload = {
        symbol: tradeSymbol,
        side: tradeSide,
        amount: tradeAmount,
        type: tradeType,
        ...(tradeType === 'limit' && { price: limitPrice })
      };

      const response = await fetch('/api/coinbase/execute-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradePayload),
      });

      const data = await response.json();

      if (data.success) {
        setRecentTrades(prev => [data.trade, ...prev.slice(0, 9)]);
        await loadAccountSnapshot();
        await loadTradingStatus();
        
        // Clear form
        setTradeAmount('');
        setLimitPrice('');
        
        toast({
          title: "Trade Executed",
          description: `${tradeSide.toUpperCase()} ${tradeAmount} ${tradeSymbol} at $${data.trade.executedPrice.toFixed(2)}`,
        });
      } else {
        throw new Error(data.error || 'Trade execution failed');
      }
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message || 'Failed to execute trade',
        variant: "destructive",
      });
    } finally {
      setIsTrading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTradingStatus(),
        loadAccountSnapshot()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/coinbase/refresh-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await loadTradingStatus();
        await loadAccountSnapshot();
        toast({
          title: "Balance Updated",
          description: data.message,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Refresh Failed",
        description: error.message || 'Failed to refresh balance',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trading Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Live Trading Status
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={tradingStatus?.active ? "default" : "secondary"}>
                {tradingStatus?.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Balance</div>
              <div className="text-xl font-bold">
                ${accountSnapshot?.totalBalance?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="text-lg font-semibold text-green-600">
                ${accountSnapshot?.availableBalance?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          {!tradingStatus?.active && (
            <Button
              onClick={activateTrading}
              disabled={isActivating}
              className="w-full"
            >
              {isActivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Trading...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate Live Trading
                </>
              )}
            </Button>
          )}

          <Button
            onClick={refreshBalance}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Real Balance
          </Button>
        </CardContent>
      </Card>

      {/* Trading Panel */}
      {tradingStatus?.active && (
        <Card>
          <CardHeader>
            <CardTitle>Execute Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbol</label>
                <Select value={tradeSymbol} onValueChange={setTradeSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoSymbols.map(symbol => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Side</label>
                <Select value={tradeSide} onValueChange={(value: 'buy' | 'sell') => setTradeSide(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ({tradeSide === 'buy' ? 'USD' : tradeSymbol})</label>
              <Input
                type="number"
                placeholder="0.00"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Type</label>
                <Select value={tradeType} onValueChange={(value: 'market' | 'limit') => setTradeType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tradeType === 'limit' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Limit Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={executeTrade}
              disabled={isTrading || !tradeAmount}
              className="w-full"
              variant={tradeSide === 'buy' ? 'default' : 'destructive'}
            >
              {isTrading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : tradeSide === 'buy' ? (
                <TrendingUp className="mr-2 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-2 h-4 w-4" />
              )}
              {tradeSide === 'buy' ? 'Buy' : 'Sell'} {tradeSymbol}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Positions */}
      {accountSnapshot?.positions && accountSnapshot.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accountSnapshot.positions.map((position, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{position.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.amount.toFixed(6)} @ ${position.avgCost.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${position.value.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTrades.map((trade, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {trade.side.toUpperCase()} {trade.amount} {trade.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${trade.executedPrice.toFixed(2)}</div>
                    <Badge variant={trade.status === 'completed' ? 'default' : 'secondary'}>
                      {trade.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}