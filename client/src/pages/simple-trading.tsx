import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function SimpleTradingPage() {
  const [credentials, setCredentials] = useState({
    username: 'bm.watson34@gmail.com',
    password: 'Panthers3477',
    mfaCode: '4134'
  });
  const [authResult, setAuthResult] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const authenticateMutation = useMutation({
    mutationFn: async (creds: any) => {
      const response = await fetch('/api/trading/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds)
      });
      return await response.json();
    },
    onSuccess: (result) => {
      setAuthResult(result);
      setIsConnected(result.success);
    },
    onError: (error: any) => {
      setAuthResult({ success: false, message: error.message });
      setIsConnected(false);
    }
  });

  const handleConnect = async () => {
    await authenticateMutation.mutateAsync(credentials);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Robinhood Trading Connection</h1>
        
        {/* Authentication Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Authentication</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">PIN</label>
              <input
                type="text"
                value={credentials.mfaCode}
                onChange={(e) => setCredentials({ ...credentials, mfaCode: e.target.value })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={authenticateMutation.isPending}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-medium disabled:opacity-50"
          >
            {authenticateMutation.isPending ? 'Connecting...' : 'Connect to Robinhood'}
          </button>
        </div>

        {/* Status Display */}
        {authResult && (
          <div className={`rounded-lg p-6 mb-8 ${authResult.success ? 'bg-green-900' : 'bg-red-900'}`}>
            <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
            <p className="mb-2">{authResult.message}</p>
            
            {authResult.success && authResult.accountInfo && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Account Information:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Account: {authResult.accountInfo.accountNumber}</div>
                  <div>Buying Power: ${authResult.accountInfo.buyingPower}</div>
                  <div>Total Equity: ${authResult.accountInfo.totalEquity}</div>
                  <div>Day Trades: {authResult.accountInfo.dayTradeCount}</div>
                </div>
              </div>
            )}
            
            {authResult.requiresMfa && (
              <p className="text-yellow-300">MFA code required. Please enter your PIN above.</p>
            )}
          </div>
        )}

        {/* Account Overview */}
        {isConnected && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Live Trading Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  ${authResult?.accountInfo?.buyingPower || '800.00'}
                </div>
                <div className="text-sm text-gray-400">Available Balance</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  ${authResult?.accountInfo?.totalEquity || '800.00'}
                </div>
                <div className="text-sm text-gray-400">Total Equity</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {authResult?.accountInfo?.dayTradeCount || '0'}
                </div>
                <div className="text-sm text-gray-400">Day Trades Used</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}