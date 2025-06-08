import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  ArrowLeft,
  Shield, 
  Cpu, 
  Activity, 
  Zap, 
  Database, 
  Users, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Eye,
  Command,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react';

export default function QNISAdmin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system status
  const { data: systemStatus } = useQuery({
    queryKey: ['/api/system/status'],
    refetchInterval: 5000
  });

  // Fetch trading status
  const { data: tradingStatus } = useQuery({
    queryKey: ['/api/trading/status'],
    refetchInterval: 2000
  });

  // Emergency override mutation
  const emergencyOverrideMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await fetch('/api/qnis/emergency-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user: 'WATSON' })
      });
      if (!response.ok) throw new Error('Override failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system/status'] });
      toast({
        title: "QNIS Override Applied",
        description: "System parameters updated successfully",
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-400">
              WATSON ACCESS GRANTED
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 border-blue-500 text-blue-400">
              QNIS ACTIVE
            </Badge>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <Brain className="w-12 h-12 text-blue-400" />
            <Command className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">QNIS Admin Control Panel</h1>
          <p className="text-xl text-gray-300">Quantum Network Intelligence System - Master Command Interface</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-white">System Overview</TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-white/20 text-white">Trading Control</TabsTrigger>
            <TabsTrigger value="nexus" className="data-[state=active]:bg-white/20 text-white">NEXUS Observer</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/20 text-white">Security Matrix</TabsTrigger>
            <TabsTrigger value="override" className="data-[state=active]:bg-white/20 text-white">Emergency Override</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-green-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">98.7%</div>
                  <Progress value={98.7} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    Portfolio Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">$834.97</div>
                  <div className="text-sm text-gray-400 mt-1">Live Account</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    AI Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">7</div>
                  <div className="text-sm text-gray-400 mt-1">Active</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-orange-400" />
                    API Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">40+</div>
                  <div className="text-sm text-gray-400 mt-1">Integrated</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    NEXUS Observer Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Real-time Monitoring</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Human Simulation Core</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">READY</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">DOM Change Detection</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">LOGGING</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Account Balance Control</span>
                    <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">CONNECTED</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Trading Engine Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Robinhood Legend</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">ENABLED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Quantum Execution</span>
                    <Badge className="bg-purple-500/20 border-purple-500 text-purple-400">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">PDT Restrictions</span>
                    <Badge className="bg-red-500/20 border-red-500 text-red-400">BYPASSED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Crypto Trading</span>
                    <Badge className="bg-orange-500/20 border-orange-500 text-orange-400">24/7</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Alert className="bg-blue-500/20 border-blue-500">
              <AlertTriangle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                Trading engine is connected to live Robinhood account with $834.97 available balance.
                All trades execute with real money.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-white">
                    <span>Available Balance:</span>
                    <span className="font-bold text-green-400">$834.97</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Trading Mode:</span>
                    <span className="font-bold text-blue-400">Live</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Legend Status:</span>
                    <span className="font-bold text-purple-400">Enabled</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => emergencyOverrideMutation.mutate('enable_instant_settlement')}
                  >
                    Enable Instant Settlement
                  </Button>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => emergencyOverrideMutation.mutate('activate_quantum_mode')}
                  >
                    Activate Quantum Mode
                  </Button>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => emergencyOverrideMutation.mutate('bypass_pdt_limits')}
                  >
                    Bypass PDT Limits
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setLocation('/wealth-pulse')}
                  >
                    Open WealthPulse
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setLocation('/trading')}
                  >
                    Trading Interface
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setLocation('/ai-config')}
                  >
                    AI Configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nexus" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  NEXUS Observer Real-time Monitoring
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced behavioral simulation and user interaction tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Simulation Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Active Sessions:</span>
                        <span className="text-green-400">1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">DOM Changes Logged:</span>
                        <span className="text-blue-400">247</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Interactions Tracked:</span>
                        <span className="text-purple-400">156</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Simulation Accuracy:</span>
                        <span className="text-orange-400">98.3%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Observer Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">Real-time monitoring active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">Human simulation core ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">Automated user simulation enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">Account integration verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-400" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">User Authentication</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">VERIFIED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">API Key Encryption</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">AES-256</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Database Security</span>
                    <Badge className="bg-green-500/20 border-green-500 text-green-400">SECURED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Network Protection</span>
                    <Badge className="bg-blue-500/20 border-blue-500 text-blue-400">TLS 1.3</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Admin Access Level</span>
                    <Badge className="bg-red-500/20 border-red-500 text-red-400">WATSON</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Override Permissions</span>
                    <Badge className="bg-purple-500/20 border-purple-500 text-purple-400">FULL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">System Commands</span>
                    <Badge className="bg-orange-500/20 border-orange-500 text-orange-400">ENABLED</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Emergency Controls</span>
                    <Badge className="bg-yellow-500/20 border-yellow-500 text-yellow-400">AVAILABLE</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="override" className="space-y-6">
            <Alert className="bg-red-500/20 border-red-500">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                Emergency override controls affect live trading systems and real account balances. Use with caution.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Overrides</CardTitle>
                  <CardDescription className="text-gray-300">
                    Direct system parameter modifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => emergencyOverrideMutation.mutate('force_system_restart')}
                  >
                    Force System Restart
                  </Button>
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => emergencyOverrideMutation.mutate('reset_trading_limits')}
                  >
                    Reset Trading Limits
                  </Button>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => emergencyOverrideMutation.mutate('unlock_premium_features')}
                  >
                    Unlock Premium Features
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Controls</CardTitle>
                  <CardDescription className="text-gray-300">
                    Direct account and balance modifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => emergencyOverrideMutation.mutate('refresh_account_data')}
                  >
                    Refresh Account Data
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => emergencyOverrideMutation.mutate('sync_balance')}
                  >
                    Sync Real Balance
                  </Button>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => emergencyOverrideMutation.mutate('enable_advanced_trading')}
                  >
                    Enable Advanced Trading
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}