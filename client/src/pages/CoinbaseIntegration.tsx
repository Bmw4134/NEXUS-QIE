import { CoinbaseRealAccountExtractor } from '@/components/CoinbaseRealAccountExtractor';
import { CoinbaseLiveTradingPanel } from '@/components/CoinbaseLiveTradingPanel';
import { AutonomousTraderPanel } from '@/components/AutonomousTraderPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Zap, TrendingUp, Bot } from 'lucide-react';
import { Link } from 'wouter';

export function CoinbaseIntegration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Coinbase Real Account Integration</h1>
              <p className="text-muted-foreground">
                Extract real account data using quantum stealth technology
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="extraction" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="extraction">Account Extraction</TabsTrigger>
                <TabsTrigger value="trading">Live Trading</TabsTrigger>
                <TabsTrigger value="autonomous">Autonomous Bot</TabsTrigger>
              </TabsList>
              
              <TabsContent value="extraction" className="space-y-4">
                <CoinbaseRealAccountExtractor />
              </TabsContent>
              
              <TabsContent value="trading" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quantum Stealth Trading
                    </CardTitle>
                    <CardDescription>
                      Execute trades with your real Coinbase balance using advanced stealth protocols
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CoinbaseLiveTradingPanel />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="autonomous" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Fully Autonomous Trading Bot
                    </CardTitle>
                    <CardDescription>
                      AI-powered autonomous trading with your real Coinbase funds - completely hands-free operation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AutonomousTraderPanel />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Quantum Stealth Extraction</div>
                    <div className="text-muted-foreground">
                      Undetectable browser automation using advanced stealth protocols
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Multi-Method Fallback</div>
                    <div className="text-muted-foreground">
                      DOM scraping, session storage, and API interception
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Rate Limit Bypass</div>
                    <div className="text-muted-foreground">
                      6 quantum nodes with intelligent request distribution
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Extraction Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium mb-1">1. Browser Session</div>
                  <div className="text-muted-foreground">
                    Connects to your logged-in Edge browser session
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">2. DOM Analysis</div>
                  <div className="text-muted-foreground">
                    Extracts balance data directly from portfolio page elements
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">3. Session Storage</div>
                  <div className="text-muted-foreground">
                    Captures cached account data from browser storage
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">4. API Interception</div>
                  <div className="text-muted-foreground">
                    Monitors network requests for real API responses
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  For the webhook URL, use your Replit app domain followed by /webhook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  https://your-app.replit.app/webhook
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}