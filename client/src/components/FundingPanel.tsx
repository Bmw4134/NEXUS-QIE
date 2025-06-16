
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

interface FundingPanelProps {
  onFundingComplete?: (amount: number, source: string) => void;
}

export function FundingPanel({ onFundingComplete }: FundingPanelProps) {
  const [amount, setAmount] = useState('');
  const [fundingSource, setFundingSource] = useState('');
  const [targetAccount, setTargetAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);

  const fundingSources = [
    { id: 'bank', name: 'Bank Account (ACH)', icon: Banknote, fee: 'Free', time: '1-3 business days' },
    { id: 'debit', name: 'Debit Card', icon: CreditCard, fee: '$5.00', time: 'Instant' },
    { id: 'wire', name: 'Wire Transfer', icon: TrendingUp, fee: '$25.00', time: 'Same day' }
  ];

  const targetAccounts = [
    { id: 'alpaca', name: 'Alpaca Trading', balance: 25000.00, type: 'Stock & Crypto' },
    { id: 'coinbase', name: 'Coinbase Pro', balance: 0.00, type: 'Cryptocurrency' },
    { id: 'robinhood', name: 'Robinhood', balance: 0.00, type: 'Stocks & Options' }
  ];

  const handleTransfer = async () => {
    if (!amount || !fundingSource || !targetAccount) return;

    setIsProcessing(true);

    try {
      // Simulate transfer process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch('/api/funding/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          source: fundingSource,
          target: targetAccount,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setTransferComplete(true);
        onFundingComplete?.(parseFloat(amount), fundingSource);
        
        // Reset form after success
        setTimeout(() => {
          setTransferComplete(false);
          setAmount('');
          setFundingSource('');
          setTargetAccount('');
        }, 3000);
      }
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (transferComplete) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Transfer Complete!</h3>
              <p className="text-sm text-muted-foreground">
                ${amount} has been transferred successfully
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Transfer Amounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Transfer
          </CardTitle>
          <CardDescription>
            Select a pre-set amount for instant transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                className="h-12"
                onClick={() => setAmount(quickAmount.toString())}
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Fund Your Trading Account
          </CardTitle>
          <CardDescription>
            Transfer money to start trading stocks and crypto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Transfer Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                type="number"
                min="1"
                max="100000"
              />
            </div>
          </div>

          {/* Funding Source */}
          <div className="space-y-2">
            <Label>Funding Source</Label>
            <Select value={fundingSource} onValueChange={setFundingSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select funding source" />
              </SelectTrigger>
              <SelectContent>
                {fundingSources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{source.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {source.fee}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {fundingSource && (
              <p className="text-xs text-muted-foreground">
                Transfer time: {fundingSources.find(s => s.id === fundingSource)?.time}
              </p>
            )}
          </div>

          {/* Target Account */}
          <div className="space-y-2">
            <Label>Target Account</Label>
            <Select value={targetAccount} onValueChange={setTargetAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select trading account" />
              </SelectTrigger>
              <SelectContent>
                {targetAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-muted-foreground">{account.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${account.balance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transfer Summary */}
          {amount && fundingSource && targetAccount && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Transfer ${amount} from {fundingSources.find(s => s.id === fundingSource)?.name} to{' '}
                {targetAccounts.find(a => a.id === targetAccount)?.name}
                <br />
                <span className="text-xs">
                  Fee: {fundingSources.find(s => s.id === fundingSource)?.fee} • 
                  Time: {fundingSources.find(s => s.id === fundingSource)?.time}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Transfer Button */}
          <Button
            onClick={handleTransfer}
            disabled={!amount || !fundingSource || !targetAccount || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing Transfer...
              </>
            ) : (
              <>
                Transfer ${amount || '0'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Account Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Current Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {targetAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-muted-foreground">{account.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${account.balance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
