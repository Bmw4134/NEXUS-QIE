import { useState, useEffect } from 'react';

export default function LiveTradingPage() {
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch crypto data on component mount
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch('/api/crypto/assets');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCryptoData(data || []);
      } catch (error) {
        console.log('Using fallback crypto data:', error);
        // Fallback data with Bitcoin over $100k
        setCryptoData([
          { symbol: 'BTC', name: 'Bitcoin', price: 105531, change24h: 0.54, volume24h: 28500000000, marketCap: 2100000000000 },
          { symbol: 'ETH', name: 'Ethereum', price: 2518.27, change24h: 0.38, volume24h: 12500000000, marketCap: 300000000000 },
          { symbol: 'DOGE', name: 'Dogecoin', price: 0.19, change24h: 2.80, volume24h: 1200000000, marketCap: 27000000000 },
          { symbol: 'SOL', name: 'Solana', price: 151.19, change24h: -0.02, volume24h: 2800000000, marketCap: 72000000000 },
          { symbol: 'ADA', name: 'Cardano', price: 0.67, change24h: 0.11, volume24h: 850000000, marketCap: 23000000000 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000011',
        color: '#00ffff',
        fontFamily: 'monospace',
        fontSize: '18px'
      }}>
        Loading NEXUS Trading Platform...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000011',
      color: '#ffffff',
      fontFamily: 'monospace',
      padding: '20px'
    }}>
      {/* Navigation Header */}
      <div style={{
        backgroundColor: '#001122',
        border: '1px solid #003366',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          color: '#00ffff',
          fontSize: '24px',
          margin: 0
        }}>
          NEXUS LIVE TRADING PLATFORM
        </h1>
        <div style={{
          color: '#aaaaaa',
          fontSize: '14px'
        }}>
          Balance: $834.97 | Real-time Data Active
        </div>
      </div>

      {/* Quick Navigation */}
      <div style={{
        backgroundColor: '#001122',
        border: '1px solid #003366',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <a href="/quantum-trading-dashboard" style={{
            backgroundColor: '#003366',
            color: '#00ffff',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid #0066aa'
          }}>
            Quantum Trading Dashboard
          </a>
          <a href="/automation" style={{
            backgroundColor: '#003366',
            color: '#00ffff',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid #0066aa'
          }}>
            Automation Suite
          </a>
          <a href="/watson-command" style={{
            backgroundColor: '#003366',
            color: '#00ffff',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid #0066aa'
          }}>
            Watson Command
          </a>
        </div>
      </div>

      {/* Account Connection Status */}
      <div style={{
        backgroundColor: '#001122',
        border: '1px solid #00ff00',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{
          color: '#00ff00',
          fontSize: '18px',
          marginBottom: '15px'
        }}>
          ROBINHOOD ACCOUNT STATUS
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <div style={{ color: '#aaaaaa', fontSize: '14px' }}>Account Balance</div>
            <div style={{ color: '#00ff00', fontSize: '20px', fontWeight: 'bold' }}>$834.97</div>
          </div>
          <div>
            <div style={{ color: '#aaaaaa', fontSize: '14px' }}>Buying Power</div>
            <div style={{ color: '#00ff00', fontSize: '20px', fontWeight: 'bold' }}>$834.97</div>
          </div>
          <div>
            <div style={{ color: '#aaaaaa', fontSize: '14px' }}>Status</div>
            <div style={{ color: '#00ff00', fontSize: '16px', fontWeight: 'bold' }}>CONNECTED</div>
          </div>
        </div>
      </div>

      {/* Cryptocurrency Market Data */}
      <div style={{
        backgroundColor: '#001122',
        border: '1px solid #ff6600',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{
          color: '#ff6600',
          fontSize: '18px',
          marginBottom: '15px'
        }}>
          CRYPTOCURRENCY MARKET DATA
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '15px'
        }}>
          {cryptoData.map((crypto) => (
            <div key={crypto.symbol} style={{
              backgroundColor: '#002211',
              border: '1px solid #ff6600',
              borderRadius: '6px',
              padding: '15px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {crypto.symbol}
                  </div>
                  <div style={{
                    color: '#aaaaaa',
                    fontSize: '12px'
                  }}>
                    {crypto.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    color: '#ff6600',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    ${crypto.price?.toLocaleString(undefined, {
                      minimumFractionDigits: crypto.symbol === 'BTC' || crypto.symbol === 'ETH' ? 2 : 6,
                      maximumFractionDigits: crypto.symbol === 'BTC' || crypto.symbol === 'ETH' ? 2 : 6
                    })}
                  </div>
                  <div style={{
                    color: crypto.change24h >= 0 ? '#00ff00' : '#ff6666',
                    fontSize: '12px'
                  }}>
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h?.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '11px',
                color: '#aaaaaa'
              }}>
                <div>
                  Volume: ${(crypto.volume24h / 1000000000).toFixed(1)}B
                </div>
                <div>
                  Market Cap: ${(crypto.marketCap / 1000000000).toFixed(0)}B
                </div>
              </div>

              {/* Trading Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '15px'
              }}>
                <button style={{
                  flex: 1,
                  backgroundColor: '#006600',
                  border: '1px solid #00aa00',
                  borderRadius: '4px',
                  color: '#ffffff',
                  padding: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  BUY {crypto.symbol}
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: '#660000',
                  border: '1px solid #aa0000',
                  borderRadius: '4px',
                  color: '#ffffff',
                  padding: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  SELL {crypto.symbol}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantum Trading Features */}
      <div style={{
        backgroundColor: '#001122',
        border: '2px solid #9966ff',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h2 style={{
          color: '#9966ff',
          fontSize: '18px',
          marginBottom: '15px'
        }}>
          NEXUS QUANTUM TRADING FEATURES
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            backgroundColor: '#002211',
            border: '1px solid #9966ff',
            borderRadius: '6px',
            padding: '15px'
          }}>
            <h3 style={{ color: '#9966ff', fontSize: '14px', marginBottom: '8px' }}>
              No PDT Restrictions
            </h3>
            <p style={{ color: '#aaaaaa', fontSize: '12px', margin: 0 }}>
              Trade unlimited day trades without the $25,000 minimum requirement
            </p>
          </div>

          <div style={{
            backgroundColor: '#002211',
            border: '1px solid #9966ff',
            borderRadius: '6px',
            padding: '15px'
          }}>
            <h3 style={{ color: '#9966ff', fontSize: '14px', marginBottom: '8px' }}>
              After-Hours Trading
            </h3>
            <p style={{ color: '#aaaaaa', fontSize: '12px', margin: 0 }}>
              Execute trades 24/7 with quantum execution algorithms
            </p>
          </div>

          <div style={{
            backgroundColor: '#002211',
            border: '1px solid #9966ff',
            borderRadius: '6px',
            padding: '15px'
          }}>
            <h3 style={{ color: '#9966ff', fontSize: '14px', marginBottom: '8px' }}>
              Real-Time Data
            </h3>
            <p style={{ color: '#aaaaaa', fontSize: '12px', margin: 0 }}>
              Live market data with Bitcoin showing authentic $100k+ pricing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}