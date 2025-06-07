import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, AlertCircle, Activity, Globe, Shield } from 'lucide-react';

interface RealModeStatus {
  realModeEnabled: boolean;
  isLoggedIn: boolean;
  accountBalance: number;
  lastActivity: string;
  hasCredentials: boolean;
}

export function RealModeController() {
  const [realModeStatus, setRealModeStatus] = useState<RealModeStatus | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRealModeStatus();
    const interval = setInterval(fetchRealModeStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRealModeStatus = async () => {
    try {
      const response = await fetch('/api/robinhood/real-mode-status');
      if (response.ok) {
        const data = await response.json();
        setRealModeStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch real mode status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRealMode = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      const response = await fetch('/api/robinhood/toggle-real-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchRealModeStatus();
        }
      }
    } catch (error) {
      console.error('Failed to toggle real mode:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const executeRealTrade = async () => {
    try {
      const response = await fetch('/api/robinhood/execute-live-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'AAPL',
          side: 'buy',
          amount: 50,
          useRealMoney: true
        })
      });

      const result = await response.json();
      if (result.success && result.realAccountUpdate) {
        console.log('Live trade executed:', result);
        setTimeout(() => fetchRealModeStatus(), 2000);
      }
    } catch (error) {
      console.error('Live trade execution failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            PTNI Real Trading Mode
          </span>
          {realModeStatus?.realModeEnabled ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Real Mode Active
            </Badge>
          ) : (
            <Badge className="bg-gray-500 text-white">
              <AlertCircle className="w-4 h-4 mr-1" />
              Simulation Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Headless Browser Trading</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable autonomous browser control for real Robinhood trades
            </p>
          </div>
          <Switch
            checked={realModeStatus?.realModeEnabled || false}
            onCheckedChange={toggleRealMode}
            disabled={isToggling || !realModeStatus?.hasCredentials}
          />
        </div>

        {realModeStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Credentials</p>
              <p className="font-bold text-blue-600">
                {realModeStatus.hasCredentials ? 'Provided' : 'Required'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Login Status</p>
              <p className="font-bold text-green-600">
                {realModeStatus.isLoggedIn ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Account Balance</p>
              <p className="font-bold text-purple-600">
                ${realModeStatus.accountBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {realModeStatus?.realModeEnabled && realModeStatus?.isLoggedIn && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Real Trading Enabled
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Headless browser is connected to your Robinhood account. 
                Trades will affect your actual balance.
              </p>
              <Button 
                onClick={executeRealTrade}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Execute Test Trade ($50 AAPL)
              </Button>
            </div>
          </div>
        )}

        {!realModeStatus?.hasCredentials && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Credentials Required
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Set ROBINHOOD_USERNAME, ROBINHOOD_PASSWORD, and ROBINHOOD_MFA_CODE 
              environment variables to enable real trading mode.
            </p>
          </div>
        )}

        {realModeStatus?.lastActivity && (
          <div className="text-xs text-gray-500">
            Last activity: {new Date(realModeStatus.lastActivity).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}