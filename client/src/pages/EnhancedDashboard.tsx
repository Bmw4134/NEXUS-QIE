import React, { Suspense, useRef } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { ErrorBoundary as CustomErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const LiveTradingPanel = React.lazy(() => import('@/components/LiveTradingPanel'));
const QuantumInsights = React.lazy(() => import('./QuantumInsights'));
const InvestorMode = React.lazy(() => import('@/components/InvestorMode'));

export default function EnhancedDashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      NEXUS Platform
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Enhanced Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <CustomErrorBoundary>
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50 p-4">
                  <h3 className="text-lg font-semibold mb-2">System Status</h3>
                  <div className="text-green-500">✅ NEXUS Server Online</div>
                  <div className="text-green-500">✅ Emergency Protocols Active</div>
                  <div className="text-blue-500">📡 WebSocket Connected</div>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50 p-4">
                  <h3 className="text-lg font-semibold mb-2">Trading Status</h3>
                  <div className="text-amber-500">⚡ Live Mode Ready</div>
                  <div className="text-green-500">💰 Account Connected</div>
                  <div className="text-blue-500">🤖 AI Enhanced</div>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50 p-4">
                  <h3 className="text-lg font-semibold mb-2">Intelligence Hub</h3>
                  <div className="text-purple-500">🧠 NEXUS AI Active</div>
                  <div className="text-green-500">🔮 Quantum Insights</div>
                  <div className="text-blue-500">📊 Real-time Analysis</div>
                </div>
              </div>
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
                <h2 className="text-2xl font-bold mb-4">NEXUS Enhanced Trading Dashboard</h2>
                <Suspense fallback={<div className="flex items-center justify-center p-8">Loading components...</div>}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <LiveTradingPanel />
                    <QuantumInsights />
                    <InvestorMode />
                  </div>
                </Suspense>
              </div>
            </CustomErrorBoundary>
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}