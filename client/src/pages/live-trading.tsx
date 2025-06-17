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
          apiKey: 'your-api-key',
          apiSecret: 'your-api-secret'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCoinbaseData(result.accounts);
        setStatus('Successfully connected to Coinbase');
      } else {
        setStatus(`Coinbase connection failed: ${result.message}`);
      }
    } catch (error) {
      setStatus('Coinbase network error - please try again');
    } finally {
      setConnectingCoinbase(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Live Trading Dashboard</h1>
          
          {/* Connection Status */}
          <div className="mb-8 p-4 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <p className="mb-4">{status}</p>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={connectRobinhood}
                disabled={isConnecting}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Robinhood'}
              </button>
              
              <button
                onClick={connectCoinbase}
                disabled={connectingCoinbase}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 disabled:opacity-50"
              >
                {connectingCoinbase ? 'Connecting...' : 'Connect Coinbase'}
              </button>
            </div>
          </div>

          {/* Account Information */}
          {accountData && (
            <div className="mb-8 p-4 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Total Equity:</p>
                  <p className="text-2xl font-bold text-green-600">${accountData.totalEquity}</p>
                </div>
                <div>
                  <p className="font-medium">Buying Power:</p>
                  <p className="text-lg">${accountData.buyingPower}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trading Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border p-4">
              <LiveTradingPanel />
            </div>
            <div className="bg-card rounded-lg border p-4">
              <CryptoTradingPanel />
            </div>
            <div className="bg-card rounded-lg border p-4">
              <NexusBrowserView />
            </div>
          </div>
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
      <h3 className="text-lg font-semibold mb-4">Stock Trading</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border rounded"
            placeholder="AAPL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Side</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium mb-2">Limit Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        <button
          onClick={executeTrade}
          disabled={isExecuting}
          className={`w-full py-2 px-4 rounded font-medium ${
            isExecuting
              ? 'bg-gray-400 cursor-not-allowed'
              : side === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isExecuting ? 'Executing...' : `${side.toUpperCase()} ${quantity} ${symbol}`}
        </button>

        {lastTrade && (
          <div className={`p-3 rounded ${
            lastTrade.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="font-bold">
              {lastTrade.success ? '✓ TRADE EXECUTED' : '✗ TRADE FAILED'}
            </div>
            <div className="text-sm">{lastTrade.message}</div>
            {lastTrade.success && lastTrade.orderId && (
              <div className="text-sm mt-1">
                Order ID: {lastTrade.orderId}
                {lastTrade.executedPrice && (
                  <span> | Price: ${lastTrade.executedPrice.toFixed(2)}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
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

  const selectedAsset = Array.isArray(cryptoAssets) ? cryptoAssets.find((asset: any) => asset.symbol === selectedCrypto) : null;
  const currentPosition = Array.isArray(cryptoPositions) ? cryptoPositions.find((pos: any) => pos.symbol === selectedCrypto) : null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Crypto Trading</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Crypto Asset</label>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="DOGE">Dogecoin (DOGE)</option>
          </select>
        </div>

        {selectedAsset && (
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium">Current Price</div>
            <div className="text-lg font-bold">
              ${selectedAsset.price || '0.00'}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Order Side</label>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderSide('buy')}
              className={`flex-1 py-2 px-4 rounded ${
                orderSide === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`flex-1 py-2 px-4 rounded ${
                orderSide === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-200'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quantity ({selectedCrypto})</label>
          <input
            type="number"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder={selectedAsset ? `Max: ${selectedAsset.balance || '0'}` : '0.00'}
            step="0.00001"
          />
        </div>

        <button
          onClick={handleCryptoTrade}
          disabled={cryptoTradeMutation.isPending || !orderQuantity}
          className={`w-full py-2 px-4 rounded font-medium ${
            cryptoTradeMutation.isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : orderSide === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {cryptoTradeMutation.isPending ? 'Processing...' : `${orderSide.toUpperCase()} ${selectedCrypto}`}
        </button>

        {currentPosition && (
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-sm font-medium">Current Position</div>
            <div className="text-sm">
              Quantity: {currentPosition.quantity} {selectedCrypto}
            </div>
            <div className="text-sm">
              Value: ${currentPosition.marketValue || '0.00'}
            </div>
            <div className="text-sm">
              P&L: ${currentPosition.unrealizedPnl || '0.00'}
            </div>
          </div>
        )}

        {/* Positions Summary */}
        {Array.isArray(cryptoPositions) && cryptoPositions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">All Crypto Positions</h4>
            <div className="space-y-2">
              {cryptoPositions.map((position: any, index: number) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">{position.symbol}</span>: {position.quantity} 
                  (${position.marketValue || '0.00'})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NexusBrowserView() {
  const [activeUrl, setActiveUrl] = useState('https://robinhood.com');
  
  const quickLinks = [
    { name: 'Robinhood', url: 'https://robinhood.com' },
    { name: 'Coinbase', url: 'https://www.coinbase.com' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
    { name: 'MarketWatch', url: 'https://www.marketwatch.com' }
  ];

  const navigateTo = (url: string) => {
    setActiveUrl(url);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Market Browser</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URL</label>
          <input
            type="url"
            value={activeUrl}
            onChange={(e) => setActiveUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && navigateTo(activeUrl)}
            className="w-full px-3 py-2 border rounded"
            placeholder="https://example.com"
          />
        </div>

        <button
          onClick={() => navigateTo(activeUrl)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Navigate
        </button>

        <div>
          <h4 className="font-medium mb-2">Quick Links</h4>
          <div className="space-y-1">
            {quickLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo(link.url)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded min-h-[300px]">
          <div className="text-sm text-gray-600 mb-2">Current URL: {activeUrl}</div>
          <div className="text-center text-gray-500 mt-20">
            Browser view would display content from: {activeUrl}
          </div>
        </div>
      </div>
    </div>
  );
}