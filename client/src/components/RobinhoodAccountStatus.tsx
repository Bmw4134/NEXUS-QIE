import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, DollarSign, TrendingUp, Activity, Shield } from 'lucide-react';

interface RobinhoodAccount {
  username: string;
  balance: number;
  buyingPower: number;
  dayTradingBuyingPower: number;
  portfolioValue: number;
  positions: any[];
  orders: any[];
  connected: boolean;
  lastUpdated: string;
  isLive: boolean;
  credentialsProvided: boolean;
}

interface PortfolioData {
  totalValue: number;
  timestamp: string;
  isLive: boolean;
}

export function RobinhoodAccountStatus() {
  const [account, setAccount] = useState<RobinhoodAccount | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const [accountRes, portfolioRes] = await Promise.all([
          fetch('/api/robinhood/account'),
          fetch('/api/robinhood/portfolio')
        ]);

        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setAccount(accountData);
        } else {
          setError('Failed to fetch account data');
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData);
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Account fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
    const interval = setInterval(fetchAccountData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => 
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const executeTestTrade = async () => {
    try {
      const response = await fetch('/api/robinhood/execute-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'BTC',
          side: 'buy',
          amount: 100,
          useRealMoney: true
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Trade executed:', result);
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Connection Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Robinhood Live Account
            </span>
            {account?.connected && account?.credentialsProvided ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Live Connected
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white">
                <AlertCircle className="w-4 h-4 mr-1" />
                Simulation Mode
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {account ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account</p>
                  <p className="font-bold text-lg">{account.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-bold text-lg">
                    {account.credentialsProvided ? 'Live Trading Enabled' : 'Credentials Required'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(account.balance)}</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Buying Power</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(account.buyingPower)}</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Day Trading Power</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(account.dayTradingBuyingPower)}</p>
                </div>
              </div>

              {account.credentialsProvided && (
                <div className="flex justify-center">
                  <Button 
                    onClick={executeTestTrade}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Execute Test Trade ($100 BTC)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-medium">No Account Data Available</p>
              <p className="text-gray-600 dark:text-gray-400">
                Provide Robinhood credentials to enable live trading
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {portfolio && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(portfolio.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Trading Status</p>
                <Badge className={portfolio.isLive ? "bg-green-500" : "bg-yellow-500"}>
                  {portfolio.isLive ? "Live Trading" : "Simulation"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Last updated: {new Date(portfolio.timestamp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {account?.orders && account.orders.length > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {account.orders.slice(0, 5).map((order, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <span className="font-medium">{order.symbol}</span>
                    <span className={`ml-2 text-sm ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {order.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.price * order.quantity)}</div>
                    <div className="text-xs text-gray-500">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}