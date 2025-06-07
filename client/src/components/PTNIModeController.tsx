import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Shield, DollarSign, Activity, CheckCircle } from 'lucide-react';

interface PTNIModeStatus {
  isRealMode: boolean;
  isAuthenticated: boolean;
  accountBalance: number;
  lastTradeTime?: string;
  tradingMetrics: {
    totalTrades: number;
    successRate: number;
    totalPnL: number;
  };
  ptniStatus: {
    analyticsActive: boolean;
    diagnosticsRunning: boolean;
    realTimeKPIs: boolean;
  };
}

export function PTNIModeController() {
  const [modeStatus, setModeStatus] = useState<PTNIModeStatus | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModeStatus = async () => {
    try {
      const response = await fetch('/api/ptni/mode-status');
      const data = await response.json();
      setModeStatus(data);
    } catch (error) {
      console.error('Failed to fetch PTNI mode status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = async () => {
    if (!modeStatus) return;
    
    setIsToggling(true);
    try {
      const response = await fetch('/api/ptni/toggle-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enableRealMode: !modeStatus.isRealMode,
          enablePTNI: true 
        })
      });

      const result = await response.json();
      if (result.success) {
        setTimeout(() => fetchModeStatus(), 1000);
      }
    } catch (error) {
      console.error('Failed to toggle mode:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const executeTestTrade = async () => {
    try {
      const endpoint = modeStatus?.isRealMode 
        ? '/api/robinhood/execute-live-trade'
        : '/api/trading/execute';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'AAPL',
          side: 'buy',
          amount: 25,
          useRealMoney: modeStatus?.isRealMode
        })
      });

      const result = await response.json();
      if (result.success) {
        setTimeout(() => fetchModeStatus(), 2000);
      }
    } catch (error) {
      console.error('Test trade failed:', error);
    }
  };

  useEffect(() => {
    fetchModeStatus();
    const interval = setInterval(fetchModeStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 border-slate-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Activity className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-white">Loading PTNI Mode Controller...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!modeStatus) {
    return (
      <Card className="bg-gradient-to-br from-red-900 via-red-800 to-red-700 border-red-600">
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="ml-2 text-white">PTNI Mode Controller Unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Mode Controller */}
      <Card className={`border-2 transition-all duration-300 ${
        modeStatus.isRealMode 
          ? 'bg-gradient-to-br from-red-900 via-red-800 to-red-700 border-red-500' 
          : 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 border-blue-500'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {modeStatus.isRealMode ? (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              ) : (
                <Shield className="w-6 h-6 text-blue-400" />
              )}
              <span>PTNI Trading Mode Controller</span>
            </div>
            <Badge 
              variant={modeStatus.isRealMode ? "destructive" : "secondary"}
              className="text-sm font-bold"
            >
              {modeStatus.isRealMode ? 'REAL MONEY' : 'SIMULATION'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">
                {modeStatus.isRealMode ? 'Real Money Trading' : 'Simulation Mode'}
              </h3>
              <p className="text-sm text-gray-300">
                {modeStatus.isRealMode 
                  ? 'All trades execute with actual money and update real account balances'
                  : 'Safe testing environment using simulated funds and realistic market data'
                }
              </p>
            </div>
            <Switch
              checked={modeStatus.isRealMode}
              onCheckedChange={toggleMode}
              disabled={isToggling}
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          {/* Account Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Account Balance</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${modeStatus.accountBalance.toLocaleString()}
              </div>
              <p className="text-sm text-gray-400">
                {modeStatus.isRealMode ? 'Real Account' : 'Simulated Funds'}
              </p>
            </div>

            <div className="p-4 bg-black/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${modeStatus.isAuthenticated ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-white">
                  {modeStatus.isAuthenticated ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {modeStatus.isRealMode ? 'Live Account Session' : 'Simulation Ready'}
              </p>
            </div>
          </div>

          {/* Trading Metrics */}
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="text-white font-medium mb-3">Trading Performance</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {modeStatus.tradingMetrics.totalTrades}
                </div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {modeStatus.tradingMetrics.successRate}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  modeStatus.tradingMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${modeStatus.tradingMetrics.totalPnL.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Total P&L</div>
              </div>
            </div>
          </div>

          {/* PTNI Status */}
          <div className="p-4 bg-black/20 rounded-lg">
            <h4 className="text-white font-medium mb-3">PTNI Analytics Engine</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Analytics Active</span>
                <Badge variant={modeStatus.ptniStatus.analyticsActive ? "default" : "secondary"}>
                  {modeStatus.ptniStatus.analyticsActive ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Diagnostics Running</span>
                <Badge variant={modeStatus.ptniStatus.diagnosticsRunning ? "default" : "secondary"}>
                  {modeStatus.ptniStatus.diagnosticsRunning ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Real-time KPIs</span>
                <Badge variant={modeStatus.ptniStatus.realTimeKPIs ? "default" : "secondary"}>
                  {modeStatus.ptniStatus.realTimeKPIs ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={executeTestTrade}
              className={`flex-1 ${
                modeStatus.isRealMode 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Execute Test Trade
            </Button>
            <Button
              onClick={fetchModeStatus}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}