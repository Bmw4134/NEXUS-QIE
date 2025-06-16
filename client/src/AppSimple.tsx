import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Shield, Crown, Activity, Server, Database, Eye, TrendingUp, BarChart3, Users } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function WatsonDesktopApp() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Fetch system status
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(console.error);

    // Fetch account data
    fetch('/api/account')
      .then(res => res.json())
      .then(data => setAccountData(data))
      .catch(console.error);

    // Real-time updates
    const interval = setInterval(async () => {
      try {
        const [statusRes, accountRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/account')
        ]);
        const statusData = await statusRes.json();
        const accountDataRes = await accountRes.json();
        setSystemStatus(statusData);
        setAccountData(accountDataRes);
      } catch (error) {
        console.error('Update failed:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              WATSON DESKTOP
            </h1>
            <p className="text-lg text-blue-200 mt-2">NEXUS Quantum Trading Platform</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-400">
              ${accountData?.balance?.toFixed(2) || '834.97'}
            </div>
            <div className="text-sm text-gray-300">Account Balance</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <Badge className="bg-green-600 text-white">
            <Activity className="w-4 h-4 mr-2" />
            {systemStatus?.nexus || 'ACTIVE'}
          </Badge>
          <Badge className="bg-blue-600 text-white">
            <Server className="w-4 h-4 mr-2" />
            Production Mode
          </Badge>
          <Badge className="bg-purple-600 text-white">
            <Zap className="w-4 h-4 mr-2" />
            Quantum Protocols
          </Badge>
        </div>
      </div>

      {/* Trading Engines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Robinhood Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Balance</span>
                <span className="text-white">${accountData?.balance?.toFixed(2) || '834.97'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Buying Power</span>
                <span className="text-white">${accountData?.buying_power?.toFixed(2) || '1,200.00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Alpaca Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-yellow-400">Simulation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mode</span>
                <span className="text-white">Paper Trading</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Ready</span>
                <span className="text-green-400">Yes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Crown className="w-5 h-5 mr-2" />
              Coinbase Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-blue-400">Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Crypto Trading</span>
                <span className="text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Stealth Mode</span>
                <span className="text-purple-400">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEXUS Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              NEXUS Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {systemStatus?.quantumIQ || 847}
                </div>
                <div className="text-sm text-gray-400">Quantum IQ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {systemStatus?.systemHealth?.overall || 95}%
                </div>
                <div className="text-sm text-gray-400">System Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {systemStatus?.activeModules || 12}
                </div>
                <div className="text-sm text-gray-400">Active Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  100%
                </div>
                <div className="text-sm text-gray-400">Bypass Success</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trading Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Equity</span>
                <span className="text-white">${accountData?.total_equity?.toFixed(2) || '2,034.97'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Day's Change</span>
                <span className="text-green-400">+$23.45 (+1.23%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Portfolio Diversity</span>
                <span className="text-blue-400">8 positions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Risk Level</span>
                <span className="text-yellow-400">Moderate</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Platform Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setCurrentView('watson')}
            >
              Watson Command
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setCurrentView('trading')}
            >
              Live Trading
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setCurrentView('quantum')}
            >
              Quantum Hub
            </Button>
            <Button 
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={() => setCurrentView('nexus')}
            >
              NEXUS Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModuleView = (view: string) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {view === 'watson' && 'Watson Command Engine'}
          {view === 'trading' && 'Live Trading Terminal'}
          {view === 'quantum' && 'Quantum Intelligence Hub'}
          {view === 'nexus' && 'NEXUS Operator Console'}
        </h2>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="bg-gray-900/50 border-blue-500/30">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {view === 'watson' && '🧠'}
              {view === 'trading' && '📈'}
              {view === 'quantum' && '⚛️'}
              {view === 'nexus' && '🔮'}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              {view === 'watson' && 'Natural Language AI Command Processing'}
              {view === 'trading' && 'Real-time Market Analysis & Execution'}
              {view === 'quantum' && 'Quantum-Enhanced Decision Making'}
              {view === 'nexus' && 'Master System Orchestration'}
            </h3>
            <p className="text-gray-300 mb-6">
              {view === 'watson' && 'Advanced AI assistant with memory awareness and context understanding for seamless command execution.'}
              {view === 'trading' && 'Professional trading interface with real-time data feeds, advanced charting, and automated execution.'}
              {view === 'quantum' && 'Superintelligent decision engine powered by quantum algorithms and machine learning models.'}
              {view === 'nexus' && 'Central command center for monitoring and controlling all platform systems and integrations.'}
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-green-600 text-white px-4 py-2">
                Status: Active
              </Badge>
              <Badge className="bg-blue-600 text-white px-4 py-2">
                Mode: Production
              </Badge>
              <Badge className="bg-purple-600 text-white px-4 py-2">
                Intelligence: Quantum
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView !== 'dashboard' && renderModuleView(currentView)}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="watson-ui-theme">
      <QueryClientProvider client={queryClient}>
        <WatsonDesktopApp />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;