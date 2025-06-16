import React from 'react';
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
  Bot,
  Home,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

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

const sidebarCategories: SidebarCategory[] = [
  {
    id: 'core',
    title: 'Core',
    icon: Home,
    collapsed: false,
    items: [
      { id: 'dashboard', title: 'Dashboard', path: '/', icon: Home, status: 'active' },
      { id: 'api-vault', title: 'API Vault', path: '/api-vault', icon: Database }
    ]
  },
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
];

function AppSidebarContent() {
  const [location] = useLocation();
  const { isMobile, isTablet, screenSize } = useResponsive();
  const { state } = useSidebar();
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(['core', 'quantum', 'nexus', 'trading']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getStatusIndicator = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          {state === "expanded" && (
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NEXUS Command
              </h1>
              <p className="text-xs text-muted-foreground">DWC Production</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {sidebarCategories.map((category) => (
          <SidebarGroup key={category.id}>
            <SidebarGroupLabel 
              className={cn(
                "cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors flex items-center justify-between w-full",
                state === "collapsed" && "justify-center"
              )}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-2">
                <category.icon className="w-4 h-4" />
                {state === "expanded" && <span>{category.title}</span>}
              </div>
              {state === "expanded" && (
                expandedCategories.includes(category.id) ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              )}
            </SidebarGroupLabel>

            {(expandedCategories.includes(category.id) || state === "collapsed") && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {category.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.path}
                        tooltip={state === "collapsed" ? item.title : undefined}
                      >
                        <Link href={item.path}>
                          <div className="flex items-center gap-2 w-full">
                            <item.icon className="w-4 h-4" />
                            {state === "expanded" && <span>{item.title}</span>}
                            {state === "expanded" && item.status && (
                              <div className={cn("w-2 h-2 rounded-full ml-auto", getStatusIndicator(item.status))} />
                            )}
                            {state === "expanded" && item.badge && (
                              <span className="ml-auto px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          state === "collapsed" && "justify-center"
        )}>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {state === "expanded" && (
            <div>
              <div>Screen: {screenSize.toUpperCase()}</div>
              <div>{isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar() {
  const { isMobile } = useResponsive();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar 
        collapsible={isMobile ? "offcanvas" : "icon"}
        className="border-sidebar-border"
      >
        <AppSidebarContent />
      </Sidebar>
    </SidebarProvider>
  );
}

export { AppSidebarContent };