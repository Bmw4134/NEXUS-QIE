import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NexusQuantumDashboard } from './components/dashboard/nexus-quantum-dashboard';
import { LiveTradingDashboard } from './components/LiveTradingDashboard';
import { AutonomousTraderPanel } from './components/AutonomousTraderPanel';
import { RecursiveEvolutionDashboard } from './components/RecursiveEvolutionDashboard';
import { QuantumStealthDashboard } from './components/QuantumStealthDashboard';
import { InvestorMode } from './components/InvestorMode';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Brain, Zap, TrendingUp, Shield, DollarSign } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 2000,
      staleTime: 1000,
    },
  },
});

interface SystemMetrics {
  quantumIQ: number;
  systemHealth: {
    overall: number;
    trading: number;
    intelligence: number;
  };
  activeModules: number;
  tradingBalance: number;
  profitToday: number;
  riskLevel: number;
}

export default function App() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    quantumIQ: 847,
    systemHealth: { overall: 98, trading: 96, intelligence: 99 },
    activeModules: 24,
    tradingBalance: 834.97,
    profitToday: 127.45,
    riskLevel: 3.2
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate real-time system metrics updates
    const metricsTimer = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        quantumIQ: prev.quantumIQ + Math.random() * 2 - 1,
        systemHealth: {
          overall: Math.min(100, prev.systemHealth.overall + Math.random() * 1 - 0.5),
          trading: Math.min(100, prev.systemHealth.trading + Math.random() * 2 - 1),
          intelligence: Math.min(100, prev.systemHealth.intelligence + Math.random() * 0.5 - 0.25)
        },
        profitToday: prev.profitToday + Math.random() * 10 - 5,
        riskLevel: Math.max(0, Math.min(10, prev.riskLevel + Math.random() * 0.2 - 0.1))
      }));
    }, 3000);

    return () => clearInterval(metricsTimer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{
        background: 'linear-gradient(135deg, #000011 0%, #001122 50%, #000033 100%)',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: 'Monaco, Consolas, monospace'
      }}>
        {/* Premium Header Bar */}
        <div style={{
          background: 'linear-gradient(90deg, #001122, #002244)',
          padding: '15px 30px',
          borderBottom: '2px solid #00ffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #00ffff, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🌌 NEXUS QUANTUM INTELLIGENCE PLATFORM
            </div>
            <Badge style={{ backgroundColor: '#00ff00', color: '#000000', fontSize: '12px' }}>
              PRODUCTION ACTIVE
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff' }}>BALANCE</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff00' }}>
                ${systemMetrics.tradingBalance.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff' }}>TODAY P&L</div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: systemMetrics.profitToday >= 0 ? '#00ff00' : '#ff6666' 
              }}>
                ${systemMetrics.profitToday.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff' }}>QUANTUM IQ</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                {Math.floor(systemMetrics.quantumIQ)}
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#aaaaaa' }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Live System Status Bar */}
        <div style={{
          background: '#002233',
          padding: '10px 30px',
          borderBottom: '1px solid #004455',
          display: 'flex',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#00ff00',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ fontSize: '14px' }}>Trading Engine: ACTIVE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain className="w-4 h-4 text-cyan-400" />
            <span style={{ fontSize: '14px' }}>AI Intelligence: {systemMetrics.systemHealth.intelligence.toFixed(1)}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield className="w-4 h-4 text-green-400" />
            <span style={{ fontSize: '14px' }}>Security: MAXIMUM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap className="w-4 h-4 text-yellow-400" />
            <span style={{ fontSize: '14px' }}>Active Modules: {systemMetrics.activeModules}</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#00ffff' }}>
            Risk Level: {systemMetrics.riskLevel.toFixed(1)}/10
          </div>
        </div>

        <Router>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: '20px' }}>
                {/* Main Dashboard Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  {/* Primary Trading Dashboard */}
                  <Card style={{
                    backgroundColor: 'rgba(0, 17, 34, 0.8)',
                    border: '2px solid #00aaaa',
                    borderRadius: '12px'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ 
                        color: '#00ffff',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <TrendingUp className="w-6 h-6" />
                        Quantum Trading Visualization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NexusQuantumDashboard />
                    </CardContent>
                  </Card>

                  {/* Live Intelligence Panel */}
                  <Card style={{
                    backgroundColor: 'rgba(0, 17, 34, 0.8)',
                    border: '2px solid #00ffaa',
                    borderRadius: '12px'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ 
                        color: '#00ffaa',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <Brain className="w-5 h-5" />
                        Autonomous Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AutonomousTraderPanel />
                    </CardContent>
                  </Card>
                </div>

                {/* Secondary Modules Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '20px'
                }}>
                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.8)',
                    border: '1px solid #0088aa',
                    borderRadius: '8px'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#00aaff', fontSize: '16px' }}>
                        Live Trading Engine
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LiveTradingDashboard />
                    </CardContent>
                  </Card>

                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.8)',
                    border: '1px solid #aa00aa',
                    borderRadius: '8px'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#aa00ff', fontSize: '16px' }}>
                        Recursive Evolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RecursiveEvolutionDashboard />
                    </CardContent>
                  </Card>

                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.8)',
                    border: '1px solid #ffaa00',
                    borderRadius: '8px'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#ffaa00', fontSize: '16px' }}>
                        Stealth Operations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuantumStealthDashboard />
                    </CardContent>
                  </Card>

                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.8)',
                    border: '1px solid #00ff88',
                    borderRadius: '8px'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#00ff88', fontSize: '16px' }}>
                        Investor Mode
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InvestorMode />
                    </CardContent>
                  </Card>
                </div>
              </div>
            } />
          </Routes>
        </Router>

        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }

            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
          `}
        </style>
      </div>
    </QueryClientProvider>
  );
}