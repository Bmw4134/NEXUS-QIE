import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';

// Import all your sophisticated pages
import QIEIntelligenceHub from './pages/QIEIntelligenceHub';
import EnhancedDashboard from './pages/EnhancedDashboard';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { QIEEngine } from '@/components/QIEEngine';
import { RecursiveEvolutionDashboard } from '@/components/RecursiveEvolutionDashboard';
import { QuantumStealthDashboard } from '@/components/QuantumStealthDashboard';

// Import the sophisticated NEXUS components
import { NexusQuantumDashboard } from '@/components/dashboard/nexus-quantum-dashboard';
import { CompetitiveIntelligencePanel } from '@/components/dashboard/competitive-intelligence-panel';
import { UniformityMirrorDashboard } from '@/components/dashboard/uniformity-mirror-dashboard';
import { PerformanceAnalytics } from '@/components/dashboard/performance-analytics';
import LiveTradingDashboard from '@/components/LiveTradingDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
            <Routes>
              {/* Main NEXUS Quantum Trading Dashboard */}
              <Route path="/" element={<NexusQuantumDashboard />} />

              {/* Sophisticated Intelligence Hub */}
              <Route path="/qie" element={<QIEIntelligenceHub />} />
              <Route path="/qie-intelligence-hub" element={<QIEIntelligenceHub />} />

              {/* Advanced Analytics & Intelligence */}
              <Route path="/competitive-intelligence" element={<CompetitiveIntelligencePanel />} />
              <Route path="/uniformity-mirror" element={<UniformityMirrorDashboard />} />
              <Route path="/performance-analytics" element={<PerformanceAnalytics />} />

              {/* Live Trading Interfaces */}
              <Route path="/live-trading" element={<LiveTradingDashboard />} />
              <Route path="/trading-dashboard" element={<LiveTradingDashboard />} />

              {/* Family Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/nexus-dashboard" element={<Dashboard />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;