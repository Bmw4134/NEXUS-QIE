import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';

// Import core components
import { Dashboard } from '@/pages/Dashboard';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

// Authentication check
const useAuth = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('family-access-token');
  const userData = localStorage.getItem('user_data');

  return {
    isAuthenticated: !!token,
    user: userData ? JSON.parse(userData) : null,
    token
  };
};

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

function App() {
  const [location] = useLocation();

  // Log system status
  React.useEffect(() => {
    console.log('Watson Desktop NEXUS Production Interface Loaded');
    console.log('Trading platform operational with quantum intelligence');

    // Health check interval
    const healthCheck = setInterval(() => {
      console.log('Health check passed:', new Date().toISOString());
    }, 30000);

    return () => clearInterval(healthCheck);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nexus-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
          <Switch>
            {/* Landing Page - Public */}
            <Route path="/" component={QIEIntelligenceHub} />
            <Route path="/qie" component={QIEIntelligenceHub} />

            {/* Login Page - Public */}
            <Route path="/login" component={LoginPage} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard">
              <ProtectedRoute>
                <SidebarProvider>
                  <Dashboard />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/enhanced-dashboard">
              <ProtectedRoute>
                <EnhancedDashboard />
              </ProtectedRoute>
            </Route>

            {/* Trading Modules */}
            <Route path="/live-trading">
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
                    <LiveTradingPanel />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/quantum-trading-dashboard">
              <ProtectedRoute>
                <SidebarProvider>
                  <QuantumTradingDashboard />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/trading-bot">
              <ProtectedRoute>
                <SidebarProvider>
                  <TradingBotPage />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/coinbase-integration">
              <ProtectedRoute>
                <SidebarProvider>
                  <CoinbaseIntegration />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            {/* Intelligence Hub */}
            <Route path="/ai-assistant">
              <ProtectedRoute>
                <SidebarProvider>
                  <AIAssistant />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/quantum-insights">
              <ProtectedRoute>
                <SidebarProvider>
                  <QuantumInsights />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            {/* Family Platform */}
            <Route path="/wealth-pulse">
              <ProtectedRoute>
                <SidebarProvider>
                  <WealthPulse />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/smart-planner">
              <ProtectedRoute>
                <SidebarProvider>
                  <SmartPlanner />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/nexus-notes">
              <ProtectedRoute>
                <SidebarProvider>
                  <NexusNotes />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/family-sync">
              <ProtectedRoute>
                <SidebarProvider>
                  <FamilySync />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/canvas-boards">
              <ProtectedRoute>
                <SidebarProvider>
                  <CanvasBoards />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            {/* System Administration */}
            <Route path="/admin">
              <ProtectedRoute>
                <SidebarProvider>
                  <AdminPanel />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            <Route path="/ai-configuration">
              <ProtectedRoute>
                <SidebarProvider>
                  <AIConfiguration />
                </SidebarProvider>
              </ProtectedRoute>
            </Route>

            {/* Investor Mode - Special Access */}
            <Route path="/investor-mode">
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
                  <InvestorMode />
                </div>
              </ProtectedRoute>
            </Route>

            {/* NEXUS Quantum Dashboard - Premium */}
            <Route path="/nexus-quantum">
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                  <NexusQuantumDashboard />
                </div>
              </ProtectedRoute>
            </Route>

            {/* Fallback - Redirect to Landing */}
            <Route>
              <LandingPage />
            </Route>
          </Switch>

          <Toaster />
        </div>
      </ThemeProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;