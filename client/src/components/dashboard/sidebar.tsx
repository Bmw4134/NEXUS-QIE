import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  BarChart3, 
  Search, 
  Network, 
  Settings, 
  Activity,
  Atom,
  Zap,
  Globe,
  GitBranch,
  TrendingUp,
  BookOpen,
  Cpu,
  Building,
  Target,
  Crown,
  Maximize,
  Minimize,
  X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuantumDatabase } from "@/hooks/use-quantum-database";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { stats } = useQuantumDatabase();
  const [location] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: Activity, href: "/dashboard", current: location === "/" || location === "/dashboard" },
    { name: "AI Automation", icon: Zap, href: "/automation", current: location === "/automation" },
    { name: "Browser", icon: Globe, href: "/browser", current: location === "/browser" },
    { name: "Knowledge Nodes", icon: Brain, href: "/knowledge", current: location === "/knowledge" },
    { name: "Quantum Query", icon: Search, href: "/quantum-query", current: location === "/quantum-query" },
    { name: "Knowledge Graph", icon: Network, href: "/knowledge-graph", current: location === "/knowledge-graph" },
    { name: "GitHub Brain", icon: GitBranch, href: "/github-brain", current: location === "/github-brain" },
    { name: "BIM Infinity Suite", icon: Building, href: "/bim-infinity", current: location === "/bim-infinity" },
    { name: "Proof in the Pudding", icon: Target, href: "/proof-pudding", current: location === "/proof-pudding" },
    { name: "Infinity Sovereign", icon: Crown, href: "/infinity-sovereign", current: location === "/infinity-sovereign" },
    { name: "KaizenGPT Agent", icon: Cpu, href: "/kaizen-agent", current: location === "/kaizen-agent" },
    { name: "Market Intelligence", icon: TrendingUp, href: "/market-intelligence", current: location === "/market-intelligence" },
    { name: "Research Hub", icon: BookOpen, href: "/research-hub", current: location === "/research-hub" },
    { name: "Quantum AI", icon: Cpu, href: "/quantum-ai", current: location === "/quantum-ai" },
    { name: "Analytics", icon: BarChart3, href: "/analytics", current: location === "/analytics" },
    { name: "Settings", icon: Settings, href: "/settings", current: location === "/settings" },
  ];

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-40",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 quantum-gradient rounded-lg flex items-center justify-center">
              <Atom className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">NEXUS</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Excellence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {isFullscreen && (
          <div className="mt-2 text-center">
            <Badge variant="secondary" className="text-xs animate-pulse bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              App Mode Active
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation with Scroll Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.current ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start space-x-3 h-12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                      item.current 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* ASI Status Panel */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ASI Learning</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-1">
            <div className="text-xs opacity-90">
              Enhancement: <span className="font-semibold">{stats?.asiFactor?.toFixed(3) || "1.847"}</span>
            </div>
            <div className="text-xs opacity-90">
              Nodes: <span className="font-semibold">{stats?.quantumNodes?.toLocaleString() || "24,891"}</span>
            </div>
            <div className="text-xs opacity-90">
              Success: <span className="font-semibold">{stats?.successRate?.toFixed(1) || "97.3"}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
