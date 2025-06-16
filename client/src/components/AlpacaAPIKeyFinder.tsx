
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Key, Search, Browser, BookOpen } from 'lucide-react';

interface AlpacaCredentials {
  apiKey: string;
  secretKey: string;
  environment: 'paper' | 'live';
  found: boolean;
  location: string;
}

interface SessionInfo {
  found: boolean;
  details: any;
  sessions?: Array<{
    type: string;
    url?: string;
    title?: string;
    indicator?: string;
  }>;
}

export default function AlpacaAPIKeyFinder() {
  const [isScanning, setIsScanning] = useState(false);
  const [credentials, setCredentials] = useState<AlpacaCredentials[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [navigationGuide, setNavigationGuide] = useState<string>('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    scanForSession();
  }, []);

  const scanForSession = async () => {
    try {
      const response = await fetch('/api/alpaca/scan-session');
      const data = await response.json();
      setSessionInfo(data);
    } catch (error) {
      console.error('Failed to scan for Alpaca session:', error);
    }
  };

  const findCredentials = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/alpaca/find-credentials');
      const data = await response.json();
      
      if (data.success) {
        setCredentials(data.credentials);
      }
    } catch (error) {
      console.error('Failed to find credentials:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getNavigationGuide = async () => {
    try {
      const response = await fetch('/api/alpaca/navigation-guide');
      const data = await response.json();
      
      if (data.success) {
        setNavigationGuide(data.guide);
        setShowGuide(true);
      }
    } catch (error) {
      console.error('Failed to get navigation guide:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alpaca API Key Finder
          </CardTitle>
          <CardDescription>
            Intelligent browser scanning to find your Alpaca API credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Browser className="h-4 w-4" />
              <span className="text-sm font-medium">Browser Session Status</span>
            </div>
            <div className="flex items-center gap-2">
              {sessionInfo?.found ? (
                <Badge variant="default" className="bg-green-500">
                  Active Session Found
                </Badge>
              ) : (
                <Badge variant="secondary">
                  No Active Session
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={scanForSession}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Active Sessions */}
          {sessionInfo?.sessions && sessionInfo.sessions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Alpaca Sessions:</h4>
              {sessionInfo.sessions.map((session, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {session.type === 'browser_tab' ? 'Browser Tab' : 'Process'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {session.url || session.indicator}
                      </p>
                      {session.title && (
                        <p className="text-xs text-gray-500">{session.title}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {session.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={findCredentials} 
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              {isScanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isScanning ? 'Scanning...' : 'Find API Keys'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={getNavigationGuide}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Get Navigation Guide
            </Button>
          </div>

          {/* Found Credentials */}
          {credentials.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Found Credentials:</h4>
              {credentials.map((cred, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">
                      {cred.environment.toUpperCase()} Environment
                    </h5>
                    <Badge variant={cred.found ? "default" : "secondary"}>
                      {cred.found ? "Found" : "Not Found"}
                    </Badge>
                  </div>
                  
                  {cred.found && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">API Key:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                          {cred.apiKey ? `${cred.apiKey.substring(0, 8)}...` : 'Not found'}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Secret Key:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                          {cred.secretKey ? `${cred.secretKey.substring(0, 8)}...` : 'Not found'}
                        </code>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600 mt-2">
                    Location: {cred.location}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Guide */}
          {showGuide && navigationGuide && (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <h4 className="font-medium">How to Find Your Alpaca API Keys:</h4>
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border">
                    {navigationGuide}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Steps to get your API keys:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Make sure you're logged into Alpaca Markets in your Edge browser</li>
                <li>Click "Find API Keys" to scan your browser session</li>
                <li>If not found, click "Get Navigation Guide" for step-by-step instructions</li>
                <li>Once you have your keys, add them to Replit Secrets as ALPACA_API_KEY and ALPACA_SECRET_KEY</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
