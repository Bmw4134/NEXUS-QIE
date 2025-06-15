import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, Webhook, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountData {
  balance: number;
  accounts: Array<{
    name: string;
    balance: number;
    currency: string;
    type: string;
  }>;
  extractionMethod: string;
  lastUpdated: string;
}

export function CoinbaseRealAccountExtractor() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSettingUpWebhook, setIsSettingUpWebhook] = useState(false);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const { toast } = useToast();

  const extractRealBalance = async () => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/coinbase/extract-real-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAccountData(data);
        toast({
          title: "Real Balance Extracted",
          description: `Successfully extracted $${data.balance.toFixed(2)} from your Coinbase account`,
        });
      } else {
        throw new Error(data.error || 'Extraction failed');
      }
    } catch (error: any) {
      toast({
        title: "Extraction Failed",
        description: error.message || 'Failed to extract real account balance',
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const setupWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsSettingUpWebhook(true);
    try {
      const response = await fetch('/api/coinbase/setup-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Webhook Configured",
          description: "Real-time balance updates are now active",
        });
      } else {
        throw new Error(data.error || 'Webhook setup failed');
      }
    } catch (error: any) {
      toast({
        title: "Webhook Setup Failed",
        description: error.message || 'Failed to configure webhook',
        variant: "destructive",
      });
    } finally {
      setIsSettingUpWebhook(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/coinbase/connection-status');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Real Coinbase Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={extractRealBalance} 
              disabled={isExtracting}
              className="flex-1"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Balance...
                </>
              ) : (
                'Extract Real Balance'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={checkConnectionStatus}
            >
              Check Status
            </Button>
          </div>

          {accountData && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Balance:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${accountData.balance.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Extraction Method:</span>
                <Badge variant="secondary">{accountData.extractionMethod}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(accountData.lastUpdated).toLocaleString()}
                </span>
              </div>

              {accountData.accounts.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold">Account Breakdown:</span>
                  {accountData.accounts.map((account, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{account.name}</span>
                      <span>${account.balance.toFixed(2)} {account.currency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {connectionStatus && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {connectionStatus.connected ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="font-semibold">Connection Status</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>Browser Active: {connectionStatus.browserActive ? 'Yes' : 'No'}</div>
                <div>Method: {connectionStatus.extractionMethod}</div>
                <div>Last Extraction: {new Date(connectionStatus.lastExtraction).toLocaleString()}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Real-Time Webhook Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="webhook-url" className="text-sm font-medium">
              Webhook URL for Real-Time Updates
            </label>
            <Input
              id="webhook-url"
              placeholder="https://your-domain.replit.app/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This URL will receive real-time balance updates from Coinbase
            </p>
          </div>

          <Button 
            onClick={setupWebhook}
            disabled={isSettingUpWebhook || !webhookUrl.trim()}
            className="w-full"
          >
            {isSettingUpWebhook ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configuring Webhook...
              </>
            ) : (
              'Setup Real-Time Webhook'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}