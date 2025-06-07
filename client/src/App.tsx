import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/pages/dashboard-simple";
const LiveTradingPage = PTNIDashboardCore;
import { AutomationPage } from "@/pages/automation";
import { BrowserPage } from "@/pages/browser";
import { QuantumAIPage } from "@/pages/quantum-ai";
import { GitHubBrainPage } from "@/pages/github-brain";
import { BIMInfinityPage } from "@/pages/bim-infinity";
import { ProofPuddingPage } from "@/pages/proof-pudding";
import { InfinitySovereignPage } from "@/pages/infinity-sovereign";
import { KaizenAgentPage } from "@/pages/kaizen-agent";
import { WatsonCommandPage } from "@/pages/watson-command";
import { UserManagementPage } from "@/pages/user-management";
import { InfinityUniformPage } from "@/pages/infinity-uniform";
import ParticlePlayground from "@/pages/particle-playground";
import TradingBotPage from "@/pages/trading-bot";
import SimpleTradingPage from "@/pages/simple-trading";
import PTNIDashboardCore from "@/components/ptni/ptni-dashboard-core";
import { PTNIDashboard } from "@/components/ptni/PTNIDashboard";
import { RobinhoodAccountStatus } from "@/components/RobinhoodAccountStatus";
import { RealModeController } from "@/components/RealModeController";
import QuantumTradingDashboardPage from "@/pages/quantum-trading-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/automation" component={AutomationPage} />
      <Route path="/browser" component={BrowserPage} />
      <Route path="/quantum-ai" component={QuantumAIPage} />
      <Route path="/github-brain" component={GitHubBrainPage} />
      <Route path="/bim-infinity" component={BIMInfinityPage} />
      <Route path="/proof-pudding" component={ProofPuddingPage} />
      <Route path="/infinity-sovereign" component={InfinitySovereignPage} />
      <Route path="/kaizen-agent" component={KaizenAgentPage} />
      <Route path="/watson-command" component={WatsonCommandPage} />
      <Route path="/user-management" component={UserManagementPage} />
      <Route path="/infinity-uniform" component={InfinityUniformPage} />
      <Route path="/particle-playground" component={ParticlePlayground} />
      <Route path="/trading-bot" component={TradingBotPage} />
      <Route path="/simple-trading" component={SimpleTradingPage} />
      <Route path="/live-trading" component={PTNIDashboardCore} />
      <Route path="/ptni-analytics" component={PTNIDashboard} />
      <Route path="/robinhood-account" component={RobinhoodAccountStatus} />
      <Route path="/quantum-trading-dashboard" component={QuantumTradingDashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
