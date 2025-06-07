import type { Express } from "express";
import { createServer, type Server } from "http";
import { cryptoTradingEngine } from "./crypto-trading-engine";
import { nexusObserver } from "./nexus-observer-core";
import { robinhoodLegendClient } from "./robinhood-legend-client";

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

  const httpServer = createServer(app);
  return httpServer;
}