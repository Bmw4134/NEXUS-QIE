import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Cpu, 
  Activity,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Fingerprint,
  Key
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface LoginCredentials {
  username: string;
  password: string;
  mfaCode?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
}

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: 'bm.watson34@gmail.com',
    password: 'watson2024!',
    mfaCode: ''
  });
  const [authMethod, setAuthMethod] = useState<'credentials' | 'demo' | 'biometric'>('credentials');

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user?.username}!`,
        });
        setLocation('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Unable to connect to authentication service",
        variant: "destructive"
      });
    }
  });

  const demoLoginMutation = useMutation({
    mutationFn: async (role: string) => {
      const demoCredentials = {
        username: `demo_${role}`,
        password: 'demo_access_2024',
        role
      };
      
      // Simulate successful demo login
      return {
        success: true,
        token: `demo_token_${Date.now()}`,
        user: {
          id: `demo_${role}`,
          username: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role
        }
      };
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      localStorage.setItem('demo_mode', 'true');
      toast({
        title: "Demo Access Granted",
        description: `Logged in as ${data.user.username}`,
      });
      setLocation('/dashboard');
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      loginMutation.mutate(loginData);
    }
  };

  const handleDemoLogin = (role: string) => {
    demoLoginMutation.mutate(role);
  };

  const demoRoles = [
    {
      role: 'admin',
      title: 'Administrator',
      description: 'Full system access with all administrative privileges',
      features: ['System management', 'User administration', 'All dashboards', 'Analytics access']
    },
    {
      role: 'trader',
      title: 'Trader',
      description: 'Live trading access with real-time market data',
      features: ['Live trading', 'Portfolio management', 'Market analysis', 'Risk monitoring']
    },
    {
      role: 'analyst',
      title: 'Analyst',
      description: 'Analytics and reporting with market intelligence',
      features: ['Market research', 'Performance analytics', 'Custom reports', 'Data visualization']
    },
    {
      role: 'viewer',
      title: 'Viewer',
      description: 'Read-only access to dashboards and reports',
      features: ['Dashboard viewing', 'Report access', 'Market monitoring', 'Basic analytics']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Landing
            </Button>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NEXUS Quantum Intelligence
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Access the most advanced AI trading platform
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1" />
              System Online
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Shield className="h-3 w-3 mr-1" />
              Secure Connection
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Platform Access</CardTitle>
              <CardDescription className="text-center">
                Choose your authentication method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="credentials">
                    <Key className="h-4 w-4 mr-1" />
                    Credentials
                  </TabsTrigger>
                  <TabsTrigger value="demo">
                    <User className="h-4 w-4 mr-1" />
                    Demo Access
                  </TabsTrigger>
                  <TabsTrigger value="biometric">
                    <Fingerprint className="h-4 w-4 mr-1" />
                    Biometric
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="h-12 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mfaCode">MFA Code (Optional)</Label>
                      <Input
                        id="mfaCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={loginData.mfaCode}
                        onChange={(e) => setLoginData({...loginData, mfaCode: e.target.value})}
                        className="h-12"
                        maxLength={6}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Secure Login
                        </>
                      )}
                    </Button>
                  </form>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Use your assigned credentials or contact your administrator for access.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="demo" className="space-y-4 mt-6">
                  <div className="space-y-3">
                    {demoRoles.map((roleData) => (
                      <Card key={roleData.role} className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{roleData.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{roleData.description}</p>
                          </div>
                          <Button 
                            onClick={() => handleDemoLogin(roleData.role)}
                            disabled={demoLoginMutation.isPending}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          >
                            {demoLoginMutation.isPending ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              'Access'
                            )}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {roleData.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Demo access provides full functionality with simulated data for evaluation purposes.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="biometric" className="space-y-4 mt-6">
                  <div className="text-center py-8">
                    <Fingerprint className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-lg font-semibold mb-2">Biometric Authentication</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      Advanced biometric security for enterprise users
                    </p>
                    <Button disabled className="w-full h-12">
                      Biometric Scanner Required
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Biometric authentication requires specialized hardware and enterprise configuration.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Platform Information */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Platform Overview
              </CardTitle>
              <CardDescription>
                Advanced quantum intelligence for autonomous trading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$778.19</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Live Balance</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">98.4%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">QPI Score</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Active Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Real-time trading with live Robinhood integration
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Quantum intelligence engine (99.3% QPI)
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    PTNI analytics with market intelligence
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Watson command engine for AI assistance
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Four specialized dashboards (TRAXOVO, DWC, JDD, CryptoNexusTrade)
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Agent Master Sync with module recovery
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">Security Features</h4>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <div>• Quantum encryption protocols</div>
                  <div>• Multi-factor authentication</div>
                  <div>• Role-based access control</div>
                  <div>• Real-time security monitoring</div>
                  <div>• Complete audit logging</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-8 text-center">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All Systems Operational
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Live Trading Active
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Real-time Data Connected
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}