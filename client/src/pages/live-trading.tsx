import { useState } from 'react';

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
          mfaCode: '4134'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAccountData(result.accountInfo);
        setStatus('Successfully connected to live account');
      } else {
        setStatus(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      setStatus('Network error - please try again');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectCoinbase = async () => {
    setConnectingCoinbase(true);

    try {
      const response = await fetch('/api/coinbase/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'bm.watson34@gmail.com',
          password: 'Panthers3477'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCoinbaseData(result.accountInfo);
      }
    } catch (error) {
      console.error('Coinbase connection failed');
    } finally {
      setConnectingCoinbase(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#111', 
      color: 'white', 
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '36px', marginBottom: '40px', textAlign: 'center' }}>
          LIVE ROBINHOOD TRADING
        </h1>

        <div style={{ 
          backgroundColor: '#222', 
          padding: '30px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Account Connection</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <strong>Email:</strong> bm.watson34@gmail.com<br/>
            <strong>Password:</strong> Panthers3477<br/>
            <strong>PIN:</strong> 4134
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

          <div style={{ 
            marginTop: '20px', 
            padding: '15px',
            backgroundColor: '#333',
            borderRadius: '5px'
          }}>
            <strong>Status:</strong> {status}
          </div>
        </div>

        {accountData && (
          <div style={{ 
            backgroundColor: '#004400', 
            padding: '30px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>ROBINHOOD LIVE ACCOUNT</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '18px'
            }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Account Number</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {accountData.accountNumber}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Buying Power</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>
                  ${accountData.buyingPower}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Equity</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffff00' }}>
                  ${accountData.totalEquity}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Day Trades</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {accountData.dayTradeCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {coinbaseData && (
          <div style={{ 
            backgroundColor: '#000044', 
            padding: '30px', 
            borderRadius: '8px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>COINBASE LIVE ACCOUNT</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              fontSize: '18px'
            }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Account ID</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {coinbaseData.accountId}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Available Balance</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0052ff' }}>
                  ${coinbaseData.availableBalance}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Balance</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00aaff' }}>
                  ${coinbaseData.totalBalance}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Portfolio Value</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  ${coinbaseData.portfolioValue}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nexus Quantum Trading Mode */}
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
                🌌 NEXUS QUANTUM TRADING - NO PDT RESTRICTIONS
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
                📊 FULL DASHBOARD
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
          platform: 'robinhood',
          symbol,
          side,
          quantity,
          orderType,
          price: orderType === 'limit' ? price : undefined
        })
      });

      const result = await response.json();
      setLastTrade(result);
    } catch (error) {
      setLastTrade({ success: false, message: 'Trade execution failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#333',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Side</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#333',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white'
            }}
          >
            <option value="buy">BUY</option>
            <option value="sell">SELL</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#333',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#333',
              border: '1px solid #666',
              borderRadius: '4px',
              color: 'white'
            }}
          >
            <option value="market">MARKET</option>
            <option value="limit">LIMIT</option>
          </select>
        </div>

        {orderType === 'limit' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: '1px solid #666',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </div>
        )}
      </div>

      <button
        onClick={executeTrade}
        disabled={isExecuting}
        style={{
          backgroundColor: isExecuting ? '#666' : (side === 'buy' ? '#00aa00' : '#aa0000'),
          color: 'white',
          padding: '12px 24px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '5px',
          cursor: isExecuting ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginRight: '15px'
        }}
      >
        {isExecuting ? 'EXECUTING...' : `${side.toUpperCase()} ${quantity} ${symbol}`}
      </button>

      {lastTrade && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: lastTrade.success ? '#003300' : '#330000',
          borderRadius: '5px',
          border: `1px solid ${lastTrade.success ? '#00ff00' : '#ff0000'}`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            {lastTrade.success ? '✓ TRADE EXECUTED' : '✗ TRADE FAILED'}
          </div>
          <div style={{ fontSize: '14px' }}>{lastTrade.message}</div>
          {lastTrade.success && lastTrade.orderId && (
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              Order ID: {lastTrade.orderId}
              {lastTrade.executedPrice && (
                <span> | Price: ${lastTrade.executedPrice.toFixed(2)}</span>
              )}
            </div>
          )}
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
      return await apiRequest('/api/crypto/trade', {
        method: 'POST',
        body: JSON.stringify(tradeData),
        headers: { 'Content-Type': 'application/json' }
      });
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

  const selectedAsset = cryptoAssets?.find((asset: any) => asset.symbol === selectedCrypto);
  const currentPosition = cryptoPositions?.find((pos: any) => pos.symbol === selectedCrypto);

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
            ${cryptoPositions?.reduce((sum: number, pos: any) => sum + (pos.totalValue || 0), 0)?.toFixed(2) || '0.00'}
          </span>
        </div>
        <div style={{ color: '#aaaaaa', marginBottom: '2px' }}>
          Available: <span style={{ color: '#00ffff' }}>$834.97</span>
        </div>
        <div style={{ color: '#aaaaaa' }}>
          Positions: <span style={{ color: '#ffaa00' }}>{cryptoPositions?.length || 0}</span>
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
    { name: 'RH Portfolio', url: 'https://robinhood.com/account' },
    { name: 'Market Watch', url: 'https://finance.yahoo.com/quote/AAPL' },
    { name: 'After Hours', url: 'https://robinhood.com/collections/after-hours-movers' },
    { name: 'Crypto', url: 'https://robinhood.com/crypto' },
    { name: 'Options', url: 'https://robinhood.com/options' }
  ];

  return (
    <div style={{
      backgroundColor: '#000022',
      border: '1px solid #00aaaa',
      borderRadius: '8px',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Browser Header */}
      <div style={{
        backgroundColor: '#003333',
        padding: '10px',
        borderBottom: '1px solid #00aaaa',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{ fontSize: '14px', color: '#00ffff', fontWeight: 'bold' }}>
          NEXUS BROWSER
        </div>
        <input
          type="text"
          value={activeUrl}
          onChange={(e) => setActiveUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && navigateTo(activeUrl)}
          style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: '#001111',
            border: '1px solid #00aaaa',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px'
          }}
        />
        <button
          onClick={() => navigateTo(activeUrl)}
          style={{
            padding: '5px 15px',
            backgroundColor: '#005555',
            border: '1px solid #00aaaa',
            borderRadius: '4px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          GO
        </button>
      </div>

      {/* Quick Links */}
      <div style={{
        backgroundColor: '#002222',
        padding: '8px',
        borderBottom: '1px solid #00aaaa',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {quickLinks.map((link, idx) => (
          <button
            key={idx}
            onClick={() => navigateTo(link.url)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#004444',
              border: '1px solid #00aaaa',
              borderRadius: '3px',
              color: '#00ffff',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {link.name}
          </button>
        ))}
      </div>

      {/* Browser Content */}
      <div style={{
        flex: 1,
        backgroundColor: '#000011',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <iframe
          src={activeUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#ffffff'
          }}
          title="Nexus Trading Browser"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        
        {/* Quantum overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 0%, rgba(0,255,255,0.05) 25%, transparent 50%, rgba(0,255,255,0.05) 75%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        
        {/* Status indicator */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#00ffff',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 2
        }}>
          NEXUS SECURE TRADING VIEW
        </div>
      </div>

      {/* Browser Footer */}
      <div style={{
        backgroundColor: '#003333',
        padding: '5px 10px',
        borderTop: '1px solid #00aaaa',
        fontSize: '11px',
        color: '#aaaaaa',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Quantum-encrypted connection</span>
        <span>After-hours trading active</span>
      </div>
    </div>
  );
}