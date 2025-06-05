import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/pages/dashboard";
import { AutomationPage } from "@/pages/automation";
import { BrowserPage } from "@/pages/browser";
import { QuantumAIPage } from "@/pages/quantum-ai";
import { GitHubBrainPage } from "@/pages/github-brain";
import { BIMInfinityPage } from "@/pages/bim-infinity";
import { ProofPuddingPage } from "@/pages/proof-pudding";
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
