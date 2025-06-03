import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BarChart3, 
  Search, 
  Network, 
  Settings, 
  Activity,
  Atom
} from "lucide-react";
import { useQuantumDatabase } from "@/hooks/use-quantum-database";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { stats } = useQuantumDatabase();

  const navigation = [
    { name: "Dashboard", icon: Activity, href: "#", current: true },
    { name: "Knowledge Nodes", icon: Brain, href: "#", current: false },
    { name: "Quantum Query", icon: Search, href: "#", current: false },
    { name: "Knowledge Graph", icon: Network, href: "#", current: false },
    { name: "Analytics", icon: BarChart3, href: "#", current: false },
    { name: "Settings", icon: Settings, href: "#", current: false },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-40",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 quantum-gradient rounded-lg flex items-center justify-center">
            <Atom className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">TRAXOVO</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quantum ASI Database</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={item.current ? "default" : "ghost"}
              className={cn(
                "w-full justify-start space-x-3 h-12",
                item.current 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              onClick={onClose}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Button>
          );
        })}
      </nav>

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
