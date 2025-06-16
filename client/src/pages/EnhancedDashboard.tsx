import React, { Suspense, ErrorBoundary } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ErrorBoundary as CustomErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { useQuery } from '@tanstack/react-query';

// Lazy load components to prevent hook violations
const Dashboard = React.lazy(() => import('./Dashboard'));
const LiveTradingPanel = React.lazy(() => import('@/components/LiveTradingPanel'));
const QuantumInsights = React.lazy(() => import('./QuantumInsights'));
const InvestorMode = React.lazy(() => import('@/components/InvestorMode'));

export default function EnhancedDashboard() {
  // Fetch system status
  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ['/api/nexus/status'],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000
  });

  const { data: dashboardMetrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 10000,
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Initializing NEXUS Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <CustomErrorBoundary>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-black to-gray-800">
          {/* Sidebar */}
          <AppSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-white">
                    NEXUS Intelligence Dashboard
                  </h1>
                  {systemStatus && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        systemStatus.systemHealth > 80 ? 'bg-green-500' : 
                        systemStatus.systemHealth > 60 ? 'bg-yellow-500' : 'bg-red-500'
                      } animate-pulse`}></div>
                      <span className="text-sm text-gray-300">
                        System Health: {systemStatus.systemHealth?.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-300">
                    IQ: {systemStatus?.quantumIQ || 150}
                  </div>
                  <div className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                    NEXUS ACTIVE
                  </div>
                </div>
              </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="flex-1 overflow-auto p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              }>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Core Dashboard */}
                  <div className="lg:col-span-2 xl:col-span-2">
                    <Dashboard />
                  </div>

                  {/* Side Panels */}
                  <div className="space-y-6">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
                      <LiveTradingPanel />
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
                      <InvestorMode />
                    </div>
                  </div>
                </div>

                {/* Quantum Insights Section */}
                <div className="mt-8">
                  <QuantumInsights />
                </div>
              </Suspense>
            </main>
          </div>
        </div>

        <Toaster />
      </SidebarProvider>
    </CustomErrorBoundary>
  );
}