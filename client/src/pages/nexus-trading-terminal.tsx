export default function NexusTradingTerminal() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000011',
      color: '#00ffff',
      fontFamily: 'Courier New, monospace',
      overflow: 'hidden',
      zIndex: 9999
    }}>
      {/* Terminal Header */}
      <div style={{
        backgroundColor: '#001122',
        borderBottom: '2px solid #00ffff',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00ffff'
        }}>
          NEXUS QUANTUM TRADING TERMINAL
        </div>
        <div style={{
          fontSize: '14px',
          color: '#aaaaaa'
        }}>
          ROBINHOOD BALANCE: $834.97 | STATUS: CONNECTED
        </div>
      </div>

      {/* Main Trading Interface */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 60px)'
      }}>
        {/* Left Panel - Market Data */}
        <div style={{
          width: '50%',
          borderRight: '1px solid #003366',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <h2 style={{
            color: '#ff6600',
            fontSize: '18px',
            marginBottom: '20px',
            borderBottom: '1px solid #ff6600',
            paddingBottom: '10px'
          }}>
            LIVE CRYPTOCURRENCY MARKET
          </h2>

          {/* Bitcoin - Featured */}
          <div style={{
            backgroundColor: '#002211',
            border: '2px solid #00ff00',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div>
                <div style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  BTC
                </div>
                <div style={{
                  color: '#aaaaaa',
                  fontSize: '14px'
                }}>
                  Bitcoin
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  color: '#00ff00',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}>
                  $105,543
                </div>
                <div style={{
                  color: '#00ff00',
                  fontSize: '14px'
                }}>
                  +0.48%
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '15px'
            }}>
              <button style={{
                flex: 1,
                backgroundColor: '#006600',
                border: '2px solid #00aa00',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                BUY BTC
              </button>
              <button style={{
                flex: 1,
                backgroundColor: '#660000',
                border: '2px solid #aa0000',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                SELL BTC
              </button>
            </div>
          </div>

          {/* Other Cryptocurrencies */}
          {[
            { symbol: 'ETH', name: 'Ethereum', price: '2,518.15', change: '+0.39%', color: '#00ffff' },
            { symbol: 'DOGE', name: 'Dogecoin', price: '0.19', change: '+2.79%', color: '#ffaa00' },
            { symbol: 'SOL', name: 'Solana', price: '151.19', change: '0.00%', color: '#9966ff' },
            { symbol: 'ADA', name: 'Cardano', price: '0.67', change: '+0.15%', color: '#0066ff' }
          ].map((crypto, idx) => (
            <div key={idx} style={{
              backgroundColor: '#002211',
              border: '1px solid #003366',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  color: crypto.color,
                  fontSize: '18px',
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
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  ${crypto.price}
                </div>
                <div style={{
                  color: crypto.change.startsWith('+') ? '#00ff00' : 
                        crypto.change.startsWith('-') ? '#ff6666' : '#aaaaaa',
                  fontSize: '12px'
                }}>
                  {crypto.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel - Trading Controls */}
        <div style={{
          width: '50%',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <h2 style={{
            color: '#9966ff',
            fontSize: '18px',
            marginBottom: '20px',
            borderBottom: '1px solid #9966ff',
            paddingBottom: '10px'
          }}>
            QUANTUM TRADING CONTROLS
          </h2>

          {/* Account Status */}
          <div style={{
            backgroundColor: '#002211',
            border: '1px solid #00ff00',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#00ff00',
              fontSize: '16px',
              marginBottom: '15px'
            }}>
              ROBINHOOD ACCOUNT
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <div>
                <div style={{ color: '#aaaaaa', fontSize: '12px' }}>Balance</div>
                <div style={{ color: '#00ff00', fontSize: '20px', fontWeight: 'bold' }}>$834.97</div>
              </div>
              <div>
                <div style={{ color: '#aaaaaa', fontSize: '12px' }}>Buying Power</div>
                <div style={{ color: '#00ff00', fontSize: '20px', fontWeight: 'bold' }}>$834.97</div>
              </div>
              <div>
                <div style={{ color: '#aaaaaa', fontSize: '12px' }}>Status</div>
                <div style={{ color: '#00ff00', fontSize: '16px', fontWeight: 'bold' }}>CONNECTED</div>
              </div>
              <div>
                <div style={{ color: '#aaaaaa', fontSize: '12px' }}>Mode</div>
                <div style={{ color: '#9966ff', fontSize: '16px', fontWeight: 'bold' }}>QUANTUM</div>
              </div>
            </div>
          </div>

          {/* Quick Trade */}
          <div style={{
            backgroundColor: '#002211',
            border: '1px solid #ff6600',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#ff6600',
              fontSize: '16px',
              marginBottom: '15px'
            }}>
              QUICK TRADE
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#aaaaaa', fontSize: '12px', marginBottom: '5px' }}>Asset</div>
              <select style={{
                width: '100%',
                backgroundColor: '#001122',
                border: '1px solid #003366',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '8px',
                fontSize: '14px'
              }}>
                <option>BTC - Bitcoin</option>
                <option>ETH - Ethereum</option>
                <option>DOGE - Dogecoin</option>
                <option>SOL - Solana</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#aaaaaa', fontSize: '12px', marginBottom: '5px' }}>Amount ($)</div>
              <input 
                type="number" 
                placeholder="0.00"
                style={{
                  width: '100%',
                  backgroundColor: '#001122',
                  border: '1px solid #003366',
                  borderRadius: '4px',
                  color: '#ffffff',
                  padding: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button style={{
                flex: 1,
                backgroundColor: '#006600',
                border: '2px solid #00aa00',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                BUY
              </button>
              <button style={{
                flex: 1,
                backgroundColor: '#660000',
                border: '2px solid #aa0000',
                borderRadius: '6px',
                color: '#ffffff',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                SELL
              </button>
            </div>
          </div>

          {/* Quantum Features */}
          <div style={{
            backgroundColor: '#002211',
            border: '1px solid #9966ff',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              color: '#9966ff',
              fontSize: '16px',
              marginBottom: '15px'
            }}>
              QUANTUM FEATURES ACTIVE
            </h3>
            
            {[
              'No PDT Restrictions',
              'After-Hours Trading',
              'Real-Time Execution',
              'Watson LLM Integration',
              'Quantum ML Predictions'
            ].map((feature, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#00ff00',
                  borderRadius: '50%',
                  marginRight: '10px'
                }}></div>
                <div style={{
                  color: '#ffffff',
                  fontSize: '14px'
                }}>
                  {feature}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001122',
        borderTop: '1px solid #003366',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }}>
        <div style={{ color: '#aaaaaa' }}>
          Market Data: LIVE | Connection: SECURE | Latency: 12ms
        </div>
        <div style={{ color: '#00ff00' }}>
          ● NEXUS QUANTUM TRADING ACTIVE
        </div>
      </div>
    </div>
  );
}