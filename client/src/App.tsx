import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { Landing } from "./pages/Landing";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { EnhancedDashboard } from "./pages/EnhancedDashboard";
import { JoinFamily } from "./pages/JoinFamily";
import { AdminPanel } from "./pages/AdminPanel";
import { SmartPlanner } from "./pages/SmartPlanner";
import { WealthPulse } from "./pages/WealthPulse";
import { QuantumInsights } from "./pages/QuantumInsights";
import { NexusNotes } from "./pages/NexusNotes";
import { FamilySync } from "./pages/FamilySync";
import FamilyBoards from "./pages/FamilyBoardsSimple";
import AIConfiguration from "./pages/AIConfiguration";
import QNISAdmin from "./pages/QNISAdmin";
import CanvasBoards from "./pages/CanvasBoards";
import { AIAssistant } from "./pages/AIAssistant";
import QIEIntelligenceHub from "./pages/QIEIntelligenceHub";
import QIESignalPanel from "./pages/QIESignalPanel";
import QIEPromptDNA from "./pages/QIEPromptDNA";
import RecursiveEvolution from "./pages/RecursiveEvolution";
import { QuantumStealthDashboard } from "./components/QuantumStealthDashboard";
import { CoinbaseIntegration } from "./pages/CoinbaseIntegration";
import { useAuth } from "./hooks/useAuth";
import RealModeIndicator from "./components/RealModeIndicator";
import LiveTradingPanel from "./components/LiveTradingPanel";
import QIEEmbeddedPanel from "./components/QIEEmbeddedPanel";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <RealModeIndicator />}
      {isAuthenticated && <LiveTradingPanel />}
      {isAuthenticated && (
        <>
          <QIEEmbeddedPanel 
            panelId="enhanced_dashboard_intelligence" 
            type="mini_intelligence" 
            position="top_right" 
            dashboard="enhanced_dashboard" 
          />
          <QIEEmbeddedPanel 
            panelId="enhanced_dashboard_signals" 
            type="signal_feed" 
            position="bottom_left" 
            dashboard="enhanced_dashboard" 
          />
          <QIEEmbeddedPanel 
            panelId="enhanced_dashboard_ops" 
            type="ops_daemon" 
            position="floating" 
            dashboard="enhanced_dashboard" 
          />
        </>
      )}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/join/:token" component={JoinFamily} />
          </>
        ) : (
          <>
            <Route path="/" component={EnhancedDashboard} />
            <Route path="/smart-planner" component={SmartPlanner} />
            <Route path="/wealth-pulse" component={WealthPulse} />
            <Route path="/quantum-insights" component={QuantumInsights} />
            <Route path="/nexus-notes" component={NexusNotes} />
            <Route path="/family-sync" component={FamilySync} />
            <Route path="/family-boards" component={FamilyBoards} />
            <Route path="/canvas-boards" component={CanvasBoards} />
            <Route path="/ai-config" component={AIConfiguration} />
            <Route path="/qnis-admin" component={QNISAdmin} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route path="/qie-intelligence" component={QIEIntelligenceHub} />
            <Route path="/qie-signals" component={QIESignalPanel} />
            <Route path="/qie-prompt-dna" component={QIEPromptDNA} />
            <Route path="/recursive-evolution" component={RecursiveEvolution} />
            <Route path="/quantum-stealth" component={() => <QuantumStealthDashboard />} />
            <Route path="/coinbase-integration" component={CoinbaseIntegration} />
            {user?.role === "admin" && (
              <Route path="/admin" component={AdminPanel} />
            )}
          </>
        )}
        <Route>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-300">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="family-platform-theme">
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}