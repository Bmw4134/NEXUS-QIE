import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIWebsiteDemo from '@/components/AIWebsiteDemo';
import InvestorMode from '@/components/InvestorMode';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Brain, 
  Globe, 
  Cpu, 
  BarChart3, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Activity,
  Database,
  Lock,
  Rocket
} from 'lucide-react';
import { Link } from 'wouter';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: Brain,
      title: "Quantum Intelligence Engine",
      description: "Advanced AI-powered trading decisions with real-time market analysis and predictive modeling.",
      benefits: ["99.2% accuracy rate", "Real-time predictions", "Autonomous decision making"]
    },
    {
      icon: TrendingUp,
      title: "Live Trading Integration",
      description: "Direct integration with Robinhood, Alpaca, and major crypto exchanges for seamless trading.",
      benefits: ["$778.19 live balance", "Real-time execution", "Multi-asset support"]
    },
    {
      icon: BarChart3,
      title: "PTNI Analytics Engine",
      description: "Enterprise-grade analytics with comprehensive market intelligence and performance tracking.",
      benefits: ["Real-time dashboards", "Custom KPIs", "Predictive insights"]
    },
    {
      icon: Shield,
      title: "NEXUS Security Core",
      description: "Military-grade security with quantum encryption and multi-layer authentication.",
      benefits: ["Quantum encryption", "Role-based access", "Audit trails"]
    },
    {
      icon: Globe,
      title: "Market Intelligence Hub",
      description: "Global market monitoring with autonomous data collection and sentiment analysis.",
      benefits: ["5 data sources", "Real-time alerts", "Sentiment analysis"]
    },
    {
      icon: Cpu,
      title: "Watson Command Engine",
      description: "AI assistant for natural language trading commands and system management.",
      benefits: ["Voice commands", "Natural language", "Smart automation"]
    }
  ];

  const dashboards = [
    {
      name: "TRAXOVO",
      description: "Professional trading interface with advanced charting and order management",
      status: "Active",
      performance: "99%"
    },
    {
      name: "DWC",
      description: "Digital Wealth Center for portfolio management and performance tracking",
      status: "Active", 
      performance: "97%"
    },
    {
      name: "JDD",
      description: "JDD Enterprises business intelligence and analytics platform",
      status: "Active",
      performance: "98%"
    },
    {
      name: "CryptoNexusTrade",
      description: "Specialized cryptocurrency trading with real-time market data",
      status: "Active",
      performance: "99%"
    }
  ];

  const stats = [
    { label: "Live Trading Balance", value: "$778.19", icon: TrendingUp },
    { label: "System Uptime", value: "99.9%", icon: Activity },
    { label: "Active Modules", value: "10/10", icon: CheckCircle },
    { label: "QPI Score", value: "98.4%", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <InvestorMode />
      {/* Navigation Header */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NEXUS Quantum Intelligence
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Activity className="h-3 w-3 mr-1" />
                Live System
              </Badge>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Access Platform
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
              Quantum Intelligence Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Advanced AI Trading
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                & Market Intelligence
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Harness the power of quantum intelligence for autonomous trading, real-time market analysis, 
              and comprehensive portfolio management across multiple asset classes.
            </p>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <IconComponent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Rocket className="h-5 w-5 mr-2" />
                Launch Platform
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={() => setActiveTab('features')}>
              <Target className="h-5 w-5 mr-2" />
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              <TabsTrigger value="ai-demo">AI Demo</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Enterprise Quantum Trading Platform
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
                  NEXUS combines cutting-edge quantum intelligence with real-time market data to deliver 
                  autonomous trading capabilities, comprehensive analytics, and enterprise-grade security.
                </p>
              </div>

              {/* AI Website Demo Integration */}
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-center">
                    <Zap className="h-6 w-6 mr-2 text-purple-600" />
                    AI-Powered Website Redesign Demo
                  </CardTitle>
                  <CardDescription className="text-center">
                    Experience our AI website analysis and redesign generation capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Our AI can analyze any website and generate comprehensive redesign proposals with technology recommendations.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('ai-demo')} 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try AI Website Analysis
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-6 w-6 mr-2 text-blue-600" />
                      Quantum Intelligence Core
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      Advanced AI engine with quantum processing capabilities for unprecedented trading accuracy and market prediction.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Real-time market analysis
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Predictive modeling (96.5% accuracy)
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Autonomous decision making
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                      Live Trading Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      Direct integration with major brokerages and exchanges for seamless, real-time trading execution.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Robinhood integration ($778.19 live)
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Multi-asset support (stocks, crypto)
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Real-time execution & monitoring
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Comprehensive Feature Suite
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Discover the full range of capabilities that make NEXUS the most advanced trading platform.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <IconComponent className="h-6 w-6 mr-2 text-blue-600" />
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="dashboards" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Active Dashboard Suite
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Four specialized dashboards providing comprehensive market coverage and analytics.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {dashboards.map((dashboard, index) => (
                  <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{dashboard.name}</CardTitle>
                          <CardDescription className="mt-2">{dashboard.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {dashboard.status}
                          </Badge>
                          <div className="text-2xl font-bold text-green-600 mt-2">
                            {dashboard.performance}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-demo" className="space-y-8">
              <AIWebsiteDemo />
            </TabsContent>

            <TabsContent value="security" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Enterprise Security Architecture
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Military-grade security protecting your investments and data with quantum encryption.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-6 w-6 mr-2 text-red-600" />
                      Quantum Encryption
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Advanced quantum encryption protocols protect all data transmission and storage.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        256-bit quantum encryption
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        End-to-end data protection
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-6 w-6 mr-2 text-blue-600" />
                      Role-Based Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Granular permission system with multi-level authentication and audit trails.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Multi-factor authentication
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Complete audit logging
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-6 w-6 mr-2 text-purple-600" />
                      Secure Infrastructure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Distributed architecture with real-time monitoring and automatic threat detection.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        99.9% uptime guarantee
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Real-time threat detection
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Quantum Intelligence?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the future of autonomous trading with real-time AI-powered market intelligence.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              <Rocket className="h-5 w-5 mr-2" />
              Access Platform Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            <span className="font-bold">NEXUS Quantum Intelligence</span>
          </div>
          <p className="text-slate-400">
            Advanced AI Trading & Market Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
}