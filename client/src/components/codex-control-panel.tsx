import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Send,
  Brain
} from 'lucide-react';

interface CodexStatus {
  isActive: boolean;
  lastUsed?: string;
  capabilities?: string[];
}

export function CodexControlPanel() {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [message, setMessage] = useState('');
  const [marketSymbol, setMarketSymbol] = useState('AAPL');
  
  const queryClient = useQueryClient();

  // Get Codex status
  const { data: codexStatus } = useQuery<CodexStatus>({
    queryKey: ['/api/codex/status'],
    refetchInterval: 30000
  });

  // Authentication mutation
  const authenticateCodex = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('/api/codex/authenticate', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/codex/status'] });
      setAuthEmail('');
      setAuthPassword('');
    }
  });

  // Onboarding mutation
  const executeOnboarding = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/codex/onboarding', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/codex/status'] });
    }
  });

  // Message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest('/api/codex/message', {
        method: 'POST',
        body: JSON.stringify({ message: messageText })
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage('');
    }
  });

  // Market analysis mutation
  const analyzeMarket = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await apiRequest('/api/codex/market-analysis', {
        method: 'POST',
        body: JSON.stringify({ symbol, timeframe: '1D' })
      });
      return response.json();
    }
  });

  const handleAuthenticate = () => {
    if (authEmail && authPassword) {
      authenticateCodex.mutate({ email: authEmail, password: authPassword });
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  const handleMarketAnalysis = () => {
    if (marketSymbol) {
      analyzeMarket.mutate(marketSymbol);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-lg text-white">ChatGPT Codex Integration</CardTitle>
            <Badge variant={codexStatus?.isActive ? "default" : "secondary"} className="text-xs">
              {codexStatus?.isActive ? 'CONNECTED' : 'DISCONNECTED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Authentication Section */}
          {!codexStatus?.isActive && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 font-medium">ChatGPT Authentication</div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white text-xs"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAuthenticate}
                  disabled={authenticateCodex.isPending || !authEmail || !authPassword}
                  className="flex-1 text-xs"
                >
                  <Key className="w-3 h-3 mr-1" />
                  {authenticateCodex.isPending ? 'Authenticating...' : 'Connect'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => executeOnboarding.mutate()}
                  disabled={executeOnboarding.isPending}
                  className="text-xs"
                >
                  {executeOnboarding.isPending ? 'Starting...' : 'Onboard'}
                </Button>
              </div>
            </div>
          )}

          {/* Status Display */}
          {codexStatus?.isActive && (
            <Alert className="bg-green-900/20 border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-300 text-xs">
                Codex integration active. Capabilities: {codexStatus.capabilities?.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Message Interface */}
          {codexStatus?.isActive && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 font-medium">Send Message to Codex</div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask Codex about code generation, API integration, or automation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white text-xs resize-none h-20"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={sendMessage.isPending || !message.trim()}
                  className="self-end"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
              
              {sendMessage.data && (
                <Alert className="bg-blue-900/20 border-blue-500/30">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <AlertDescription className="text-blue-300 text-xs">
                    <strong>Codex:</strong> {sendMessage.data.response}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Market Analysis */}
          {codexStatus?.isActive && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 font-medium">AI Market Analysis</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Symbol (e.g., AAPL, TSLA)"
                  value={marketSymbol}
                  onChange={(e) => setMarketSymbol(e.target.value.toUpperCase())}
                  className="bg-gray-800/50 border-gray-600 text-white text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleMarketAnalysis}
                  disabled={analyzeMarket.isPending || !marketSymbol}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {analyzeMarket.isPending ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
              
              {analyzeMarket.data && (
                <Alert className="bg-yellow-900/20 border-yellow-500/30">
                  <Brain className="w-4 h-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300 text-xs">
                    <strong>{analyzeMarket.data.symbol} Analysis:</strong><br />
                    {analyzeMarket.data.analysis}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Error Display */}
          {(authenticateCodex.error || sendMessage.error || analyzeMarket.error) && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300 text-xs">
                {authenticateCodex.error?.message || 
                 sendMessage.error?.message || 
                 analyzeMarket.error?.message}
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>
    </div>
  );
}