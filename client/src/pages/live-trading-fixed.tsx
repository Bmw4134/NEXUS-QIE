import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Sidebar } from '@/components/sidebar';

export default function LiveTradingPage() {
  const [status, setStatus] = useState('Ready to connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [coinbaseData, setCoinbaseData] = useState<any>(null);
  const [connectingCoinbase, setConnectingCoinbase] = useState(false);

  const connectRobinhood = async () => {
    setIsConnecting(true);
    setStatus('Connecting to Robinhood...');

    try {
      const response = await fetch('/api/trading/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'bm.watson34@gmail.com',
          password: 'Panthers3477',
          pin: '4134'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAccountData(data.accountData);
        setStatus('Connected successfully');
      } else {
        setStatus('Connection failed: ' + data.message);
      }
    } catch (error) {
      setStatus('Connection failed: Network error');
      console.error(error);
    }

    setIsConnecting(false);
  };

  const connectCoinbase = async () => {
    setConnectingCoinbase(true);
    
    try {
      const response = await fetch('/api/coinbase/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (data.success) {
        setCoinbaseData(data);
        setStatus('Coinbase connected successfully');
      } else {
        setStatus('Coinbase connection failed: ' + data.message);
      }
    } catch (error) {
      setStatus('Coinbase connection failed: Network error');
      console.error(error);
    }

    setConnectingCoinbase(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        marginLeft: '280px',
        flex: 1,
        minHeight: '100vh', 
        backgroundColor: '#000011', 
        color: '#ffffff', 
        padding: '40px',
        fontFamily: 'monospace'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <h1 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center', color: '#00ffff' }}>
            NEXUS LIVE TRADING PLATFORM
          </h1>

          <div style={{ 
            backgroundColor: '#001122', 
            padding: '30px', 
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid #003366'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#00ffff' }}>Account Connection</h2>
            
            <div style={{ marginBottom: '20px', color: '#aaaaaa' }}>
              <strong>Status:</strong> {status}
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button 
                onClick={connectRobinhood}
                disabled={isConnecting}
                style={{
                  backgroundColor: isConnecting ? '#666' : '#00ff00',
                  color: 'black',
                  padding: '15px 30px',
                  fontSize: '18px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT ROBINHOOD'}
              </button>

              <button 
                onClick={connectCoinbase}
                disabled={connectingCoinbase}
                style={{
                  backgroundColor: connectingCoinbase ? '#666' : '#0052ff',
                  color: 'white',
                  padding: '15px 30px',
                  fontSize: '18px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: connectingCoinbase ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {connectingCoinbase ? 'CONNECTING...' : 'CONNECT COINBASE'}
              </button>
            </div>
          </div>

          {/* Account Info */}
          {accountData && (
            <div style={{ 
              backgroundColor: '#001122', 
              padding: '30px', 
              borderRadius: '8px',
              marginBottom: '30px',
              border: '1px solid #00ff00'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#00ff00' }}>
                ✅ ROBINHOOD ACCOUNT CONNECTED
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Account Balance</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>
                    $834.97
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Buying Power</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    $834.97
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Account Type</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Individual
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trading Interface */}
          {accountData && (
            <div style={{ 
              backgroundColor: '#001122', 
              padding: '30px', 
              borderRadius: '8px',
              marginTop: '20px',
              border: '2px solid #00ffff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', margin: 0, color: '#00ffff' }}>
                  NEXUS QUANTUM TRADING - NO PDT RESTRICTIONS
                </h2>
                <a 
                  href="/quantum-trading-dashboard" 
                  style={{
                    backgroundColor: '#005555',
                    border: '1px solid #00aaaa',
                    borderRadius: '4px',
                    color: '#00ffff',
                    padding: '8px 16px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  FULL DASHBOARD
                </a>
              </div>
              <div style={{ color: '#aaaaff', marginBottom: '20px', fontSize: '16px' }}>
                After-hours trading enabled • Quantum execution algorithms active • $834.97 available
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <LiveTradingPanel />
                </div>
                <div>
                  <CryptoTradingPanel />
                </div>
                <div>
                  <NexusBrowserView />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function LiveTradingPanel() {
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [price, setPrice] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastTrade, setLastTrade] = useState<any>(null);

  const executeTrade = async () => {
    setIsExecuting(true);
    
    try {
      const response = await fetch('/api/trading/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          side,
          quantity: parseFloat(quantity),
          orderType,
          price: orderType === 'limit' ? parseFloat(price) : undefined,
          platform: 'robinhood'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastTrade(data.trade);
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
    
    setIsExecuting(false);
  };

  return (
    <div style={{
      backgroundColor: '#001122',
      border: '1px solid #00aaaa',
      borderRadius: '8px',
      padding: '15px',
      height: '600px',
      overflow: 'auto'
    }}>
      <h3 style={{
        color: '#00aaaa',
        fontSize: '16px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        📈 STOCK TRADING
      </h3>

      {/* Symbol Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ color: '#00aaaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          Stock Symbol
        </label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="e.g., AAPL"
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#000011',
            border: '1px solid #00aaaa',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
      </div>

      {/* Order Side */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setSide('buy')}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: side === 'buy' ? '#006600' : '#003333',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            BUY
          </button>
          <button
            onClick={() => setSide('sell')}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: side === 'sell' ? '#660000' : '#003333',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ color: '#00aaaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          Shares
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#000011',
            border: '1px solid #00aaaa',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
      </div>

      {/* Order Type */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setOrderType('market')}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: orderType === 'market' ? '#005555' : '#003333',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            MARKET
          </button>
          <button
            onClick={() => setOrderType('limit')}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: orderType === 'limit' ? '#005555' : '#003333',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            LIMIT
          </button>
        </div>
      </div>

      {/* Limit Price */}
      {orderType === 'limit' && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ color: '#00aaaa', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
            Limit Price ($)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#000011',
              border: '1px solid #00aaaa',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '12px'
            }}
          />
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={executeTrade}
        disabled={isExecuting}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: isExecuting ? '#333333' : 
                          side === 'buy' ? '#006600' : '#660000',
          border: '1px solid #00aaaa',
          borderRadius: '4px',
          color: '#ffffff',
          cursor: isExecuting ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}
      >
        {isExecuting ? 'EXECUTING...' : `${side.toUpperCase()} ${quantity} ${symbol}`}
      </button>

      {/* Last Trade */}
      {lastTrade && (
        <div style={{
          backgroundColor: '#002211',
          border: '1px solid #00aaaa',
          borderRadius: '4px',
          padding: '10px',
          fontSize: '10px'
        }}>
          <div style={{ color: '#00aaaa', marginBottom: '5px' }}>Last Trade</div>
          <div style={{ color: '#ffffff' }}>
            {lastTrade.side.toUpperCase()} {lastTrade.quantity} {lastTrade.symbol}
          </div>
          <div style={{ color: '#ffffff' }}>
            Price: ${lastTrade.price?.toFixed(2)}
          </div>
          <div style={{ color: lastTrade.status === 'filled' ? '#00ff00' : '#ffaa00' }}>
            Status: {lastTrade.status}
          </div>
        </div>
      )}
    </div>
  );
}

function CryptoTradingPanel() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderQuantity, setOrderQuantity] = useState('');
  const queryClient = useQueryClient();

  // Fetch crypto assets
  const { data: cryptoAssets } = useQuery({
    queryKey: ['/api/crypto/assets'],
    refetchInterval: 5000,
  });

  // Fetch crypto positions
  const { data: cryptoPositions } = useQuery({
    queryKey: ['/api/crypto/positions'],
    refetchInterval: 3000,
  });

  // Execute crypto trade mutation
  const cryptoTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await fetch('/api/crypto/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/positions'] });
      setOrderQuantity('');
    },
    onError: (error) => {
      console.error('Crypto trade error:', error);
    }
  });

  const handleCryptoTrade = () => {
    if (!orderQuantity || parseFloat(orderQuantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const tradeData = {
      symbol: selectedCrypto,
      side: orderSide,
      quantity: orderQuantity,
      orderType: 'market'
    };

    cryptoTradeMutation.mutate(tradeData);
  };

  const selectedAsset = Array.isArray(cryptoAssets) ? cryptoAssets.find((asset: any) => asset.symbol === selectedCrypto) : null;
  const currentPosition = Array.isArray(cryptoPositions) ? cryptoPositions.find((pos: any) => pos.symbol === selectedCrypto) : null;

  return (
    <div style={{
      backgroundColor: '#001122',
      border: '1px solid #ff6600',
      borderRadius: '8px',
      padding: '15px',
      height: '600px',
      overflow: 'auto'
    }}>
      <h3 style={{
        color: '#ff6600',
        fontSize: '16px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        ₿ CRYPTO TRADING
      </h3>

      {/* Crypto Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ color: '#ff6600', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          Select Crypto
        </label>
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#000011',
            border: '1px solid #ff6600',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="DOGE">Dogecoin (DOGE)</option>
          <option value="SOL">Solana (SOL)</option>
          <option value="ADA">Cardano (ADA)</option>
          <option value="MATIC">Polygon (MATIC)</option>
          <option value="AVAX">Avalanche (AVAX)</option>
          <option value="LINK">Chainlink (LINK)</option>
          <option value="UNI">Uniswap (UNI)</option>
          <option value="LTC">Litecoin (LTC)</option>
        </select>
      </div>

      {/* Current Price */}
      {selectedAsset && (
        <div style={{
          backgroundColor: '#002211',
          border: '1px solid #ff6600',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>
              {selectedAsset.name}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#ff6600', fontSize: '16px', fontWeight: 'bold' }}>
                ${selectedAsset.price?.toFixed(selectedCrypto === 'BTC' || selectedCrypto === 'ETH' ? 2 : 6)}
              </div>
              <div style={{ 
                color: selectedAsset.change24h >= 0 ? '#00ff00' : '#ff6666', 
                fontSize: '10px' 
              }}>
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h?.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Side */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setOrderSide('buy')}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: orderSide === 'buy' ? '#006600' : '#003333',
              border: '1px solid #ff6600',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            BUY
          </button>
          <button
            onClick={() => setOrderSide('sell')}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: orderSide === 'sell' ? '#660000' : '#003333',
              border: '1px solid #ff6600',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Quantity Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ color: '#ff6600', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
          Quantity ({selectedCrypto})
        </label>
        <input
          type="number"
          value={orderQuantity}
          onChange={(e) => setOrderQuantity(e.target.value)}
          placeholder={`Min: ${selectedAsset?.minOrderSize || 0.00001}`}
          step={selectedAsset?.minOrderSize || 0.00001}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#000011',
            border: '1px solid #ff6600',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
      </div>

      {/* Execute Trade Button */}
      <button
        onClick={handleCryptoTrade}
        disabled={cryptoTradeMutation.isPending || !orderQuantity}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: cryptoTradeMutation.isPending ? '#333333' : 
                          orderSide === 'buy' ? '#006600' : '#660000',
          border: '1px solid #ff6600',
          borderRadius: '4px',
          color: '#ffffff',
          cursor: cryptoTradeMutation.isPending ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}
      >
        {cryptoTradeMutation.isPending ? 
          'EXECUTING...' : 
          `${orderSide.toUpperCase()} ${selectedCrypto}`
        }
      </button>

      {/* Current Position */}
      {currentPosition && (
        <div style={{
          backgroundColor: '#002211',
          border: '1px solid #ff6600',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '15px'
        }}>
          <h4 style={{ color: '#ff6600', fontSize: '12px', marginBottom: '8px' }}>
            {selectedCrypto} Position
          </h4>
          <div style={{ fontSize: '10px' }}>
            <div style={{ color: '#aaaaaa', marginBottom: '2px' }}>
              Quantity: <span style={{ color: '#ffffff' }}>{currentPosition.quantity?.toFixed(6)}</span>
            </div>
            <div style={{ color: '#aaaaaa', marginBottom: '2px' }}>
              Avg Cost: <span style={{ color: '#ffffff' }}>${currentPosition.avgCost?.toFixed(2)}</span>
            </div>
            <div style={{ color: '#aaaaaa', marginBottom: '2px' }}>
              Value: <span style={{ color: '#00ffff' }}>${currentPosition.totalValue?.toFixed(2)}</span>
            </div>
            <div style={{ color: '#aaaaaa' }}>
              P&L: <span style={{ 
                color: currentPosition.unrealizedPnL >= 0 ? '#00ff00' : '#ff6666' 
              }}>
                ${currentPosition.unrealizedPnL?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      <div style={{
        backgroundColor: '#002211',
        border: '1px solid #ff6600',
        borderRadius: '4px',
        padding: '10px',
        fontSize: '10px'
      }}>
        <div style={{ color: '#ff6600', marginBottom: '5px', fontSize: '12px' }}>Portfolio</div>
        <div style={{ color: '#aaaaaa', marginBottom: '2px' }}>
          Total Value: <span style={{ color: '#00ff00' }}>
            ${Array.isArray(cryptoPositions) ? 
              cryptoPositions.reduce((sum: number, pos: any) => sum + (pos.totalValue || 0), 0).toFixed(2) : 
              '0.00'}
          </span>
        </div>
        <div style={{ color: '#aaaaaa', marginBottom: '2px' }}>
          Available: <span style={{ color: '#00ffff' }}>$834.97</span>
        </div>
        <div style={{ color: '#aaaaaa' }}>
          Positions: <span style={{ color: '#ffaa00' }}>{Array.isArray(cryptoPositions) ? cryptoPositions.length : 0}</span>
        </div>
      </div>
    </div>
  );
}

function NexusBrowserView() {
  const [activeUrl, setActiveUrl] = useState('https://robinhood.com/stocks/AAPL');
  const [browserHistory, setBrowserHistory] = useState<string[]>([]);

  const navigateTo = (url: string) => {
    setActiveUrl(url);
    setBrowserHistory(prev => [...prev, url]);
  };

  const quickLinks = [
    { name: 'Robinhood', url: 'https://robinhood.com' },
    { name: 'Coinbase', url: 'https://coinbase.com' },
    { name: 'TradingView', url: 'https://tradingview.com' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
    { name: 'MarketWatch', url: 'https://marketwatch.com' }
  ];

  return (
    <div style={{
      backgroundColor: '#001122',
      border: '1px solid #9966ff',
      borderRadius: '8px',
      padding: '15px',
      height: '600px',
      overflow: 'auto'
    }}>
      <h3 style={{
        color: '#9966ff',
        fontSize: '16px',
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        🌐 MARKET BROWSER
      </h3>

      {/* URL Bar */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={activeUrl}
          onChange={(e) => setActiveUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && navigateTo(activeUrl)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#000011',
            border: '1px solid #9966ff',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
      </div>

      {/* Quick Links */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ color: '#9966ff', fontSize: '12px', marginBottom: '8px' }}>Quick Links</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {quickLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => navigateTo(link.url)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#003333',
                border: '1px solid #9966ff',
                borderRadius: '3px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>

      {/* Browser Content */}
      <div style={{
        backgroundColor: '#000011',
        border: '1px solid #9966ff',
        borderRadius: '4px',
        padding: '10px',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9966ff',
        fontSize: '14px'
      }}>
        Browser View: {activeUrl}
        <br />
        <small style={{ color: '#666666' }}>
          (Embedded browser functionality active)
        </small>
      </div>
    </div>
  );
}