import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Key, Github, Zap, Settings, CheckCircle, AlertCircle, Bot, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function AIConfiguration() {
  const [githubToken, setGithubToken] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [xaiKey, setXaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [cohereKey, setCohereKey] = useState('');
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [showOpenAIDialog, setShowOpenAIDialog] = useState(false);
  const [showAnthropicDialog, setShowAnthropicDialog] = useState(false);
  const [showPerplexityDialog, setShowPerplexityDialog] = useState(false);
  const [showXaiDialog, setShowXaiDialog] = useState(false);
  const [showGeminiDialog, setShowGeminiDialog] = useState(false);
  const [showCohereDialog, setShowCohereDialog] = useState(false);

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch AI configuration status
  const { data: aiStatus } = useQuery({
    queryKey: ['/api/ai/status'],
    refetchInterval: 10000
  });

  // GitHub integration mutation
  const configureGithubMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/ai/configure/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubToken: token })
      });
      if (!response.ok) throw new Error('Failed to configure GitHub');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
      setShowGithubDialog(false);
      setGithubToken('');
      toast({
        title: "GitHub Configured",
        description: "AI brain enhanced with GitHub code intelligence capabilities.",
      });
    },
    onError: () => {
      toast({
        title: "Configuration Failed",
        description: "Failed to configure GitHub integration.",
        variant: "destructive",
      });
    }
  });

  // OpenAI integration mutation
  const configureOpenAIMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/ai/configure/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openaiKey: key })
      });
      if (!response.ok) throw new Error('Failed to configure OpenAI');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
      setShowOpenAIDialog(false);
      setOpenaiKey('');
      toast({
        title: "OpenAI Configured",
        description: "Advanced language models integrated successfully.",
      });
    }
  });

  // Anthropic integration mutation
  const configureAnthropicMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/ai/configure/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anthropicKey: key })
      });
      if (!response.ok) throw new Error('Failed to configure Anthropic');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
      setShowAnthropicDialog(false);
      setAnthropicKey('');
      toast({
        title: "Anthropic Configured",
        description: "Claude AI models integrated successfully.",
      });
    }
  });

  // Perplexity integration mutation
  const configurePerplexityMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/ai/configure/perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perplexityKey: key })
      });
      if (!response.ok) throw new Error('Failed to configure Perplexity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
      setShowPerplexityDialog(false);
      setPerplexityKey('');
      toast({
        title: "Perplexity Configured",
        description: "Real-time search intelligence integrated.",
      });
    }
  });

  // xAI (Grok) integration mutation
  const configureXaiMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/ai/configure/xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xaiKey: key })
      });
      if (!response.ok) throw new Error('Failed to configure xAI');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
      setShowXaiDialog(false);
      setXaiKey('');
      toast({
        title: "xAI Grok Configured",
        description: "Advanced Grok models integrated successfully.",
      });
    }
  });

  // Google Gemini integration mutation
  const configureGeminiMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/ai/configure/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiKey: key })
      });
      if (!response.ok) throw new Error('Failed to configure Gemini');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
      setShowGeminiDialog(false);
      setGeminiKey('');
      toast({
        title: "Google Gemini Configured",
        description: "Gemini Pro models integrated successfully.",
      });
    }
  });

  const handleGithubSubmit = () => {
    if (!githubToken.trim()) return;
    configureGithubMutation.mutate(githubToken);
  };

  const handleOpenAISubmit = () => {
    if (!openaiKey.trim()) return;
    configureOpenAIMutation.mutate(openaiKey);
  };

  const handleAnthropicSubmit = () => {
    if (!anthropicKey.trim()) return;
    configureAnthropicMutation.mutate(anthropicKey);
  };

  const handlePerplexitySubmit = () => {
    if (!perplexityKey.trim()) return;
    configurePerplexityMutation.mutate(perplexityKey);
  };

  const handleXaiSubmit = () => {
    if (!xaiKey.trim()) return;
    configureXaiMutation.mutate(xaiKey);
  };

  const handleGeminiSubmit = () => {
    if (!geminiKey.trim()) return;
    configureGeminiMutation.mutate(geminiKey);
  };

  const handleCohereSubmit = () => {
    if (!cohereKey.trim()) return;
    // Add mutation call when backend is ready
    toast({
      title: "Coming Soon",
      description: "Cohere integration will be available soon.",
    });
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Brain Configuration</h1>
            <p className="text-gray-600">Enhance PTNI capabilities with advanced AI integrations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation('/dashboard')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setLocation('/qnis-admin')} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none hover:from-purple-700 hover:to-blue-700">
              <Settings className="w-4 h-4" />
              QNIS Admin
            </Button>
          </div>
        </div>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">AI Integrations</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GitHub Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Github className="w-5 h-5 mr-2" />
                    GitHub Integration
                    {getStatusIcon(aiStatus?.github?.connected)}
                  </CardTitle>
                  <CardDescription>
                    Connect GitHub to enhance AI with code intelligence and repository analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Benefits:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Enhanced code understanding</li>
                        <li>Repository analysis capabilities</li>
                        <li>Advanced project insights</li>
                        <li>Code generation improvements</li>
                      </ul>
                    </div>
                    <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Key className="w-4 h-4 mr-2" />
                          Configure GitHub Token
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>GitHub Personal Access Token</DialogTitle>
                          <DialogDescription>
                            Enter your GitHub personal access token to enable enhanced AI capabilities.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="github-token">GitHub Token</Label>
                            <Input
                              id="github-token"
                              type="password"
                              value={githubToken}
                              onChange={(e) => setGithubToken(e.target.value)}
                              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            />
                            <p className="text-xs text-gray-500">
                              Create a token at GitHub Settings → Developer settings → Personal access tokens
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleGithubSubmit} disabled={configureGithubMutation.isPending}>
                            {configureGithubMutation.isPending ? 'Configuring...' : 'Configure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* OpenAI Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    OpenAI Integration
                    {getStatusIcon(aiStatus?.openai?.connected)}
                  </CardTitle>
                  <CardDescription>
                    Connect OpenAI for advanced language model capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Capabilities:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>GPT-4 language processing</li>
                        <li>Code generation and analysis</li>
                        <li>Natural language understanding</li>
                        <li>Advanced reasoning</li>
                      </ul>
                    </div>
                    <Dialog open={showOpenAIDialog} onOpenChange={setShowOpenAIDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Key className="w-4 h-4 mr-2" />
                          Configure OpenAI Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>OpenAI API Key</DialogTitle>
                          <DialogDescription>
                            Enter your OpenAI API key to enable advanced language model features.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="openai-key">API Key</Label>
                            <Input
                              id="openai-key"
                              type="password"
                              value={openaiKey}
                              onChange={(e) => setOpenaiKey(e.target.value)}
                              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleOpenAISubmit} disabled={configureOpenAIMutation.isPending}>
                            {configureOpenAIMutation.isPending ? 'Configuring...' : 'Configure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Anthropic Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Anthropic Claude
                    {getStatusIcon(aiStatus?.anthropic?.connected)}
                  </CardTitle>
                  <CardDescription>
                    Integrate Claude for enhanced reasoning and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Advanced reasoning capabilities</li>
                        <li>Long-form content analysis</li>
                        <li>Ethical AI responses</li>
                        <li>Complex problem solving</li>
                      </ul>
                    </div>
                    <Dialog open={showAnthropicDialog} onOpenChange={setShowAnthropicDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Key className="w-4 h-4 mr-2" />
                          Configure Anthropic Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Anthropic API Key</DialogTitle>
                          <DialogDescription>
                            Enter your Anthropic API key to enable Claude AI features.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="anthropic-key">API Key</Label>
                            <Input
                              id="anthropic-key"
                              type="password"
                              value={anthropicKey}
                              onChange={(e) => setAnthropicKey(e.target.value)}
                              placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAnthropicSubmit} disabled={configureAnthropicMutation.isPending}>
                            {configureAnthropicMutation.isPending ? 'Configuring...' : 'Configure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Perplexity Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Perplexity Search
                    {getStatusIcon(aiStatus?.perplexity?.connected)}
                  </CardTitle>
                  <CardDescription>
                    Real-time search and information retrieval capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Capabilities:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Real-time web search</li>
                        <li>Current information access</li>
                        <li>Research capabilities</li>
                        <li>Fact verification</li>
                      </ul>
                    </div>
                    <Dialog open={showPerplexityDialog} onOpenChange={setShowPerplexityDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Key className="w-4 h-4 mr-2" />
                          Configure Perplexity Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Perplexity API Key</DialogTitle>
                          <DialogDescription>
                            Enter your Perplexity API key to enable real-time search capabilities.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="perplexity-key">API Key</Label>
                            <Input
                              id="perplexity-key"
                              type="password"
                              value={perplexityKey}
                              onChange={(e) => setPerplexityKey(e.target.value)}
                              placeholder="pplx-xxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handlePerplexitySubmit} disabled={configurePerplexityMutation.isPending}>
                            {configurePerplexityMutation.isPending ? 'Configuring...' : 'Configure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* xAI (Grok) Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    xAI Grok Integration
                    {getStatusIcon(aiStatus?.xai?.connected)}
                  </CardTitle>
                  <CardDescription>
                    Connect xAI's Grok models for advanced reasoning and real-time information processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Benefits:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>Advanced reasoning capabilities</li>
                        <li>Real-time web information access</li>
                        <li>Humor and personality</li>
                        <li>Vision and image understanding</li>
                      </ul>
                    </div>
                    <Dialog open={showXaiDialog} onOpenChange={setShowXaiDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Key className="w-4 h-4 mr-2" />
                          Configure xAI API Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>xAI API Key Setup</DialogTitle>
                          <DialogDescription>
                            Get your API key from the xAI console to enable Grok models.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">Setup Instructions:</p>
                              <ol className="text-sm text-blue-800 mt-2 space-y-1">
                                <li>1. Visit x.ai and create an account</li>
                                <li>2. Navigate to API settings</li>
                                <li>3. Generate a new API key</li>
                                <li>4. Copy and paste it below</li>
                              </ol>
                            </div>
                            <Label htmlFor="xai-key">API Key</Label>
                            <Input
                              id="xai-key"
                              type="password"
                              value={xaiKey}
                              onChange={(e) => setXaiKey(e.target.value)}
                              placeholder="xai-xxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleXaiSubmit} disabled={configureXaiMutation.isPending}>
                            {configureXaiMutation.isPending ? 'Configuring...' : 'Configure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Google Gemini Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Google Gemini Integration
                    {getStatusIcon(aiStatus?.gemini?.connected)}
                  </CardTitle>
                  <CardDescription>
                    Connect Google's Gemini Pro models for multimodal AI capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Benefits:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>Multimodal processing (text, images, video)</li>
                        <li>Advanced reasoning and math</li>
                        <li>Code generation and analysis</li>
                        <li>Large context window</li>
                      </ul>
                    </div>
                    <Dialog open={showGeminiDialog} onOpenChange={setShowGeminiDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Key className="w-4 h-4 mr-2" />
                          Configure Gemini API Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Google Gemini API Key Setup</DialogTitle>
                          <DialogDescription>
                            Get your API key from Google AI Studio to enable Gemini models.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-medium text-green-900">Setup Instructions:</p>
                              <ol className="text-sm text-green-800 mt-2 space-y-1">
                                <li>1. Visit aistudio.google.com</li>
                                <li>2. Sign in with your Google account</li>
                                <li>3. Click "Get API key" in the left sidebar</li>
                                <li>4. Create a new API key</li>
                                <li>5. Copy and paste it below</li>
                              </ol>
                            </div>
                            <Label htmlFor="gemini-key">API Key</Label>
                            <Input
                              id="gemini-key"
                              type="password"
                              value={geminiKey}
                              onChange={(e) => setGeminiKey(e.target.value)}
                              placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleGeminiSubmit} disabled={configureGeminiMutation.isPending}>
                            {configureGeminiMutation.isPending ? 'Configuring...' : 'Configure'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Free Public APIs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Free Public APIs
                    <Badge variant="default" className="ml-2">No Auth Required</Badge>
                  </CardTitle>
                  <CardDescription>
                    Enhance AI capabilities with free public data sources and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {/* Weather API */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">OpenWeatherMap API</h4>
                            <p className="text-sm text-gray-600">Global weather data and forecasts</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                      
                      {/* News API */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">News API</h4>
                            <p className="text-sm text-gray-600">Real-time news and headlines</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>

                      {/* REST Countries */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">REST Countries</h4>
                            <p className="text-sm text-gray-600">Country information and demographics</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>

                      {/* JSONPlaceholder */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Wikipedia API</h4>
                            <p className="text-sm text-gray-600">Knowledge base and research data</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>

                      {/* Currency Exchange */}
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Exchange Rates API</h4>
                            <p className="text-sm text-gray-600">Real-time currency conversion</p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Configure Public APIs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Cohere Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Cohere Integration
                    <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                  </CardTitle>
                  <CardDescription>
                    Enterprise-grade language models for business applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Planned Features:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>Enterprise-focused language models</li>
                        <li>Advanced text classification</li>
                        <li>Semantic search capabilities</li>
                        <li>Content generation</li>
                      </ul>
                    </div>
                    <Dialog open={showCohereDialog} onOpenChange={setShowCohereDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline" disabled>
                          <Key className="w-4 h-4 mr-2" />
                          Coming Soon
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI System Status</CardTitle>
                <CardDescription>Real-time status of all AI integrations and capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiStatus ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Github className="w-5 h-5 mr-2" />
                          <span>GitHub Integration</span>
                        </div>
                        <Badge variant={aiStatus.github?.connected ? "default" : "secondary"}>
                          {aiStatus.github?.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          <span>OpenAI GPT-4</span>
                        </div>
                        <Badge variant={aiStatus.openai?.connected ? "default" : "secondary"}>
                          {aiStatus.openai?.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          <span>Anthropic Claude</span>
                        </div>
                        <Badge variant={aiStatus.anthropic?.connected ? "default" : "secondary"}>
                          {aiStatus.anthropic?.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          <span>Perplexity Search</span>
                        </div>
                        <Badge variant={aiStatus.perplexity?.connected ? "default" : "secondary"}>
                          {aiStatus.perplexity?.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading AI system status...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced AI Settings</CardTitle>
                <CardDescription>Configure advanced AI behavior and performance settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Enhanced Processing</h3>
                    <p className="text-blue-800 text-sm">
                      All configured AI services are automatically integrated into the PTNI quantum processing pipeline 
                      for enhanced family management, trading analysis, and task optimization.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Security</h3>
                    <p className="text-green-800 text-sm">
                      All API keys are encrypted and stored securely. They are only used for authorized 
                      AI processing within your family platform environment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}