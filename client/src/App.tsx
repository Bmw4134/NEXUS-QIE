
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

// Enterprise Trading Components
import Dashboard from '@/pages/Dashboard';
import QIEIntelligenceHub from '@/pages/QIEIntelligenceHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Globe, 
  Cpu,
  Zap,
  Target,
  Star,
  Rocket,
  DollarSign,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      refetchInterval: 30 * 1000,
    },
  },
});

// Enterprise Trading Terminal Landing
const EnterpriseTradingTerminal = () => {
  const [liveData, setLiveData] = useState({
    balance: 834.97,
    buyingPower: 2034.97,
    totalEquity: 2034.97,
    daysPnL: 421.10,
    aiScore: 855,
    systemHealth: 97
  });

  const [positions] = useState([
    { symbol: 'AAPL', shares: 15, currentPrice: 185.43, change: '+$2.13' },
    { symbol: 'TSLA', shares: 8, currentPrice: 243.87, change: '+$5.21' },
    { symbol: 'NVDA', shares: 12, currentPrice: 431.22, change: '-$1.45' }
  ]);

  const [tradingEngines] = useState([
    { name: 'Robinhood', status: 'Active', color: 'green' },
    { name: 'Alpaca', status: 'Active', color: 'green' },
    { name: 'Coinbase', status: 'Active', color: 'green' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-blue-800/30 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  NEXUS-QIE
                </h1>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Quantum Intelligence Enterprise Platform
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">${liveData.balance}</div>
                <div className="text-sm text-gray-400">Live Account Balance</div>
                <div className="text-xs text-blue-400">Buying Power: ${liveData.buyingPower.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-400">Total Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${liveData.totalEquity.toLocaleString()}</div>
              <div className="text-xs text-green-400">+${(liveData.totalEquity - 1500).toFixed(2)} (+24.52%)</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400">Day's P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+${liveData.daysPnL}</div>
              <div className="text-xs text-blue-400">+2.45% today</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-400">AI Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{liveData.aiScore}</div>
              <div className="text-xs text-purple-400">Quantum Analysis</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{liveData.systemHealth}%</div>
              <div className="text-xs text-cyan-400">All Systems Operational</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Positions */}
          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="mr-2 h-5 w-5 text-blue-400" />
                Live Positions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {positions.map((position) => (
                <div key={position.symbol} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">{position.symbol}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{position.symbol}</div>
                      <div className="text-gray-400 text-sm">{position.shares} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${position.currentPrice}</div>
                    <div className={`text-sm ${position.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {position.change}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Trading Actions */}
          <div className="space-y-6">
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-green-400">Quick Buy Orders</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Buy AAPL</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Buy TSLA</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Buy NVDA</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Buy SPY</Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-red-400">Quick Sell Orders</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button className="bg-red-600 hover:bg-red-700 text-white">Sell AAPL</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">Sell TSLA</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">Sell NVDA</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white">Sell All</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trading Engines Status */}
        <Card className="mt-8 bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Trading Engines Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tradingEngines.map((engine) => (
                <div key={engine.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${engine.color}-500`}></div>
                    <span className="text-white font-medium">{engine.name}</span>
                  </div>
                  <Badge className={`bg-${engine.color}-500/20 text-${engine.color}-400 border-${engine.color}-500/30`}>
                    {engine.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NEXUS Intelligence Modules */}
        <Card className="mt-8 bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">NEXUS Intelligence Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                <Brain className="mr-2 h-4 w-4" />
                AI Analysis
              </Button>
              <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                <TrendingUp className="mr-2 h-4 w-4" />
                Market Trends
              </Button>
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                <Target className="mr-2 h-4 w-4" />
                Risk Analysis
              </Button>
              <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                <Rocket className="mr-2 h-4 w-4" />
                Auto Trading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-green-500/30 rounded-lg p-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">NEXUS ONLINE</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nexus-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<EnterpriseTradingTerminal />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/qie-intelligence-hub" element={<QIEIntelligenceHub />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
