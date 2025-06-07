import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface QuantumTradingMetrics {
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  quantumEfficiency: number;
  afterHoursTrades: number;
  riskScore: number;
}

interface MarketData {
  timestamp: string;
  price: number;
  volume: number;
  rsi: number;
  macd: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

interface QuantumSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timeframe: string;
  reasoning: string;
  quantum_probability: number;
}

export function NexusQuantumDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1D');
  const [quantumMode, setQuantumMode] = useState(true);

  // Fetch quantum trading metrics
  const { data: metrics } = useQuery<QuantumTradingMetrics>({
    queryKey: ['/api/quantum/metrics'],
    refetchInterval: 5000,
  });

  // Fetch real-time market data
  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ['/api/quantum/market-data', selectedSymbol, timeframe],
    refetchInterval: 2000,
  });

  // Fetch quantum trading signals
  const { data: signals } = useQuery<QuantumSignal[]>({
    queryKey: ['/api/quantum/signals'],
    refetchInterval: 3000,
  });

  const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'AMD', 'META', 'NFLX'];
  const timeframes = ['1m', '5m', '15m', '1H', '1D', '1W'];

  return (
    <div style={{
      backgroundColor: '#000011',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#001122',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #00ffff',
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: '#00ffff',
          fontSize: '28px',
          margin: '0 0 10px 0',
          textAlign: 'center'
        }}>
          🌌 NEXUS QUANTUM TRADING VISUALIZATION DASHBOARD
        </h1>
        <div style={{
          color: '#aaaaff',
          textAlign: 'center',
          fontSize: '16px'
        }}>
          Real-time quantum-enhanced market analysis • After-hours trading enabled • PDT restrictions bypassed
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        backgroundColor: '#002233',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #0088aa',
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Symbol Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#00ffff', fontSize: '14px' }}>Symbol:</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            style={{
              backgroundColor: '#001122',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '5px 10px'
            }}
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>

        {/* Timeframe Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#00ffff', fontSize: '14px' }}>Timeframe:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            style={{
              backgroundColor: '#001122',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '5px 10px'
            }}
          >
            {timeframes.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        {/* Quantum Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#00ffff', fontSize: '14px' }}>Quantum Mode:</label>
          <button
            onClick={() => setQuantumMode(!quantumMode)}
            style={{
              backgroundColor: quantumMode ? '#005555' : '#333333',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: quantumMode ? '#00ffff' : '#aaaaaa',
              padding: '5px 15px',
              cursor: 'pointer'
            }}
          >
            {quantumMode ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </div>

        {/* Account Balance */}
        <div style={{
          marginLeft: 'auto',
          color: '#00ff00',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Balance: $834.97
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <MetricCard
            title="Quantum Efficiency"
            value={`${metrics.quantumEfficiency.toFixed(1)}%`}
            color="#00ffff"
            trend={metrics.quantumEfficiency > 85 ? 'up' : 'down'}
          />
          <MetricCard
            title="Win Rate"
            value={`${metrics.winRate.toFixed(1)}%`}
            color="#00ff00"
            trend={metrics.winRate > 60 ? 'up' : 'down'}
          />
          <MetricCard
            title="Profit/Loss"
            value={`$${metrics.profitLoss.toFixed(2)}`}
            color={metrics.profitLoss >= 0 ? "#00ff00" : "#ff6666"}
            trend={metrics.profitLoss >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="After Hours Trades"
            value={metrics.afterHoursTrades.toString()}
            color="#ffaa00"
            trend="neutral"
          />
          <MetricCard
            title="Risk Score"
            value={`${metrics.riskScore.toFixed(1)}/10`}
            color={metrics.riskScore < 5 ? "#00ff00" : metrics.riskScore < 7 ? "#ffaa00" : "#ff6666"}
            trend={metrics.riskScore < 5 ? 'down' : 'up'}
          />
          <MetricCard
            title="Sharpe Ratio"
            value={metrics.sharpeRatio.toFixed(2)}
            color="#aaaaff"
            trend={metrics.sharpeRatio > 1 ? 'up' : 'down'}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Price Chart */}
        <div style={{
          backgroundColor: '#001122',
          border: '1px solid #0088aa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '15px' }}>
            {selectedSymbol} - Quantum Price Analysis
          </h3>
          {marketData && marketData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#003333" />
                <XAxis dataKey="timestamp" stroke="#00aaaa" />
                <YAxis stroke="#00aaaa" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#001122', 
                    border: '1px solid #00aaaa',
                    color: '#ffffff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#00ffff" 
                  fill="rgba(0,255,255,0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#aaaaaa'
            }}>
              Loading quantum market data...
            </div>
          )}
        </div>

        {/* Quantum Signals */}
        <div style={{
          backgroundColor: '#001122',
          border: '1px solid #0088aa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '15px' }}>
            Quantum Trading Signals
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {signals && signals.length > 0 ? signals.map((signal, idx) => (
              <div key={idx} style={{
                backgroundColor: '#002233',
                border: '1px solid #004455',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {signal.symbol}
                  </span>
                  <span style={{
                    color: signal.signal === 'BUY' ? '#00ff00' : 
                          signal.signal === 'SELL' ? '#ff6666' : '#ffaa00',
                    fontWeight: 'bold'
                  }}>
                    {signal.signal}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#aaaaaa', marginBottom: '5px' }}>
                  Confidence: {(signal.confidence * 100).toFixed(1)}% | 
                  Quantum Probability: {(signal.quantum_probability * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: '11px', color: '#888888' }}>
                  {signal.reasoning}
                </div>
              </div>
            )) : (
              <div style={{ color: '#aaaaaa', textAlign: 'center', padding: '20px' }}>
                Calculating quantum signals...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* RSI Chart */}
        <div style={{
          backgroundColor: '#001122',
          border: '1px solid #0088aa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '15px' }}>
            RSI Oscillator
          </h3>
          {marketData && marketData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#003333" />
                <XAxis dataKey="timestamp" stroke="#00aaaa" />
                <YAxis domain={[0, 100]} stroke="#00aaaa" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#001122', 
                    border: '1px solid #00aaaa',
                    color: '#ffffff'
                  }} 
                />
                <Line type="monotone" dataKey="rsi" stroke="#ffaa00" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#aaaaaa'
            }}>
              Loading RSI data...
            </div>
          )}
        </div>

        {/* Volume Analysis */}
        <div style={{
          backgroundColor: '#001122',
          border: '1px solid #0088aa',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#00ffff', marginBottom: '15px' }}>
            Volume Analysis
          </h3>
          {marketData && marketData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#003333" />
                <XAxis dataKey="timestamp" stroke="#00aaaa" />
                <YAxis stroke="#00aaaa" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#001122', 
                    border: '1px solid #00aaaa',
                    color: '#ffffff'
                  }} 
                />
                <Bar dataKey="volume" fill="rgba(0,255,255,0.6)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#aaaaaa'
            }}>
              Loading volume data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, color, trend }: MetricCardProps) {
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const trendColor = trend === 'up' ? '#00ff00' : trend === 'down' ? '#ff6666' : '#ffaa00';

  return (
    <div style={{
      backgroundColor: '#002233',
      border: '1px solid #004455',
      borderRadius: '8px',
      padding: '15px',
      textAlign: 'center'
    }}>
      <div style={{
        color: '#aaaaaa',
        fontSize: '12px',
        marginBottom: '5px',
        textTransform: 'uppercase'
      }}>
        {title}
      </div>
      <div style={{
        color: color,
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '5px'
      }}>
        {value}
      </div>
      <div style={{
        color: trendColor,
        fontSize: '14px'
      }}>
        {trendIcon}
      </div>
    </div>
  );
}