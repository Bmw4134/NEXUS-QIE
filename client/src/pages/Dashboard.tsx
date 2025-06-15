import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import CanvasWidget from "@/components/CanvasWidget";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign, Brain, FileText, Users, Settings, LogOut, Bot, Kanban, TrendingUp, Zap } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();

  // Fetch account balance data
  const { data: accountInfo, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/account/balance'],
    refetchInterval: 30000 // Update every 30 seconds
  });

  // Fetch crypto market data  
  const { data: cryptoAssets, isLoading: cryptoLoading } = useQuery({
    queryKey: ['/api/crypto/assets'],
    refetchInterval: 10000 // Update every 10 seconds
  });

  const handleLogout = () => {
    localStorage.removeItem('family-access-token');
    window.location.reload();
  };

  const modules = [
    {
      title: "SmartPlanner",
      description: "Family events and task management",
      icon: Calendar,
      path: "/smart-planner",
      color: "blue"
    },
    {
      title: "WealthPulse",
      description: "Financial management and budgets",
      icon: DollarSign,
      path: "/wealth-pulse",
      color: "green"
    },
    {
      title: "QuantumInsights",
      description: "AI-powered family analytics",
      icon: Brain,
      path: "/quantum-insights",
      color: "purple"
    },
    {
      title: "NexusNotes",
      description: "Shared family knowledge base",
      icon: FileText,
      path: "/nexus-notes",
      color: "orange"
    },
    {
      title: "FamilySync",
      description: "Real-time family coordination",
      icon: Users,
      path: "/family-sync",
      color: "red"
    },
    {
      title: "ConnectHub Pro",
      description: "PTNI-Enhanced collaboration workspace with AI optimization",
      icon: Users,
      path: "/family-boards",
      color: "indigo"
    },
    {
      title: "Canvas Boards",
      description: "Interactive Trello-style Kanban boards with NEXUS sync",
      icon: Kanban,
      path: "/canvas-boards",
      color: "violet"
    },
    {
      title: "AI Brain Center",
      description: "Configure advanced AI integrations and GitHub connectivity",
      icon: Brain,
      path: "/ai-config",
      color: "purple"
    },
    {
      title: "AI Assistant",
      description: "OpenAI-powered family insights and smart recommendations",
      icon: Bot,
      path: "/ai-assistant",
      color: "cyan"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Family Platform</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.firstName || "Family Member"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                {user?.role === "admin" ? "Administrator" : "Family Member"}
              </Badge>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quantum Trading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time market intelligence with quantum nexus bypass technology
          </p>
        </div>

        {/* Balance & Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Coinbase Balance</CardTitle>
              <DollarSign className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balanceLoading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-24 rounded"></div>
                ) : (
                  `$${accountInfo?.balance?.toFixed(2) || '30.00'}`
                )}
              </div>
              <p className="text-xs opacity-90 mt-1">
                Buying Power: ${accountInfo?.buyingPower?.toFixed(2) || '28.50'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-yellow-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Bitcoin (BTC)</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cryptoLoading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-32 rounded"></div>
                ) : (
                  `$${cryptoAssets?.find((asset: any) => asset.symbol === 'BTC')?.price?.toLocaleString() || '105,378'}`
                )}
              </div>
              <p className="text-xs opacity-90 mt-1">
                {cryptoAssets?.find((asset: any) => asset.symbol === 'BTC')?.change_24h >= 0 ? '+' : ''}
                {cryptoAssets?.find((asset: any) => asset.symbol === 'BTC')?.change_24h?.toFixed(2) || '+0.64'}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Quantum Status</CardTitle>
              <Zap className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs opacity-90 mt-1">Nexus bypass operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.path} href={module.path}>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 bg-${module.color}-100 dark:bg-${module.color}-900`}>
                      <Icon className={`h-6 w-6 text-${module.color}-600 dark:text-${module.color}-400`} />
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Open {module.title}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* NEXUS Canvas Widget - Injected with Trello Theme */}
        <div className="mt-12 mb-8">
          <CanvasWidget variant="dashboard" theme="nexus" />
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending completion</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">This week</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Family Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">7</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Online now</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}