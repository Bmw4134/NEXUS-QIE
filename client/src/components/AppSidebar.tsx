import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Calendar,
  DollarSign,
  Brain,
  FileText,
  Users,
  Settings,
  TrendingUp,
  Zap,
  Bot,
  Shield,
  Kanban,
  Crown,
  Activity,
  BarChart3,
  Target,
  Home
} from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Activity,
    description: "Main overview"
  },
  {
    title: "Family Hub",
    url: "/family-hub",
    icon: Home,
    description: "Central family dashboard"
  },
  {
    title: "SmartPlanner",
    url: "/smart-planner",
    icon: Calendar,
    description: "Family events and tasks"
  },
  {
    title: "WealthPulse",
    url: "/wealth-pulse",
    icon: DollarSign,
    description: "Financial management"
  },
  {
    title: "QuantumInsights",
    url: "/quantum-insights",
    icon: Brain,
    description: "AI-powered analytics"
  },
  {
    title: "NexusNotes",
    url: "/nexus-notes",
    icon: FileText,
    description: "Knowledge base"
  },
  {
    title: "FamilySync",
    url: "/family-sync",
    icon: Users,
    description: "Real-time coordination"
  },
  {
    title: "Canvas Boards",
    url: "/canvas-boards",
    icon: Kanban,
    description: "Interactive boards"
  },
  {
    title: "AI Assistant",
    url: "/ai-assistant",
    icon: Bot,
    description: "Intelligent insights"
  }
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-purple-600">
            NEXUS-QIE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 text-center">
          <div className="text-xs text-muted-foreground">
            Quantum Intelligence Enterprise
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}