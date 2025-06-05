import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Zap, 
  Brain, 
  TrendingUp, 
  Shield, 
  Download,
  Cpu,
  Database,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Command
} from 'lucide-react';

interface InfinityUniformStatus {
  phase: string;
  progress: number;
  subsystems: {
    kaizen: boolean;
    watson: boolean;
    agi: boolean;
    trading: boolean;
    quantum: boolean;
    pdf: boolean;
  };
  operationalPdf: string | null;
  fingerprint: string;
  sessionToken: string;
}

interface AGIInterface {
  cognitiveProcessing: number;
  learningRate: number;
  adaptiveResponse: boolean;
  quantumEnhancement: number;
}

interface TradingModule {
  robinhood: {
    enabled: boolean;
    marginSafeguards: boolean;
    riskLevel: number;
  };
  pionex: {
    enabled: boolean;
    gridBot: boolean;
    leverage: number;
  };
}

export function InfinityUniformPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const queryClient = useQueryClient();

  const { data: status } = useQuery<InfinityUniformStatus>({
    queryKey: ['/api/infinity-uniform/status'],
    refetchInterval: 2000,
    retry: false
  });

  const { data: agiInterface } = useQuery<AGIInterface>({
    queryKey: ['/api/infinity-uniform/agi'],
    retry: false
  });

  const { data: tradingModule } = useQuery<TradingModule>({
    queryKey: ['/api/infinity-uniform/trading'],
    retry: false
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/infinity-uniform/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Initialization failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-uniform/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-uniform/agi'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-uniform/trading'] });
      setIsInitializing(false);
    },
    onError: () => {
      setIsInitializing(false);
    }
  });

  const forceWatsonMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/infinity-uniform/force-watson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Watson force-render failed');
      return response.json();
    }
  });

  const handleInitialize = () => {
    setIsInitializing(true);
    initializeMutation.mutate();
  };

  const handleForceWatson = () => {
    forceWatsonMutation.mutate();
  };

  const handleDownloadPDF = () => {
    if (status?.operationalPdf) {
      window.open(status.operationalPdf, '_blank');
    }
  };

  const getSubsystemIcon = (subsystem: string) => {
    switch (subsystem) {
      case 'kaizen': return Zap;
      case 'watson': return Brain;
      case 'agi': return Cpu;
      case 'trading': return TrendingUp;
      case 'quantum': return Activity;
      case 'pdf': return Download;
      default: return Settings;
    }
  };

  const getSubsystemName = (subsystem: string) => {
    switch (subsystem) {
      case 'kaizen': return 'KaizenGPT Enhancement';
      case 'watson': return 'Watson Core Memory';
      case 'agi': return 'AGI Interface';
      case 'trading': return 'Trading Module';
      case 'quantum': return 'Quantum Sweep';
      case 'pdf': return 'PDF Generator';
      default: return subsystem;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-600" />
          INFINITY UNIFORM Control Center
        </h1>
        {status && (
          <Badge variant={status.progress === 100 ? "default" : "secondary"}>
            {status.phase}
          </Badge>
        )}
      </div>

      {!status?.progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              System Initialization Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Initialize the INFINITY UNIFORM system to enable KaizenGPT enhancements, Watson core memory, 
              AGI interface, trading capabilities, and quantum processing.
            </p>
            <Button 
              onClick={handleInitialize}
              disabled={isInitializing || initializeMutation.isPending}
              className="w-full"
            >
              {isInitializing ? 'Initializing...' : 'Initialize INFINITY UNIFORM'}
            </Button>
          </CardContent>
        </Card>
      )}

      {status && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Initialization Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{status.phase}</span>
                  <span>{status.progress}%</span>
                </div>
                <Progress value={status.progress} className="w-full" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(status.subsystems).map(([key, enabled]) => {
                  const Icon = getSubsystemIcon(key);
                  return (
                    <div 
                      key={key}
                      className={`p-3 rounded-lg border ${
                        enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${enabled ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${enabled ? 'text-green-900' : 'text-gray-500'}`}>
                          {getSubsystemName(key)}
                        </span>
                      </div>
                      {enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              {status.progress === 100 && (
                <div className="flex gap-2">
                  <Button onClick={handleDownloadPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Operational PDF
                  </Button>
                  <Button onClick={handleForceWatson} variant="outline">
                    <Command className="w-4 h-4 mr-2" />
                    Force-Render Watson
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="agi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="agi">AGI Interface</TabsTrigger>
              <TabsTrigger value="trading">Trading Module</TabsTrigger>
              <TabsTrigger value="system">System Info</TabsTrigger>
            </TabsList>

            <TabsContent value="agi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Advanced General Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agiInterface ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Cognitive Processing</span>
                          <span className="text-sm">{agiInterface.cognitiveProcessing}%</span>
                        </div>
                        <Progress value={agiInterface.cognitiveProcessing} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Learning Rate</span>
                          <span className="text-sm">{agiInterface.learningRate}%</span>
                        </div>
                        <Progress value={agiInterface.learningRate} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Quantum Enhancement</span>
                          <span className="text-sm">{agiInterface.quantumEnhancement}%</span>
                        </div>
                        <Progress value={agiInterface.quantumEnhancement} />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Adaptive Response</span>
                        <Badge variant={agiInterface.adaptiveResponse ? "default" : "secondary"}>
                          {agiInterface.adaptiveResponse ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">AGI interface not initialized</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Robinhood Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tradingModule ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status</span>
                          <Badge variant={tradingModule.robinhood.enabled ? "default" : "secondary"}>
                            {tradingModule.robinhood.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Margin Safeguards</span>
                          <Badge variant={tradingModule.robinhood.marginSafeguards ? "default" : "destructive"}>
                            {tradingModule.robinhood.marginSafeguards ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Risk Level</span>
                          <span className="text-sm">{(tradingModule.robinhood.riskLevel * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Trading module not initialized</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Pionex Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tradingModule ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status</span>
                          <Badge variant={tradingModule.pionex.enabled ? "default" : "secondary"}>
                            {tradingModule.pionex.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Grid Bot</span>
                          <Badge variant={tradingModule.pionex.gridBot ? "default" : "secondary"}>
                            {tradingModule.pionex.gridBot ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Leverage</span>
                          <span className="text-sm">{tradingModule.pionex.leverage}x</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Trading module not initialized</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {status && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Session Fingerprint</span>
                          <p className="text-xs font-mono text-muted-foreground">{status.fingerprint}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Session Token</span>
                          <p className="text-xs font-mono text-muted-foreground">{status.sessionToken.slice(-12)}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Operational PDF</span>
                        <p className="text-xs text-muted-foreground">
                          {status.operationalPdf ? 'Available for download' : 'Not generated'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}