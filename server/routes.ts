import type { Express } from "express";
import { createServer, type Server } from "http";
import { cryptoTradingEngine } from "./crypto-trading-engine";
import { nexusObserver } from "./nexus-observer-core";
import { robinhoodLegendClient } from "./robinhood-legend-client";
import { pionexTradingService } from "./pionex-trading-service";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize NEXUS Observer Core
  console.log('🧠 NEXUS Observer Core: Initializing...');
  const observerInitialized = await nexusObserver.initialize();
  if (observerInitialized) {
    console.log('👁️ NEXUS Observer: Real-time monitoring active');
    console.log('🔁 Human Simulation Core: Ready for automated user simulation');
  }

  // Initialize Robinhood Legend Platform
  console.log('🚀 Initializing Robinhood Legend Platform...');
  const legendInitialized = await robinhoodLegendClient.initialize();
  if (legendInitialized) {
    console.log('💰 Robinhood Legend: Connected to real account');
    console.log('⚡ Quantum crypto trading enabled');
  }

  // Crypto trading endpoints
  app.get("/api/crypto/assets", async (req, res) => {
    try {
      const assets = cryptoTradingEngine.getCryptoAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching crypto assets:", error);
      res.status(500).json({ error: "Failed to fetch crypto assets" });
    }
  });

  app.get("/api/crypto/positions", async (req, res) => {
    try {
      const positions = cryptoTradingEngine.getCryptoPositions();
      res.json(positions);
    } catch (error) {
      console.error("Error fetching crypto positions:", error);
      res.status(500).json({ error: "Failed to fetch crypto positions" });
    }
  });

  app.post("/api/crypto/trade", async (req, res) => {
    try {
      const { symbol, side, quantity, orderType = 'market', price } = req.body;
      
      const trade = await cryptoTradingEngine.executeCryptoTrade(
        symbol,
        side,
        quantity,
        orderType,
        price
      );
      
      res.json(trade);
    } catch (error) {
      console.error("Error executing crypto trade:", error);
      res.status(500).json({ error: "Failed to execute trade" });
    }
  });

  // NEXUS Observer endpoints
  app.get("/api/nexus/status", async (req, res) => {
    try {
      const report = await nexusObserver.generateStatusReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating status report:", error);
      res.status(500).json({ error: "Failed to generate status report" });
    }
  });

  app.get("/api/nexus/observer/metrics", async (req, res) => {
    try {
      const metrics = await nexusObserver.performHealthCheck();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching observer metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Robinhood Legend real money trading endpoints
  app.get("/api/robinhood/account", async (req, res) => {
    try {
      const account = robinhoodLegendClient.getAccount();
      res.json(account);
    } catch (error) {
      console.error("Error fetching Robinhood account:", error);
      res.status(500).json({ error: "Failed to fetch account data" });
    }
  });

  app.post("/api/robinhood/trade", async (req, res) => {
    try {
      const { symbol, side, amount, orderType = 'market', limitPrice } = req.body;
      
      console.log(`🚀 PTNI executing ${side.toUpperCase()} order: ${symbol} $${amount}`);
      
      const order = await robinhoodLegendClient.executeQuantumCryptoTrade(
        symbol,
        side,
        amount,
        orderType,
        limitPrice
      );
      
      res.json(order);
    } catch (error) {
      console.error("Error executing Robinhood trade:", error);
      res.status(500).json({ error: "Failed to execute trade" });
    }
  });

  app.get("/api/robinhood/portfolio", async (req, res) => {
    try {
      const portfolioValue = await robinhoodLegendClient.getPortfolioValue();
      const account = robinhoodLegendClient.getAccount();
      
      res.json({
        totalValue: portfolioValue,
        balance: account?.balance || 0,
        buyingPower: account?.buyingPower || 0,
        positions: account?.positions || []
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      services: {
        crypto_trading: "active",
        nexus_observer: "active",
        quantum_systems: "active",
        robinhood_legend: robinhoodLegendClient.isConnected() ? "connected" : "disconnected"
      }
    });
  });

  // Pionex.us API endpoints
  app.post("/api/pionex/setup", async (req, res) => {
    try {
      const { email, apiKey, secretKey, passphrase } = req.body;
      const success = await pionexTradingService.setupAccount({
        email,
        apiKey,
        secretKey,
        passphrase
      });
      
      if (success) {
        res.json({ success: true, message: "Pionex account connected successfully" });
      } else {
        res.status(400).json({ success: false, error: "Failed to connect Pionex account" });
      }
    } catch (error) {
      console.error("Pionex setup error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.get("/api/pionex/account", async (req, res) => {
    try {
      const account = pionexTradingService.getAccount();
      if (account) {
        res.json(account);
      } else {
        res.status(404).json({ error: "Pionex account not configured" });
      }
    } catch (error) {
      console.error("Pionex account error:", error);
      res.status(500).json({ error: "Failed to fetch Pionex account" });
    }
  });

  app.get("/api/pionex/bots", async (req, res) => {
    try {
      const bots = pionexTradingService.getActiveBots();
      res.json(bots);
    } catch (error) {
      console.error("Pionex bots error:", error);
      res.status(500).json({ error: "Failed to fetch Pionex bots" });
    }
  });

  app.post("/api/pionex/bot/grid", async (req, res) => {
    try {
      const { pair, investment, gridNumber, lowerPrice, upperPrice } = req.body;
      const botId = await pionexTradingService.createGridBot({
        pair,
        investment,
        gridNumber,
        lowerPrice,
        upperPrice
      });
      
      if (botId) {
        res.json({ success: true, botId });
      } else {
        res.status(400).json({ success: false, error: "Failed to create grid bot" });
      }
    } catch (error) {
      console.error("Pionex grid bot error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.post("/api/pionex/trade", async (req, res) => {
    try {
      const { pair, side, amount, type, price } = req.body;
      const trade = await pionexTradingService.executeTrade({
        pair,
        side,
        amount,
        type,
        price
      });
      
      if (trade) {
        res.json(trade);
      } else {
        res.status(400).json({ error: "Failed to execute Pionex trade" });
      }
    } catch (error) {
      console.error("Pionex trade error:", error);
      res.status(500).json({ error: "Failed to execute trade" });
    }
  });

  // Quantum Trading Bot activation
  app.post("/api/quantum/activate", async (req, res) => {
    try {
      const { tradingPair, investment, strategy } = req.body;
      
      // Activate quantum trading bot with real Robinhood Legend integration
      const activation = await robinhoodLegendClient.activateQuantumBot({
        pair: tradingPair || 'BTC/USD',
        investment: investment || 100,
        strategy: strategy || 'adaptive_grid',
        useRealMoney: true
      });
      
      if (activation.success) {
        res.json({
          success: true,
          botId: activation.botId,
          message: "Quantum trading bot activated with real money",
          balance: activation.remainingBalance
        });
      } else {
        res.status(400).json({ success: false, error: activation.error });
      }
    } catch (error) {
      console.error("Quantum bot activation error:", error);
      res.status(500).json({ success: false, error: "Failed to activate quantum bot" });
    }
  });

  app.get("/api/quantum/status", async (req, res) => {
    try {
      const status = await robinhoodLegendClient.getQuantumBotStatus();
      res.json(status);
    } catch (error) {
      console.error("Quantum bot status error:", error);
      res.status(500).json({ error: "Failed to get quantum bot status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}