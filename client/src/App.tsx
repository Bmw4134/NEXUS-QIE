import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

// Authentication check with auto-bypass
const useAuth = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('family-access-token');
  const userData = localStorage.getItem('user_data');

  // Auto-set admin token for NEXUS-QIE access
  useEffect(() => {
    if (!token) {
      localStorage.setItem('family-access-token', 'nexus-qie-admin-token');
      localStorage.setItem('user_data', JSON.stringify({
        firstName: 'Quantum',
        role: 'admin',
        id: 'nexus-qie-user'
      }));
    }
  }, [token]);

  return {
    isAuthenticated: true, // Always authenticated for NEXUS-QIE
    user: userData ? JSON.parse(userData) : { firstName: 'Quantum', role: 'admin' },
    token: token || 'nexus-qie-admin-token'
  };
};

// Protected route wrapper - always allows access
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

function App() {
  // Auto-authenticate on app load
  useEffect(() => {
    const token = localStorage.getItem('family-access-token');
    if (!token) {
      localStorage.setItem('family-access-token', 'nexus-qie-admin-token');
      localStorage.setItem('user_data', JSON.stringify({
        firstName: 'Quantum',
        role: 'admin',
        id: 'nexus-qie-user'
      }));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nexus-qie-theme">
        <div className="min-h-screen bg-background">
          <Switch>
            {/* Public Routes */}
            <Route path="/login">
              <LoginPage />
            </Route>

            <Route path="/landing">
              <LandingPage />
            </Route>

            {/* Main Dashboard - Always accessible */}
            <Route path="/">
              <SidebarProvider>
                <Dashboard />
              </SidebarProvider>
            </Route>

            {/* Fallback */}
            <Route>
              <SidebarProvider>
                <Dashboard />
              </SidebarProvider>
            </Route>
          </Switch>

          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;