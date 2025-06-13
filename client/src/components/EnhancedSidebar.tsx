import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Settings,
  Zap,
  Target,
  Shield,
  Database,
  Activity,
  BarChart3,
  Command,
  Network,
  Cpu,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarCategory {
  id: string;
  title: string;
  icon: any;
  collapsed: boolean;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  title: string;
  path: string;
  icon: any;
  badge?: string;
  status?: 'active' | 'warning' | 'error';
}

export default function EnhancedSidebar() {
  const [location] = useLocation();
  const [categories, setCategories] = useState<SidebarCategory[]>([
    {
      id: 'quantum',
      title: 'Quantum Intelligence',
      icon: Brain,
      collapsed: false,
      items: [
        { id: 'quantum-ai', title: 'Quantum AI Hub', path: '/quantum-ai', icon: Brain, status: 'active' },
        { id: 'quantum-insights', title: 'Quantum Insights', path: '/quantum-insights', icon: Zap },
        { id: 'ai-assistant', title: 'AI Assistant', path: '/ai-assistant', icon: Bot },
        { id: 'watson-command', title: 'Watson Command', path: '/watson-command', icon: Command, status: 'active' }
      ]
    },
    {
      id: 'nexus',
      title: 'NEXUS Operations',
      icon: Network,
      collapsed: false,
      items: [
        { id: 'nexus-operator', title: 'Operator Console', path: '/nexus-operator', icon: Shield, status: 'active' },
        { id: 'infinity-sovereign', title: 'Infinity Sovereign', path: '/infinity-sovereign', icon: Target },
        { id: 'kaizen-agent', title: 'Kaizen Agent', path: '/kaizen-agent', icon: TrendingUp },
        { id: 'automation', title: 'Automation Suite', path: '/automation', icon: Cpu }
      ]
    },
    {
      id: 'trading',
      title: 'Trading & Markets',
      icon: TrendingUp,
      collapsed: false,
      items: [
        { id: 'live-trading', title: 'Live Trading', path: '/live-trading', icon: Activity, status: 'active' },
        { id: 'quantum-trading', title: 'Quantum Trading', path: '/quantum-trading-dashboard', icon: Zap },
        { id: 'nexus-terminal', title: 'Trading Terminal', path: '/nexus-trading-terminal', icon: BarChart3 },
        { id: 'wealth-pulse', title: 'WealthPulse', path: '/wealth-pulse', icon: DollarSign }
      ]
    },
    {
      id: 'intelligence',
      title: 'Intelligence Hub',
      icon: Database,
      collapsed: true,
      items: [
        { id: 'qie-hub', title: 'QIE Intelligence', path: '/qie-intelligence-hub', icon: Database },
        { id: 'github-brain', title: 'GitHub Brain', path: '/github-brain', icon: Network },
        { id: 'proof-pudding', title: 'Analytics Proof', path: '/proof-pudding', icon: BarChart3 },
        { id: 'qnis-admin', title: 'QNIS Admin', path: '/qnis-admin', icon: Settings }
      ]
    },
    {
      id: 'family',
      title: 'Family Platform',
      icon: Users,
      collapsed: true,
      items: [
        { id: 'family-sync', title: 'Family Sync', path: '/family-sync', icon: Users },
        { id: 'smart-planner', title: 'SmartPlanner', path: '/smart-planner', icon: Calendar },
        { id: 'nexus-notes', title: 'NEXUS Notes', path: '/nexus-notes', icon: Database },
        { id: 'canvas-boards', title: 'Canvas Boards', path: '/canvas-boards', icon: Target }
      ]
    },
    {
      id: 'system',
      title: 'System Control',
      icon: Settings,
      collapsed: true,
      items: [
        { id: 'admin-panel', title: 'Admin Panel', path: '/admin', icon: Shield },
        { id: 'user-management', title: 'User Management', path: '/user-management', icon: Users },
        { id: 'deployment-status', title: 'Deployment Status', path: '/infinity-deployment-status', icon: Activity },
        { id: 'ai-config', title: 'AI Configuration', path: '/ai-configuration', icon: Settings }
      ]
    }
  ]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, collapsed: !cat.collapsed }
          : cat
      )
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-full overflow-y-auto border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          NEXUS Command
        </h1>
        <p className="text-xs text-gray-400 mt-1">DWC Production Tier</p>
      </div>

      <div className="p-2">
        {categories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <category.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.title}</span>
              </div>
              {category.collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {!category.collapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {category.items.map((item) => (
                  <Link key={item.id} href={item.path}>
                    <div className={cn(
                      "flex items-center justify-between p-2 rounded-md text-sm transition-colors cursor-pointer",
                      location === item.path 
                        ? "bg-blue-600 text-white" 
                        : "hover:bg-gray-800 text-gray-300"
                    )}>
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded">
                            {item.badge}
                          </span>
                        )}
                        {item.status && (
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(item.status))} />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}