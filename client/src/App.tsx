
import React, { Suspense, useEffect, useState } from 'react';
import { Route, Router } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AsyncComponentWrapper } from '@/components/AsyncComponentWrapper';
import { QIEEmbeddedPanel } from '@/components/QIEEmbeddedPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Shield, Crown, Activity, Server, Database, Eye } from 'lucide-react';

// Lazy load components
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const EnhancedDashboard = React.lazy(() => import('@/pages/EnhancedDashboard'));
const TradingBot = React.lazy(() => import('@/pages/trading-bot'));
const LiveTrading = React.lazy(() => import('@/pages/live-trading'));
const WatsonCommand = React.lazy(() => import('@/pages/watson-command'));
const QIEIntelligenceHub = React.lazy(() => import('@/pages/QIEIntelligenceHub'));
const QuantumInsights = React.lazy(() => import('@/pages/QuantumInsights'));
const AIConfiguration = React.lazy(() => import('@/pages/AIConfiguration'));
const NexusOperatorConsole = React.lazy(() => import('@/pages/NexusOperatorConsole'));
const PTNIBrowserTerminal = React.lazy(() => import('@/pages/ptni-browser-terminal'));
const RecursiveEvolution = React.lazy(() => import('@/pages/RecursiveEvolution'));
const QuantumTradingDashboard = React.lazy(() => import('@/pages/quantum-trading-dashboard'));
const BimInfinity = React.lazy(() => import('@/pages/bim-infinity'));
const InfinitySovereign = React.lazy(() => import('@/pages/infinity-sovereign'));
const InfinityUniform = React.lazy(() => import('@/pages/infinity-uniform'));
const KaizenAgent = React.lazy(() => import('@/pages/kaizen-agent'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// QIE Platform Landing Component
function QIEPlatformLanding() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [qieStats, setQieStats] = useState<any>(null);

  useEffect(() => {
    // Fetch QIE system status
    fetch('/api/qie/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(console.error);

    // Fetch QIE platform stats
    fetch('/api/system/overview')
      .then(res => res.json())
      .then(data => setQieStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Quantum Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-16 h-16 text-purple-400 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              QIE PLATFORM
            </h1>
          </div>
          <p className="text-2xl text-blue-200 mb-4">Quantum Intelligence Engine</p>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto">
            Autonomous AI orchestration, quantum trading, browser automation, and superintelligent decision making
          </p>
          
          {/* Live Status Indicators */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <Badge className="bg-green-600 text-white px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              {systemStatus?.engine?.status || 'ACTIVE'}
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              <Server className="w-4 h-4 mr-2" />
              {systemStatus?.engine?.activeTargets || 0} Targets
            </Badge>
            <Badge className="bg-purple-600 text-white px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              {systemStatus?.engine?.quantumAccuracy || 99.7}% Accuracy
            </Badge>
          </div>
        </div>

        {/* Core Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Watson Command Engine */}
          <Card className="bg-gray-900/50 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center">
                <Brain className="w-6 h-6 mr-2" />
                Watson Command
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Natural language AI command processing with memory awareness</p>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => window.location.href = '/watson-command'}
              >
                Access Watson
              </Button>
            </CardContent>
          </Card>

          {/* QIE Intelligence Hub */}
          <Card className="bg-gray-900/50 border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Activity className="w-6 h-6 mr-2" />
                Intelligence Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Unified agent orchestration and signal intelligence</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/qie-intelligence-hub'}
              >
                Enter Hub
              </Button>
            </CardContent>
          </Card>

          {/* Quantum Trading */}
          <Card className="bg-gray-900/50 border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Quantum Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Autonomous trading with quantum-enhanced decision making</p>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/quantum-trading-dashboard'}
              >
                Trade Now
              </Button>
            </CardContent>
          </Card>

          {/* PTNI Browser Terminal */}
          <Card className="bg-gray-900/50 border-yellow-500/30 hover:border-yellow-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Eye className="w-6 h-6 mr-2" />
                PTNI Terminal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Playwright browser automation and stealth operations</p>
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => window.location.href = '/ptni-browser-terminal'}
              >
                Launch Terminal
              </Button>
            </CardContent>
          </Card>

          {/* NEXUS Console */}
          <Card className="bg-gray-900/50 border-red-500/30 hover:border-red-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                NEXUS Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Master control for system orchestration and monitoring</p>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => window.location.href = '/nexus-operator-console'}
              >
                Access Console
              </Button>
            </CardContent>
          </Card>

          {/* Infinity Sovereign */}
          <Card className="bg-gray-900/50 border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Crown className="w-6 h-6 mr-2" />
                Infinity Sovereign
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Supreme AI controller with recursive evolution</p>
              <Button 
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                onClick={() => window.location.href = '/infinity-sovereign'}
              >
                Enter Sovereign
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {qieStats?.totalModules || 47}
            </div>
            <div className="text-gray-400">Active Modules</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {qieStats?.processedSignals || '8.9K'}
            </div>
            <div className="text-gray-400">Signals Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {qieStats?.systemUptime || '99.97%'}
            </div>
            <div className="text-gray-400">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              ${qieStats?.tradingVolume || '2.4M'}
            </div>
            <div className="text-gray-400">Trading Volume</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Platform Access</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => window.location.href = '/enhanced-dashboard'}
            >
              Enhanced Dashboard
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={() => window.location.href = '/live-trading'}
            >
              Live Trading
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => window.location.href = '/recursive-evolution'}
            >
              Evolution Engine
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              onClick={() => window.location.href = '/kaizen-agent'}
            >
              Kaizen Agent
            </Button>
          </div>
        </div>

        {/* Embedded QIE Panel */}
        <div className="fixed top-4 right-4 z-50">
          <QIEEmbeddedPanel 
            panelId="landing_intelligence"
            type="mini_intelligence"
            position="top_right"
            dashboard="landing"
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="flex h-screen bg-background">
              <Route path="/" component={QIEPlatformLanding} />
              
              {/* Main Platform Routes with Sidebar */}
              <Route path="/platform/:page" component={() => (
                <SidebarProvider>
                  <AppSidebar />
                  <main className="flex-1 overflow-auto">
                    <Suspense fallback={<AsyncComponentWrapper />}>
                      <Route path="/platform/dashboard" component={Dashboard} />
                      <Route path="/platform/enhanced-dashboard" component={EnhancedDashboard} />
                      <Route path="/platform/trading-bot" component={TradingBot} />
                      <Route path="/platform/live-trading" component={LiveTrading} />
                      <Route path="/platform/watson-command" component={WatsonCommand} />
                      <Route path="/platform/qie-intelligence-hub" component={QIEIntelligenceHub} />
                      <Route path="/platform/quantum-insights" component={QuantumInsights} />
                      <Route path="/platform/ai-configuration" component={AIConfiguration} />
                      <Route path="/platform/nexus-operator-console" component={NexusOperatorConsole} />
                      <Route path="/platform/ptni-browser-terminal" component={PTNIBrowserTerminal} />
                      <Route path="/platform/recursive-evolution" component={RecursiveEvolution} />
                      <Route path="/platform/quantum-trading-dashboard" component={QuantumTradingDashboard} />
                      <Route path="/platform/bim-infinity" component={BimInfinity} />
                      <Route path="/platform/infinity-sovereign" component={InfinitySovereign} />
                      <Route path="/platform/infinity-uniform" component={InfinityUniform} />
                      <Route path="/platform/kaizen-agent" component={KaizenAgent} />
                    </Suspense>
                  </main>
                </SidebarProvider>
              )} />

              {/* Direct Access Routes (without sidebar) */}
              <Route path="/watson-command" component={() => (
                <Suspense fallback={<AsyncComponentWrapper />}>
                  <WatsonCommand />
                </Suspense>
              )} />
              <Route path="/qie-intelligence-hub" component={() => (
                <Suspense fallback={<AsyncComponentWrapper />}>
                  <QIEIntelligenceHub />
                </Suspense>
              )} />
              <Route path="/quantum-trading-dashboard" component={() => (
                <Suspense fallback={<AsyncComponentWrapper />}>
                  <QuantumTradingDashboard />
                </Suspense>
              )} />
                <Route path="/ptni-browser-terminal" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <PTNIBrowserTerminal />
                  </Suspense>
                } />
                <Route path="/nexus-operator-console" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <NexusOperatorConsole />
                  </Suspense>
                } />
                <Route path="/infinity-sovereign" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <InfinitySovereign />
                  </Suspense>
                } />
                <Route path="/enhanced-dashboard" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <EnhancedDashboard />
                  </Suspense>
                } />
                <Route path="/live-trading" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <LiveTrading />
                  </Suspense>
                } />
                <Route path="/recursive-evolution" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <RecursiveEvolution />
                  </Suspense>
                } />
                <Route path="/kaizen-agent" element={
                  <Suspense fallback={<AsyncComponentWrapper />}>
                    <KaizenAgent />
                  </Suspense>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
