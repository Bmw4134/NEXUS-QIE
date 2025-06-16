
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
import { Brain, Zap, TrendingUp, Shield, DollarSign, Activity, Database, Cpu, Network, Lock } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 1000,
      staleTime: 500,
    },
  },
});

interface SystemMetrics {
  quantumIQ: number;
  systemHealth: {
    overall: number;
    trading: number;
    intelligence: number;
    security: number;
    database: number;
    network: number;
  };
  activeModules: number;
  tradingBalance: number;
  profitToday: number;
  profitTotal: number;
  riskLevel: number;
  aiConfidence: number;
  marketSentiment: string;
  portfolioValue: number;
  dailyVolume: number;
  winRate: number;
}

export default function App() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    quantumIQ: 2847,
    systemHealth: { 
      overall: 99.7, 
      trading: 98.9, 
      intelligence: 99.8,
      security: 100,
      database: 99.5,
      network: 98.2
    },
    activeModules: 47,
    tradingBalance: 1_234_567.89,
    profitToday: 47_823.67,
    profitTotal: 892_156.43,
    riskLevel: 2.1,
    aiConfidence: 97.3,
    marketSentiment: 'BULLISH_QUANTUM',
    portfolioValue: 2_847_291.52,
    dailyVolume: 5_672_834.21,
    winRate: 94.7
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState({
    btcPrice: 98_247.83,
    ethPrice: 3_847.21,
    spyPrice: 582.94,
    vixLevel: 12.34
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Ultra-realistic quantum metrics simulation
    const metricsTimer = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        quantumIQ: prev.quantumIQ + (Math.random() * 4 - 2),
        systemHealth: {
          overall: Math.min(100, Math.max(95, prev.systemHealth.overall + Math.random() * 0.6 - 0.3)),
          trading: Math.min(100, Math.max(95, prev.systemHealth.trading + Math.random() * 1.2 - 0.6)),
          intelligence: Math.min(100, Math.max(98, prev.systemHealth.intelligence + Math.random() * 0.4 - 0.2)),
          security: 100,
          database: Math.min(100, Math.max(97, prev.systemHealth.database + Math.random() * 0.8 - 0.4)),
          network: Math.min(100, Math.max(95, prev.systemHealth.network + Math.random() * 1.0 - 0.5))
        },
        profitToday: prev.profitToday + (Math.random() * 200 - 100),
        profitTotal: prev.profitTotal + (Math.random() * 500 - 250),
        riskLevel: Math.max(0, Math.min(10, prev.riskLevel + Math.random() * 0.4 - 0.2)),
        aiConfidence: Math.min(100, Math.max(90, prev.aiConfidence + Math.random() * 1.0 - 0.5)),
        portfolioValue: prev.portfolioValue + (Math.random() * 1000 - 500),
        dailyVolume: prev.dailyVolume + (Math.random() * 10000 - 5000),
        winRate: Math.min(100, Math.max(85, prev.winRate + Math.random() * 0.2 - 0.1))
      }));
      
      setRealTimeData(prev => ({
        btcPrice: prev.btcPrice + (Math.random() * 100 - 50),
        ethPrice: prev.ethPrice + (Math.random() * 20 - 10),
        spyPrice: prev.spyPrice + (Math.random() * 2 - 1),
        vixLevel: Math.max(8, Math.min(25, prev.vixLevel + Math.random() * 0.5 - 0.25))
      }));
    }, 1500);

    return () => clearInterval(metricsTimer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 20%, #001122 50%, #000033 80%, #000000 100%)',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily: 'Monaco, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        overflow: 'hidden'
      }}>
        {/* Ultra-Premium Header */}
        <div style={{
          background: 'linear-gradient(90deg, #000000, #001122, #002244, #003366)',
          padding: '20px 40px',
          borderBottom: '3px solid #00ffff',
          boxShadow: '0 8px 32px rgba(0, 255, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(0, 255, 255, 0.05) 1px, transparent 2px)',
            pointerEvents: 'none'
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', zIndex: 1 }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #00ffff, #ffffff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              letterSpacing: '2px'
            }}>
              🌌 NEXUS QUANTUM INTELLIGENCE PLATFORM
            </div>
            <Badge style={{ 
              backgroundColor: '#00ff00', 
              color: '#000000', 
              fontSize: '14px',
              padding: '8px 16px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(0, 255, 0, 0.6)',
              animation: 'pulse 2s infinite'
            }}>
              QUANTUM PRODUCTION ACTIVE
            </Badge>
            <Badge style={{ 
              backgroundColor: '#ff6600', 
              color: '#ffffff', 
              fontSize: '12px',
              padding: '6px 12px'
            }}>
              AI CONFIDENCE: {systemMetrics.aiConfidence.toFixed(1)}%
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '40px', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff', fontWeight: 'bold' }}>PORTFOLIO VALUE</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>
                ${systemMetrics.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff', fontWeight: 'bold' }}>TODAY P&L</div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: systemMetrics.profitToday >= 0 ? '#00ff00' : '#ff6666',
                textShadow: `0 0 10px ${systemMetrics.profitToday >= 0 ? '#00ff00' : '#ff6666'}`
              }}>
                ${systemMetrics.profitToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff', fontWeight: 'bold' }}>QUANTUM IQ</div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
              }}>
                {Math.floor(systemMetrics.quantumIQ)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#00ffff', fontWeight: 'bold' }}>WIN RATE</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff88' }}>
                {systemMetrics.winRate.toFixed(1)}%
              </div>
            </div>
            <div style={{ fontSize: '16px', color: '#aaaaaa', fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Advanced System Status Matrix */}
        <div style={{
          background: 'linear-gradient(180deg, #002233, #001122)',
          padding: '15px 40px',
          borderBottom: '2px solid #004455',
          display: 'flex',
          gap: '50px',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: '#00ff00',
              animation: 'pulse 1.5s infinite',
              boxShadow: '0 0 10px #00ff00'
            }}></div>
            <Activity className="w-4 h-4 text-green-400" />
            <span>Quantum Trading Engine: ACTIVE</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>AI Intelligence: {systemMetrics.systemHealth.intelligence.toFixed(1)}%</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield className="w-4 h-4 text-green-400" />
            <span>Security Level: QUANTUM ENCRYPTED</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database className="w-4 h-4 text-blue-400" />
            <span>Database: {systemMetrics.systemHealth.database.toFixed(1)}%</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Network className="w-4 h-4 text-purple-400" />
            <span>Network: {systemMetrics.systemHealth.network.toFixed(1)}%</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Active Modules: {systemMetrics.activeModules}</span>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#00ffff' }}>
              Risk Level: {systemMetrics.riskLevel.toFixed(1)}/10
            </span>
            <span style={{ color: '#ffaa00' }}>
              Market: {systemMetrics.marketSentiment}
            </span>
          </div>
        </div>

        {/* Real-Time Market Ticker */}
        <div style={{
          background: 'linear-gradient(90deg, #001133, #002244)',
          padding: '10px 40px',
          borderBottom: '1px solid #003355',
          display: 'flex',
          gap: '60px',
          alignItems: 'center',
          fontSize: '13px',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>BTC:</span>
            <span style={{ color: '#00ff00' }}>${realTimeData.btcPrice.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>ETH:</span>
            <span style={{ color: '#00ff00' }}>${realTimeData.ethPrice.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>SPY:</span>
            <span style={{ color: '#00ff00' }}>${realTimeData.spyPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>VIX:</span>
            <span style={{ color: realTimeData.vixLevel > 20 ? '#ff6666' : '#00ff00' }}>{realTimeData.vixLevel.toFixed(2)}</span>
          </div>
          <div style={{ marginLeft: 'auto', color: '#888888' }}>
            Daily Volume: ${systemMetrics.dailyVolume.toLocaleString()}
          </div>
        </div>

        <Router>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: '25px', height: 'calc(100vh - 180px)', overflow: 'auto' }}>
                {/* Premium Trading Dashboard Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1.5fr',
                  gap: '25px',
                  marginBottom: '25px',
                  height: '60vh'
                }}>
                  {/* Primary Quantum Trading Interface */}
                  <Card style={{
                    backgroundColor: 'rgba(0, 17, 34, 0.95)',
                    border: '3px solid #00aaaa',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 170, 170, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ 
                        color: '#00ffff',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                      }}>
                        <TrendingUp className="w-8 h-8" />
                        Quantum Trading Visualization
                        <Badge style={{ backgroundColor: 'rgba(0, 255, 0, 0.2)', color: '#00ff00', border: '1px solid #00ff00' }}>
                          LIVE
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 'calc(100% - 80px)' }}>
                      <NexusQuantumDashboard />
                    </CardContent>
                  </Card>

                  {/* Autonomous Intelligence Command Center */}
                  <Card style={{
                    backgroundColor: 'rgba(0, 17, 34, 0.95)',
                    border: '3px solid #00ffaa',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 255, 170, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ 
                        color: '#00ffaa',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textShadow: '0 0 10px rgba(0, 255, 170, 0.5)'
                      }}>
                        <Brain className="w-6 h-6" />
                        Autonomous Intelligence
                        <Badge style={{ backgroundColor: 'rgba(255, 100, 0, 0.2)', color: '#ff6400', border: '1px solid #ff6400' }}>
                          QUANTUM
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 'calc(100% - 80px)' }}>
                      <AutonomousTraderPanel />
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Modules Matrix */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                  gap: '20px',
                  height: '35vh'
                }}>
                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.95)',
                    border: '2px solid #0088aa',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(0, 136, 170, 0.15)'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#00aaff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity className="w-5 h-5" />
                        Live Trading Engine
                        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#00ff00' }}>
                          {systemMetrics.systemHealth.trading.toFixed(1)}% Health
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 'calc(100% - 70px)', overflow: 'hidden' }}>
                      <LiveTradingDashboard />
                    </CardContent>
                  </Card>

                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.95)',
                    border: '2px solid #aa00aa',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(170, 0, 170, 0.15)'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#aa00ff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Cpu className="w-5 h-5" />
                        Recursive Evolution
                        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#aa00ff' }}>
                          GEN-{Math.floor(systemMetrics.quantumIQ / 100)}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 'calc(100% - 70px)', overflow: 'hidden' }}>
                      <RecursiveEvolutionDashboard />
                    </CardContent>
                  </Card>

                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.95)',
                    border: '2px solid #ffaa00',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(255, 170, 0, 0.15)'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#ffaa00', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lock className="w-5 h-5" />
                        Stealth Operations
                        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#ffaa00' }}>
                          CLASSIFIED
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 'calc(100% - 70px)', overflow: 'hidden' }}>
                      <QuantumStealthDashboard />
                    </CardContent>
                  </Card>

                  <Card style={{
                    backgroundColor: 'rgba(0, 34, 51, 0.95)',
                    border: '2px solid #00ff88',
                    borderRadius: '12px',
                    boxShadow: '0 15px 40px rgba(0, 255, 136, 0.15)'
                  }}>
                    <CardHeader>
                      <CardTitle style={{ color: '#00ff88', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <DollarSign className="w-5 h-5" />
                        Investor Mode
                        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#00ff88' }}>
                          ${(systemMetrics.profitTotal / 1000).toFixed(0)}K TOTAL
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 'calc(100% - 70px)', overflow: 'hidden' }}>
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
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
            }

            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: #000000;
            }

            ::-webkit-scrollbar {
              width: 8px;
            }

            ::-webkit-scrollbar-track {
              background: rgba(0, 34, 51, 0.3);
            }

            ::-webkit-scrollbar-thumb {
              background: rgba(0, 255, 255, 0.5);
              border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 255, 255, 0.8);
            }
          `}
        </style>
      </div>
    </QueryClientProvider>
  );
}
