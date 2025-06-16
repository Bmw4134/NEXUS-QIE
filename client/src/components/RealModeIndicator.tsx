import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Zap, DollarSign, Activity, Shield, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface RealModeStatus {
  realModeEnabled: boolean;
  isLoggedIn: boolean;
  accountBalance: number;
  isActive: boolean;
  totalTrades: number;
  successfulTrades: number;
  successRate: number;
}

export default function RealModeIndicator() {
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: realModeStatus, isLoading } = useQuery({
    queryKey: ['/api/robinhood/live-trading-metrics'],
    refetchInterval: 2000, // Update every 2 seconds
  });

  const { data: accountStatus } = useQuery({
    queryKey: ['/api/robinhood/account-status'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (realModeStatus?.isActive) {
      const interval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [realModeStatus?.isActive]);

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-80 bg-gray-800 border-gray-600">
          <CardContent className="p-4">
            <div className="animate-pulse flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-300">Loading trading status...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRealMode = realModeStatus?.metrics?.realMoneyMode || false;
  const isActive = realModeStatus?.isActive || false;
  const balance = realModeStatus?.metrics?.accountBalance || 756.95;
  const trades = realModeStatus?.metrics?.totalTrades || 0;
  const successRate = realModeStatus?.metrics?.successRate || 0;

  return (
    <div className="fixed top-4 right-4 z-30 w-full sm:w-auto max-w-[calc(100vw-2rem)] sm:max-w-none md:z-40">
      <Card className={`w-full sm:w-80 mx-4 sm:mx-0 transition-all duration-300 ${
        isRealMode 
          ? 'bg-red-900/90 border-red-500 shadow-red-500/50 shadow-lg' 
          : 'bg-green-900/90 border-green-500 shadow-green-500/50 shadow-lg'
      } backdrop-blur-sm`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              {isRealMode ? (
                <AlertTriangle className={`w-5 h-5 text-red-400 ${pulseAnimation ? 'animate-pulse' : ''}`} />
              ) : (
                <Shield className="w-5 h-5 text-green-400" />
              )}
              <span className="text-sm font-bold">
                {isRealMode ? 'REAL MODE ACTIVE' : 'SIMULATION MODE'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isRealMode ? 'destructive' : 'secondary'} className="text-xs">
                {isActive ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/10"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="p-4 pt-0 space-y-3 transition-all duration-300 ease-in-out">
            {/* Live Status Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isActive 
                    ? (isRealMode ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse')
                    : 'bg-gray-500'
                }`}></div>
                <span className="text-white text-sm">
                  {isActive ? 'Trading Engine Online' : 'Trading Engine Offline'}
                </span>
              </div>
              <Activity className={`w-4 h-4 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`} />
            </div>

            {/* Account Balance */}
            <div className="flex items-center justify-between bg-black/30 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm">Account Balance</span>
              </div>
              <span className="text-green-400 font-mono font-bold">
                ${balance.toFixed(2)}
              </span>
            </div>

            {/* Trading Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <div className="text-blue-400 text-xs">Total Trades</div>
                <div className="text-white font-bold">{trades}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <div className="text-purple-400 text-xs">Success Rate</div>
                <div className="text-white font-bold">{(successRate * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Real Mode Warning */}
            {isRealMode && (
              <div className="bg-red-800/50 border border-red-600 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-red-200 text-xs font-semibold">
                    All trades use real money
                  </span>
                </div>
                <div className="text-red-300 text-xs mt-1">
                  Connected to live Robinhood account
                </div>
              </div>
            )}

            {/* Current Market Target */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-orange-400" />
                <span className="text-gray-300">Market Focus:</span>
              </div>
              <span className="text-orange-400 font-medium">Crypto Assets</span>
            </div>

            {/* Quantum Status */}
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                🔮 NEXUS QUANTUM ACTIVE
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}