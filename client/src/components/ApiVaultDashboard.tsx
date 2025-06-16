
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface ApiCredential {
  id: string;
  service: string;
  status: 'active' | 'inactive' | 'rate_limited' | 'expired';
  environment: 'paper' | 'live' | 'sandbox';
  lastUsed?: string;
  usageCount: number;
  errorCount: number;
}

export function ApiVaultDashboard() {
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCredential, setNewCredential] = useState({
    service: '',
    apiKey: '',
    secretKey: '',
    environment: 'paper' as const
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vault/credentials');
      const data = await response.json();
      
      if (data.success) {
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = async () => {
    if (!newCredential.service || !newCredential.apiKey) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/vault/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCredential,
          status: 'active',
          usageCount: 0,
          errorCount: 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewCredential({ service: '', apiKey: '', secretKey: '', environment: 'paper' });
        setShowAddForm(false);
        loadCredentials();
      } else {
        alert(data.error || 'Failed to add credential');
      }
    } catch (error) {
      console.error('Failed to add credential:', error);
      alert('Failed to add credential');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredential = async (service: string) => {
    if (!confirm(`Are you sure you want to delete ${service} credentials?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/vault/credentials/${service}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        loadCredentials();
      } else {
        alert(data.error || 'Failed to delete credential');
      }
    } catch (error) {
      console.error('Failed to delete credential:', error);
      alert('Failed to delete credential');
    } finally {
      setLoading(false);
    }
  };

  const validateCredential = async (service: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vault/credentials/${service}/validate`);
      const data = await response.json();
      
      alert(data.message);
      
      if (data.valid) {
        loadCredentials();
      }
    } catch (error) {
      console.error('Failed to validate credential:', error);
      alert('Failed to validate credential');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rate_limited':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'expired':
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleKeyVisibility = (service: string) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">API Vault</h2>
          <Badge variant="secondary">Secure Credential Management</Badge>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Credential</span>
        </Button>
      </div>

      <Tabs defaultValue="credentials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credentials">Stored Credentials</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="security">Security Status</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New API Credential</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service">Service</Label>
                    <Select 
                      value={newCredential.service} 
                      onValueChange={(value) => setNewCredential(prev => ({ ...prev, service: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alpaca">Alpaca Markets</SelectItem>
                        <SelectItem value="coinbase">Coinbase</SelectItem>
                        <SelectItem value="robinhood">Robinhood</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="perplexity">Perplexity</SelectItem>
                        <SelectItem value="alpha_vantage">Alpha Vantage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select 
                      value={newCredential.environment} 
                      onValueChange={(value: 'paper' | 'live' | 'sandbox') => 
                        setNewCredential(prev => ({ ...prev, environment: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paper">Paper Trading</SelectItem>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="live">Live Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key *</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newCredential.apiKey}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <Label htmlFor="secretKey">Secret Key (if required)</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={newCredential.secretKey}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, secretKey: e.target.value }))}
                    placeholder="Enter secret key"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddCredential} disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Credential
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {credentials.map((credential) => (
              <Card key={credential.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg capitalize flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>{credential.service}</span>
                    {getStatusIcon(credential.status)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={credential.environment === 'live' ? 'destructive' : 'secondary'}>
                      {credential.environment}
                    </Badge>
                    <Badge variant={credential.status === 'active' ? 'default' : 'destructive'}>
                      {credential.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Usage Count</p>
                      <p className="font-medium">{credential.usageCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Error Count</p>
                      <p className="font-medium">{credential.errorCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Used</p>
                      <p className="font-medium">
                        {credential.lastUsed 
                          ? new Date(credential.lastUsed).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => validateCredential(credential.service)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Validate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toggleKeyVisibility(credential.service)}
                    >
                      {showKeys[credential.service] ? (
                        <><EyeOff className="h-4 w-4 mr-1" />Hide</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-1" />Show</>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteCredential(credential.service)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  {showKeys[credential.service] && (
                    <Alert className="mt-3">
                      <AlertDescription>
                        <strong>API Key:</strong> {credential.service}_{credential.id.slice(0, 8)}...
                        <br />
                        <em>Full keys are encrypted and only shown for validation</em>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div key={credential.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{credential.service}</span>
                      <Badge variant="outline">{credential.environment}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {credential.usageCount} calls • {credential.errorCount} errors
                      </p>
                      <p className="text-xs text-gray-500">
                        {credential.errorCount > 0 
                          ? `${((credential.errorCount / Math.max(credential.usageCount, 1)) * 100).toFixed(1)}% error rate`
                          : '0% error rate'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All API keys are encrypted using AES-256-GCM encryption and stored securely.
                    Keys are never logged or transmitted in plain text.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">Encryption Status</h4>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AES-256-GCM Active</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">Access Control</h4>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Authentication Required</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
