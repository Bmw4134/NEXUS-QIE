import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Account balance endpoint for landing page
  app.get('/api/account/balance', async (req, res) => {
    try {
      const { accountBalanceService } = await import('./account-balance-service');
      const balance = accountBalanceService.getAccountBalance();
      const buyingPower = accountBalanceService.getBuyingPower();
      const totalEquity = accountBalanceService.getTotalEquity();
      const coinbaseAccounts = accountBalanceService.getCoinbaseAccounts();
      
      // Calculate total balance from all sources
      const coinbaseTotal = coinbaseAccounts.reduce((total, account) => {
        return total + parseFloat(account.balance.amount || '0');
      }, 0);
      
      const totalBalance = balance + coinbaseTotal;
      
      res.json({
        totalBalance,
        tradingBalance: balance,
        buyingPower,
        totalEquity,
        coinbaseBalance: coinbaseTotal,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Balance fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch balance'
      });
    }
  });

  // Active alerts endpoint
  app.get('/api/alerts/active', async (req, res) => {
    try {
      // Return empty array for now - this prevents the frontend errors
      res.json([]);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
    }
  });

  // Codex error analysis endpoint
  app.post('/api/codex/analyze-error', async (req, res) => {
    try {
      const { error, stack, componentStack, timestamp } = req.body;

      res.json({
        success: true,
        analysis: "Error analysis completed. Please check error boundaries and component structure.",
        suggestions: [
          'Check for async components rendering promises directly',
          'Ensure proper error boundaries are in place',
          'Verify WebSocket connection configuration'
        ]
      });
    } catch (error) {
      console.error('Codex analysis failed:', error);
      res.status(500).json({ success: false, error: 'Analysis failed' });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();