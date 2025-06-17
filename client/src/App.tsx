
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import QIEEmbeddedPanel from '@/components/QIEEmbeddedPanel';

// Import all pages
import Dashboard from '@/pages/Dashboard';
import EnhancedDashboard from '@/pages/EnhancedDashboard';
import SmartPlanner from '@/pages/SmartPlanner';
import WealthPulse from '@/pages/WealthPulse';
import QuantumInsights from '@/pages/QuantumInsights';
import NexusNotes from '@/pages/NexusNotes';
import FamilySync from '@/pages/FamilySync';
import FamilyBoards from '@/pages/FamilyBoards';
import CanvasBoards from '@/pages/CanvasBoards';
import AIConfiguration from '@/pages/AIConfiguration';
import QNISAdmin from '@/pages/QNISAdmin';
import QIEIntelligenceHub from '@/pages/QIEIntelligenceHub';
import QIESignalPanel from '@/pages/QIESignalPanel';
import QIEPromptDNA from '@/pages/QIEPromptDNA';
import LiveTrading from '@/pages/live-trading';
import NexusTradingTerminal from '@/pages/nexus-trading-terminal';
import QuantumTradingDashboard from '@/pages/quantum-trading-dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

interface NEXUSQIEState {
  accountBalance: number;
  totalEquity: number;
  dailyGain: number;
  portfolioValue: number;
  positions: Array<{
    symbol: string;
    quantity: number;
    currentPrice: number;
    marketValue: number;
    dayChange: number;
    dayChangePercent: number;
  }>;
  tradingEngines: {
    robinhood: boolean;
    alpaca: boolean;
    coinbase: boolean;
  };
  systemHealth: number;
  quantumAccuracy: number;
}

export default function App() {
  const [nexusState, setNexusState] = useState<NEXUSQIEState>({
    accountBalance: 834.97,
    totalEquity: 2034.07,
    dailyGain: 421.1,
    portfolioValue: 855,
    positions: [
      {
        symbol: 'AAPL',
        quantity: 5,
        currentPrice: 185.43,
        marketValue: 927.15,
        dayChange: 8.21,
        dayChangePercent: 4.5
      },
      {
        symbol: 'TSLA',
        quantity: 2,
        currentPrice: 243.87,
        marketValue: 487.74,
        dayChange: -12.43,
        dayChangePercent: -2.4
      },
      {
        symbol: 'NVDA',
        quantity: 3,
        currentPrice: 431.22,
        marketValue: 1293.66,
        dayChange: 15.67,
        dayChangePercent: 3.8
      }
    ],
    tradingEngines: {
      robinhood: true,
      alpaca: true,
      coinbase: true
    },
    systemHealth: 97,
    quantumAccuracy: 99.7
  });

  useEffect(() => {
    console.log('🚀 NEXUS-QIE Production Interface Loading...');
    console.log('⚡ Quantum Intelligence Enterprise trading platform initializing...');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setNexusState(prev => ({
        ...prev,
        positions: prev.positions.map(pos => ({
          ...pos,
          currentPrice: pos.currentPrice + (Math.random() - 0.5) * 2,
          dayChange: pos.dayChange + (Math.random() - 0.5) * 0.5,
          dayChangePercent: pos.dayChangePercent + (Math.random() - 0.5) * 0.1
        }))
      }));
    }, 3000);

    console.log('✅ NEXUS-QIE Production Interface Loaded');
    console.log('🌌 Quantum Intelligence Enterprise trading platform operational');

    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nexus-qie-theme">
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* NEXUS-QIE Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">⚡</span>
                    </div>
                    <div>
                      <h1 className="text-white text-lg font-bold">NEXUS-QIE</h1>
                      <p className="text-blue-400 text-xs">Quantum Intelligence Enterprise Platform</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">${nexusState.accountBalance.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Available Balance</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${nexusState.totalEquity.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Total Equity</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">+${nexusState.dailyGain.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Day P&L</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">NEXUS ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            <SidebarProvider>
              <div className="flex pt-20">
                <AppSidebar />
                
                <main className="flex-1 p-6 space-y-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/enhanced-dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/enhanced-dashboard" element={
                      <div className="space-y-6">
                        {/* Live Positions Card */}
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6">
                          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Live Positions
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {nexusState.positions.map((position) => (
                              <div key={position.symbol} className="bg-slate-700/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-white font-bold text-lg">{position.symbol}</h3>
                                  <span className="text-gray-400 text-sm">{position.quantity} shares</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">
                                  ${position.currentPrice.toFixed(2)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg text-gray-300">
                                    ${position.marketValue.toFixed(2)}
                                  </span>
                                  <span className={`text-sm font-medium ${
                                    position.dayChange >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {position.dayChange >= 0 ? '+' : ''}${position.dayChange.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Buy Orders */}
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6">
                          <h2 className="text-xl font-bold text-white mb-4">Quick Buy Orders</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['AAPL', 'TSLA', 'NVDA', 'SPY'].map((symbol) => (
                              <button
                                key={`buy-${symbol}`}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                              >
                                Buy {symbol}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Sell Orders */}
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6">
                          <h2 className="text-xl font-bold text-white mb-4">Quick Sell Orders</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['AAPL', 'TSLA', 'NVDA', 'SPY'].map((symbol) => (
                              <button
                                key={`sell-${symbol}`}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                              >
                                Sell {symbol}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Trading Engines Status */}
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6">
                          <h2 className="text-xl font-bold text-white mb-4">Trading Engines Status</h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(nexusState.tradingEngines).map(([engine, status]) => (
                              <div key={engine} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                <span className="text-white font-medium capitalize">{engine}</span>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <span className={`text-sm font-medium ${status ? 'text-green-400' : 'text-red-400'}`}>
                                    {status ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* NEXUS Intelligence Modules */}
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 p-6">
                          <h2 className="text-xl font-bold text-white mb-4">NEXUS Intelligence Modules</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700">
                              <div className="text-blue-400 text-sm font-medium">AI Analytics</div>
                              <div className="text-white text-lg font-bold">Active</div>
                            </div>
                            <div className="bg-green-900/50 p-4 rounded-lg border border-green-700">
                              <div className="text-green-400 text-sm font-medium">Risk Analysis</div>
                              <div className="text-white text-lg font-bold">Running</div>
                            </div>
                            <div className="bg-purple-900/50 p-4 rounded-lg border border-purple-700">
                              <div className="text-purple-400 text-sm font-medium">Auto Trading</div>
                              <div className="text-white text-lg font-bold">Enabled</div>
                            </div>
                            <div className="bg-orange-900/50 p-4 rounded-lg border border-orange-700">
                              <div className="text-orange-400 text-sm font-medium">Market Sentiment</div>
                              <div className="text-white text-lg font-bold">Monitoring</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    } />
                    <Route path="/smart-planner" element={<SmartPlanner />} />
                    <Route path="/wealth-pulse" element={<WealthPulse />} />
                    <Route path="/quantum-insights" element={<QuantumInsights />} />
                    <Route path="/nexus-notes" element={<NexusNotes />} />
                    <Route path="/family-sync" element={<FamilySync />} />
                    <Route path="/family-boards" element={<FamilyBoards />} />
                    <Route path="/canvas-boards" element={<CanvasBoards />} />
                    <Route path="/ai-configuration" element={<AIConfiguration />} />
                    <Route path="/qnis-admin" element={<QNISAdmin />} />
                    <Route path="/qie-intelligence-hub" element={<QIEIntelligenceHub />} />
                    <Route path="/qie-signal-panel" element={<QIESignalPanel />} />
                    <Route path="/qie-prompt-dna" element={<QIEPromptDNA />} />
                    <Route path="/live-trading" element={<LiveTrading />} />
                    <Route path="/nexus-trading-terminal" element={<NexusTradingTerminal />} />
                    <Route path="/quantum-trading-dashboard" element={<QuantumTradingDashboard />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>

            {/* QIE Embedded Panels */}
            <QIEEmbeddedPanel 
              panelId="enhanced_dashboard_intelligence" 
              type="mini_intelligence" 
              position="top_right"
              dashboard="enhanced_dashboard"
            />
            <QIEEmbeddedPanel 
              panelId="enhanced_dashboard_signals" 
              type="signal_feed" 
              position="bottom_left"
              dashboard="enhanced_dashboard"
            />
            <QIEEmbeddedPanel 
              panelId="enhanced_dashboard_ops" 
              type="ops_daemon" 
              position="floating"
              dashboard="enhanced_dashboard"
            />
          </div>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
