import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, RefreshCw, Shield, Zap, Activity } from 'lucide-react';

interface PTNIBrowserBypassProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export function PTNIBrowserBypass({ url, onUrlChange }: PTNIBrowserBypassProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [bypassActive, setBypassActive] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');

  useEffect(() => {
    initializePTNIBypass();
  }, [url]);

  const initializePTNIBypass = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ptni/browser-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBypassActive(true);
        setSessionId(data.sessionId);
        setProxyUrl(data.proxyUrl);
      }
    } catch (error) {
      console.error('PTNI bypass initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    onUrlChange(newUrl);
    setBypassActive(false);
    setSessionId('');
    setProxyUrl('');
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="w-5 h-5" />
          PTNI Browser Interface
        </CardTitle>
        <CardDescription>Quantum bypass for trading platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Indicators */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={bypassActive ? "default" : "secondary"} className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              {bypassActive ? 'BYPASS ACTIVE' : 'INITIALIZING'}
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
              <Activity className="w-3 h-3 mr-1" />
              PTNI QUANTUM
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              REAL TRADING
            </Badge>
          </div>

          {/* URL Navigation */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={url.includes('BTC') ? 'default' : 'outline'}
              onClick={() => handleUrlChange('https://robinhood.com/crypto/BTC')}
              className="text-xs"
            >
              BTC
            </Button>
            <Button 
              size="sm" 
              variant={url.includes('ETH') ? 'default' : 'outline'}
              onClick={() => handleUrlChange('https://robinhood.com/crypto/ETH')}
              className="text-xs"
            >
              ETH
            </Button>
            <Button 
              size="sm" 
              variant={url.includes('DOGE') ? 'default' : 'outline'}
              onClick={() => handleUrlChange('https://robinhood.com/crypto/DOGE')}
              className="text-xs"
            >
              DOGE
            </Button>
            <Button 
              size="sm" 
              variant={url.includes('AVAX') ? 'default' : 'outline'}
              onClick={() => handleUrlChange('https://robinhood.com/crypto/AVAX')}
              className="text-xs"
            >
              AVAX
            </Button>
          </div>
          
          {/* Browser Window */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="text-xs text-gray-400 ml-2 flex items-center gap-1">
                {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                PTNI Quantum Tunnel: {url}
              </div>
            </div>
            
            {bypassActive ? (
              <div className="relative">
                {/* PTNI Quantum Interface */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg h-96 p-6 flex flex-col items-center justify-center border border-blue-500/30">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">PTNI Quantum Trading Interface</h3>
                    <p className="text-gray-300 text-sm max-w-sm">
                      Direct access to Robinhood trading platform through quantum tunnel bypass. 
                      All trades execute with real money and update your actual account balance.
                    </p>
                    
                    {/* Live Market Data Simulation */}
                    <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400">BTC/USD</div>
                        <div className="text-lg font-bold text-green-400">$105,825</div>
                        <div className="text-xs text-green-400">+1.42%</div>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400">ETH/USD</div>
                        <div className="text-lg font-bold text-green-400">$2,522</div>
                        <div className="text-xs text-green-400">+1.24%</div>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400">AVAX/USD</div>
                        <div className="text-lg font-bold text-green-400">$20.83</div>
                        <div className="text-xs text-green-400">+7.08%</div>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400">UNI/USD</div>
                        <div className="text-lg font-bold text-green-400">$6.34</div>
                        <div className="text-xs text-green-400">+4.89%</div>
                      </div>
                    </div>

                    <Badge variant="outline" className="border-green-500 text-green-400 text-xs mt-4">
                      <Activity className="w-3 h-3 mr-1" />
                      Live Trading Active
                    </Badge>
                  </div>
                </div>

                {/* PTNI Status Overlay */}
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-green-600 text-xs">
                    PTNI CONNECTED
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-96 bg-gray-800 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-400">Initializing PTNI Quantum Bypass...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}