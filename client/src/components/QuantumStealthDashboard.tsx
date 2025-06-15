import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  Wallet, 
  Send, 
  RefreshCw, 
  Activity, 
  TrendingUp, 
  Zap, 
  Eye,
  Database,
  Lock
} from 'lucide-react';

interface StealthMetrics {
  stealthMode: boolean;
  proxiesActive: number;
  apiCallCount: number;
  lastRotation: string;
  bypassSuccess: boolean;
  quantumEnhancement: boolean;
  cdpWallets: number;
  sdkStatus: string;
}

export function QuantumStealthDashboard() {
  const [transferData, setTransferData] = useState({
    walletId: '',
    destinationAddress: '',
    amount: '',
    assetId: 'ETH'
  });

  const queryClient = useQueryClient();

  // Fetch stealth metrics
  const { data: stealthMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/stealth/metrics'],
    refetchInterval: 10000
  });

  // Create stealth wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: () => apiRequest('/api/wallet/create-stealth', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stealth/metrics'] });
    }
  });

  // Execute stealth transfer mutation
  const transferMutation = useMutation({
    mutationFn: () => apiRequest('/api/wallet/stealth-transfer', { 
      method: 'POST',
      body: JSON.stringify(transferData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/positions'] });
      setTransferData({ walletId: '', destinationAddress: '', amount: '', assetId: 'ETH' });
    }
  });

  // Execute stealth trade mutation
  const stealthTradeMutation = useMutation({
    mutationFn: (tradeData: any) => apiRequest('/api/trading/stealth-execute', { 
      method: 'POST',
      body: JSON.stringify(tradeData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading/positions'] });
    }
  });

  const metrics = stealthMetrics as StealthMetrics;

  return (
    <div className="space-y-6">
      {/* Stealth Status Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Quantum Stealth Crypto Engine
            <Badge variant="outline" className="ml-auto">
              {metrics?.stealthMode ? 'ACTIVE' : 'STANDBY'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Eye className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <div className="text-sm font-medium">Proxies Active</div>
              <div className="text-lg font-bold">{metrics?.proxiesActive || 0}</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Activity className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <div className="text-sm font-medium">API Calls</div>
              <div className="text-lg font-bold">{metrics?.apiCallCount || 0}</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Wallet className="h-4 w-4 mx-auto mb-1 text-purple-600" />
              <div className="text-sm font-medium">CDP Wallets</div>
              <div className="text-lg font-bold">{metrics?.cdpWallets || 0}</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Database className="h-4 w-4 mx-auto mb-1 text-orange-600" />
              <div className="text-sm font-medium">SDK Status</div>
              <div className="text-xs font-bold uppercase">{metrics?.sdkStatus || 'SIM'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stealth Wallet Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Stealth Wallet Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => createWalletMutation.mutate()}
              disabled={createWalletMutation.isPending}
              className="w-full"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {createWalletMutation.isPending ? 'Creating...' : 'Create Stealth Wallet'}
            </Button>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Stealth Transfer</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Wallet ID"
                  value={transferData.walletId}
                  onChange={(e) => setTransferData(prev => ({ ...prev, walletId: e.target.value }))}
                />
                <Input
                  placeholder="Destination Address"
                  value={transferData.destinationAddress}
                  onChange={(e) => setTransferData(prev => ({ ...prev, destinationAddress: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Amount"
                    value={transferData.amount}
                    onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                  <Input
                    placeholder="Asset"
                    value={transferData.assetId}
                    onChange={(e) => setTransferData(prev => ({ ...prev, assetId: e.target.value }))}
                    className="w-20"
                  />
                </div>
                <Button 
                  onClick={() => transferMutation.mutate()}
                  disabled={transferMutation.isPending || !transferData.walletId || !transferData.destinationAddress}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {transferMutation.isPending ? 'Executing...' : 'Execute Stealth Transfer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stealth Trading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Stealth Trading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => stealthTradeMutation.mutate({
                  symbol: 'BTC',
                  side: 'buy',
                  amount: 100,
                  platform: 'coinbase'
                })}
                disabled={stealthTradeMutation.isPending}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Buy BTC
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => stealthTradeMutation.mutate({
                  symbol: 'ETH',
                  side: 'buy',
                  amount: 100,
                  platform: 'coinbase'
                })}
                disabled={stealthTradeMutation.isPending}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Buy ETH
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => stealthTradeMutation.mutate({
                  symbol: 'SOL',
                  side: 'buy',
                  amount: 50,
                  platform: 'coinbase'
                })}
                disabled={stealthTradeMutation.isPending}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Buy SOL
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => stealthTradeMutation.mutate({
                  symbol: 'DOGE',
                  side: 'buy',
                  amount: 25,
                  platform: 'coinbase'
                })}
                disabled={stealthTradeMutation.isPending}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Buy DOGE
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Stealth trades bypass API limitations and execute undetected
            </div>
            
            {metrics?.bypassSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Quantum Bypass Active</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stealth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Stealth Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">LAST ROTATION</Label>
              <div className="font-mono">
                {metrics?.lastRotation ? new Date(metrics.lastRotation).toLocaleTimeString() : '--:--:--'}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">QUANTUM ENHANCEMENT</Label>
              <div className="font-mono">
                {metrics?.quantumEnhancement ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">BYPASS SUCCESS</Label>
              <div className="font-mono">
                {metrics?.bypassSuccess ? '100%' : '0%'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}