
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Key, Plus, Eye, EyeOff, Edit, Trash2, Shield, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  id: string;
  service: string;
  keyName: string;
  keyValue: string;
  status: 'active' | 'inactive' | 'expired' | 'rate_limited';
  usageCount: number;
  lastUsed: string;
  environment: 'development' | 'production' | 'testing';
  description: string;
}

interface APIService {
  name: string;
  icon: string;
  category: 'ai' | 'trading' | 'data' | 'communication' | 'utility';
  description: string;
  setupInstructions: string;
  requiredKeys: string[];
}

const API_SERVICES: APIService[] = [
  {
    name: 'OpenAI',
    icon: '🤖',
    category: 'ai',
    description: 'GPT models for AI-powered features',
    setupInstructions: 'Get your API key from platform.openai.com',
    requiredKeys: ['OPENAI_API_KEY']
  },
  {
    name: 'Alpaca',
    icon: '📈',
    category: 'trading',
    description: 'Stock and crypto trading API',
    setupInstructions: 'Register at alpaca.markets and generate API keys',
    requiredKeys: ['ALPACA_API_KEY', 'ALPACA_SECRET_KEY']
  },
  {
    name: 'Coinbase',
    icon: '₿',
    category: 'trading',
    description: 'Cryptocurrency trading and wallet API',
    setupInstructions: 'Create API keys in Coinbase Pro settings',
    requiredKeys: ['COINBASE_API_KEY', 'COINBASE_API_SECRET']
  },
  {
    name: 'Perplexity',
    icon: '🔍',
    category: 'ai',
    description: 'Real-time search and information retrieval',
    setupInstructions: 'Get API access from perplexity.ai',
    requiredKeys: ['PERPLEXITY_API_KEY']
  },
  {
    name: 'Anthropic',
    icon: '⚡',
    category: 'ai',
    description: 'Claude AI models for advanced reasoning',
    setupInstructions: 'Register at console.anthropic.com',
    requiredKeys: ['ANTHROPIC_API_KEY']
  },
  {
    name: 'xAI',
    icon: '🚀',
    category: 'ai',
    description: 'Grok models for enhanced AI capabilities',
    setupInstructions: 'Get access from x.ai platform',
    requiredKeys: ['XAI_API_KEY']
  }
];

export default function APIVault() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showValues, setShowValues] = useState<{[key: string]: boolean}>({});
  const [selectedService, setSelectedService] = useState<APIService | null>(null);
  const [newKey, setNewKey] = useState({ name: '', value: '', environment: 'development', description: '' });
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/vault/keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const addAPIKey = async () => {
    if (!selectedService || !newKey.name || !newKey.value) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/vault/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService.name,
          keyName: newKey.name,
          keyValue: newKey.value,
          environment: newKey.environment,
          description: newKey.description
        })
      });

      if (response.ok) {
        await fetchAPIKeys();
        setIsAddingKey(false);
        setNewKey({ name: '', value: '', environment: 'development', description: '' });
        setSelectedService(null);
        toast({
          title: "API Key Added",
          description: `${selectedService.name} API key has been securely stored.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add API key. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/vault/keys/${keyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAPIKeys();
        toast({
          title: "API Key Deleted",
          description: "The API key has been removed from the vault.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'rate_limited': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredServices = API_SERVICES.filter(service => 
    (categoryFilter === 'all' || service.category === categoryFilter) &&
    service.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredKeys = apiKeys.filter(key =>
    (categoryFilter === 'all' || API_SERVICES.find(s => s.name === key.service)?.category === categoryFilter) &&
    (key.service.toLowerCase().includes(searchFilter.toLowerCase()) || 
     key.keyName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            API Vault
          </CardTitle>
          <CardDescription>
            Securely manage API keys for all integrated services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search services or keys..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="ai">AI Services</option>
              <option value="trading">Trading APIs</option>
              <option value="data">Data Sources</option>
              <option value="communication">Communication</option>
              <option value="utility">Utilities</option>
            </select>
            <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New API Key</DialogTitle>
                  <DialogDescription>
                    Select a service and configure your API credentials
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="select" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="select">Select Service</TabsTrigger>
                    <TabsTrigger value="configure" disabled={!selectedService}>Configure</TabsTrigger>
                  </TabsList>
                  <TabsContent value="select" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {filteredServices.map((service) => (
                        <Card 
                          key={service.name}
                          className={`cursor-pointer transition-colors ${
                            selectedService?.name === service.name ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{service.icon}</span>
                              <div>
                                <h3 className="font-medium">{service.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {service.category}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="configure" className="space-y-4">
                    {selectedService && (
                      <>
                        <Alert>
                          <AlertDescription>
                            <strong>Setup Instructions:</strong> {selectedService.setupInstructions}
                          </AlertDescription>
                        </Alert>
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="keyName">Key Name</Label>
                            <Input
                              id="keyName"
                              placeholder={selectedService.requiredKeys[0]}
                              value={newKey.name}
                              onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="keyValue">API Key Value</Label>
                            <Input
                              id="keyValue"
                              type="password"
                              placeholder="Enter your API key..."
                              value={newKey.value}
                              onChange={(e) => setNewKey({...newKey, value: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="environment">Environment</Label>
                            <select
                              id="environment"
                              className="w-full px-3 py-2 border rounded-md"
                              value={newKey.environment}
                              onChange={(e) => setNewKey({...newKey, environment: e.target.value as any})}
                            >
                              <option value="development">Development</option>
                              <option value="production">Production</option>
                              <option value="testing">Testing</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                              id="description"
                              placeholder="Purpose or notes about this key..."
                              value={newKey.description}
                              onChange={(e) => setNewKey({...newKey, description: e.target.value})}
                            />
                          </div>
                          <Button onClick={addAPIKey} className="w-full">
                            Add API Key
                          </Button>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No API keys found. Add your first API key to get started.</p>
              </div>
            ) : (
              filteredKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {API_SERVICES.find(s => s.name === key.service)?.icon || '🔑'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{key.service}</h3>
                            {getStatusIcon(key.status)}
                            <Badge variant={key.environment === 'production' ? 'default' : 'secondary'}>
                              {key.environment}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{key.keyName}</p>
                          {key.description && (
                            <p className="text-xs text-gray-500 mt-1">{key.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-500">
                          <p>Used {key.usageCount} times</p>
                          <p>Last: {key.lastUsed}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowValues({...showValues, [key.id]: !showValues[key.id]})}
                          >
                            {showValues[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.keyValue)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAPIKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {showValues[key.id] && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <code className="text-sm break-all">{key.keyValue}</code>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
