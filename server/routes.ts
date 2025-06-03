import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { NexusQuantumDatabase } from "./quantum-database";
import { marketHub } from "./market-intelligence-hub";
import { nexusResearch } from "./nexus-research-automation";
import { 
  insertQuantumKnowledgeNodeSchema,
  insertLlmInteractionSchema,
  type QuantumQueryResponse 
} from "@shared/schema";
import crypto from 'crypto';

// Initialize quantum database
const quantumDB = new NexusQuantumDatabase();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send initial stats
    sendStatsUpdate();
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send stats updates periodically
  async function sendStatsUpdate() {
    try {
      const stats = await storage.getDatabaseStats();
      const activity = await storage.getRecentActivity();
      const learningProgress = await storage.getLearningProgress();
      
      broadcast({
        type: 'stats_update',
        data: {
          stats,
          activity: activity.slice(0, 5),
          learningProgress
        }
      });
    } catch (error) {
      console.error('Error sending stats update:', error);
    }
  }

  // Periodic updates every 30 seconds
  setInterval(sendStatsUpdate, 30000);

  // API Routes
  
  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDatabaseStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get recent activity
  app.get("/api/dashboard/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Get learning progress
  app.get("/api/dashboard/learning-progress", async (req, res) => {
    try {
      const progress = await storage.getLearningProgress();
      res.json(progress);
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      res.status(500).json({ message: "Failed to fetch learning progress" });
    }
  });

  // Quantum query endpoint
  app.post("/api/quantum/query", async (req, res) => {
    try {
      const { query, context = "" } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required and must be a string" });
      }

      // Process query through quantum database
      const result = quantumDB.quantumQuery(query, context);
      
      // Store interaction in database
      const interaction = await storage.createLlmInteraction({
        interactionId: `int_${crypto.randomBytes(8).toString('hex')}`,
        query,
        response: result.responseText,
        confidence: result.confidence,
        quantumEnhancement: result.quantumEnhancement,
        sourceNodes: result.sourceNodes,
        reasoningChain: result.reasoningChain,
        computationalCost: result.computationalCost,
        timestamp: result.timestamp,
        userFeedback: null
      });

      // Broadcast query processed event
      broadcast({
        type: 'query_processed',
        data: {
          query,
          confidence: result.confidence,
          timestamp: result.timestamp
        }
      });

      // Send updated stats
      setTimeout(sendStatsUpdate, 1000);

      res.json({
        responseText: result.responseText,
        confidence: result.confidence,
        quantumEnhancement: result.quantumEnhancement,
        sourceNodes: result.sourceNodes,
        reasoningChain: result.reasoningChain,
        computationalCost: result.computationalCost,
        timestamp: result.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error processing quantum query:', error);
      res.status(500).json({ message: "Failed to process quantum query" });
    }
  });

  // Store knowledge endpoint
  app.post("/api/quantum/knowledge", async (req, res) => {
    try {
      const validatedData = insertQuantumKnowledgeNodeSchema.parse(req.body);
      
      // Store in quantum database
      const nodeId = quantumDB.storeQuantumKnowledge(
        validatedData.content,
        validatedData.context || "",
        validatedData.learnedFrom
      );

      // Store in persistent storage
      const node = await storage.createQuantumKnowledgeNode({
        ...validatedData,
        nodeId
      });

      // Broadcast new node created event
      broadcast({
        type: 'node_created',
        data: {
          nodeId,
          content: validatedData.content,
          timestamp: new Date()
        }
      });

      // Send updated stats
      setTimeout(sendStatsUpdate, 1000);

      res.json(node);
    } catch (error) {
      console.error('Error storing knowledge:', error);
      res.status(500).json({ message: "Failed to store knowledge" });
    }
  });

  // Get all knowledge nodes
  app.get("/api/quantum/knowledge", async (req, res) => {
    try {
      const nodes = await storage.getAllQuantumKnowledgeNodes();
      res.json(nodes);
    } catch (error) {
      console.error('Error fetching knowledge nodes:', error);
      res.status(500).json({ message: "Failed to fetch knowledge nodes" });
    }
  });

  // Get knowledge graph data
  app.get("/api/quantum/knowledge-graph", async (req, res) => {
    try {
      const nodes = await storage.getAllQuantumKnowledgeNodes();
      
      // Transform nodes for graph visualization
      const graphNodes = nodes.map(node => ({
        id: node.nodeId,
        label: node.content.substring(0, 50) + "...",
        confidence: node.confidence,
        asiLevel: node.asiEnhancementLevel,
        quantumState: node.quantumState,
        group: node.context || "general"
      }));

      const graphEdges = nodes.flatMap(node =>
        node.connections.map(targetId => ({
          from: node.nodeId,
          to: targetId,
          strength: Math.random() * 0.5 + 0.5 // Simulated connection strength
        }))
      ).filter(edge => 
        // Only include edges where both nodes exist
        nodes.some(n => n.nodeId === edge.to)
      );

      res.json({
        nodes: graphNodes,
        edges: graphEdges,
        stats: {
          totalNodes: graphNodes.length,
          totalEdges: graphEdges.length,
          clusters: new Set(graphNodes.map(n => n.group)).size
        }
      });
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      res.status(500).json({ message: "Failed to fetch knowledge graph" });
    }
  });

  // Get LLM interactions history
  app.get("/api/quantum/interactions", async (req, res) => {
    try {
      const interactions = await storage.getAllLlmInteractions();
      res.json(interactions);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // ==================== MARKET INTELLIGENCE API ENDPOINTS ====================
  
  // Real-time market data from multiple sources
  app.get("/api/market/data", async (req, res) => {
    try {
      const { source, limit } = req.query;
      const data = marketHub.getMarketData(
        source as string, 
        parseInt(limit as string) || 50
      );
      res.json(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Economic indicators and calendar events
  app.get("/api/market/economic", async (req, res) => {
    try {
      const { country, limit } = req.query;
      const data = marketHub.getEconomicData(
        country as string,
        parseInt(limit as string) || 20
      );
      res.json(data);
    } catch (error) {
      console.error('Error fetching economic data:', error);
      res.status(500).json({ message: "Failed to fetch economic data" });
    }
  });

  // Financial news aggregation with sentiment analysis
  app.get("/api/market/news", async (req, res) => {
    try {
      const { sentiment, limit } = req.query;
      const data = marketHub.getNewsData(
        sentiment as string,
        parseInt(limit as string) || 20
      );
      res.json(data);
    } catch (error) {
      console.error('Error fetching news data:', error);
      res.status(500).json({ message: "Failed to fetch news data" });
    }
  });

  // Cryptocurrency market data
  app.get("/api/market/crypto", async (req, res) => {
    try {
      const { limit } = req.query;
      const data = marketHub.getCryptoData(parseInt(limit as string) || 20);
      res.json(data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      res.status(500).json({ message: "Failed to fetch crypto data" });
    }
  });

  // Commodities pricing
  app.get("/api/market/commodities", async (req, res) => {
    try {
      const { limit } = req.query;
      const data = marketHub.getCommodityData(parseInt(limit as string) || 20);
      res.json(data);
    } catch (error) {
      console.error('Error fetching commodity data:', error);
      res.status(500).json({ message: "Failed to fetch commodity data" });
    }
  });

  // AI model performance metrics
  app.get("/api/market/ai-metrics", async (req, res) => {
    try {
      const { limit } = req.query;
      const data = marketHub.getAIMetrics(parseInt(limit as string) || 10);
      res.json(data);
    } catch (error) {
      console.error('Error fetching AI metrics:', error);
      res.status(500).json({ message: "Failed to fetch AI metrics" });
    }
  });

  // Comprehensive market summary
  app.get("/api/market/summary", async (req, res) => {
    try {
      const summary = marketHub.getMarketSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching market summary:', error);
      res.status(500).json({ message: "Failed to fetch market summary" });
    }
  });

  // Real-time market alerts and signals
  app.get("/api/market/alerts", async (req, res) => {
    try {
      const marketData = marketHub.getMarketData('', 10);
      const cryptoData = marketHub.getCryptoData(5);
      const newsData = marketHub.getNewsData('', 5);
      
      const alerts = [];
      
      // Price movement alerts
      marketData.forEach(data => {
        if (Math.abs(data.change) > 5) {
          alerts.push({
            type: 'price_movement',
            severity: Math.abs(data.change) > 10 ? 'high' : 'medium',
            message: `${data.symbol} moved ${data.change.toFixed(2)}%`,
            timestamp: data.timestamp
          });
        }
      });
      
      // Crypto volatility alerts
      cryptoData.forEach(crypto => {
        if (Math.abs(crypto.change24h) > 15) {
          alerts.push({
            type: 'crypto_volatility',
            severity: 'high',
            message: `${crypto.symbol} volatile: ${crypto.change24h.toFixed(2)}%`,
            timestamp: crypto.timestamp
          });
        }
      });
      
      // News sentiment alerts
      const negativeNews = newsData.filter(news => news.sentiment === 'negative');
      if (negativeNews.length > 3) {
        alerts.push({
          type: 'market_sentiment',
          severity: 'medium',
          message: `High negative sentiment detected in financial news`,
          timestamp: new Date()
        });
      }
      
      res.json(alerts);
    } catch (error) {
      console.error('Error generating market alerts:', error);
      res.status(500).json({ message: "Failed to generate market alerts" });
    }
  });

  // Market correlation analysis
  app.get("/api/market/correlations", async (req, res) => {
    try {
      const marketData = marketHub.getMarketData('', 50);
      const cryptoData = marketHub.getCryptoData(20);
      
      // Calculate basic correlations between major assets
      const correlations = [];
      
      const symbols = [...new Set(marketData.map(d => d.symbol))];
      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          const symbol1Data = marketData.filter(d => d.symbol === symbols[i]);
          const symbol2Data = marketData.filter(d => d.symbol === symbols[j]);
          
          if (symbol1Data.length > 5 && symbol2Data.length > 5) {
            // Simple correlation calculation
            const correlation = Math.random() * 2 - 1; // Placeholder for actual correlation
            correlations.push({
              pair: `${symbols[i]}-${symbols[j]}`,
              correlation: correlation.toFixed(3),
              strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                       Math.abs(correlation) > 0.3 ? 'moderate' : 'weak'
            });
          }
        }
      }
      
      res.json(correlations.slice(0, 20));
    } catch (error) {
      console.error('Error calculating correlations:', error);
      res.status(500).json({ message: "Failed to calculate correlations" });
    }
  });

  // Market intelligence search
  app.post("/api/market/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const searchResults = {
        markets: marketHub.getMarketData('', 100).filter(d => 
          d.symbol.toLowerCase().includes(query.toLowerCase())
        ),
        news: marketHub.getNewsData('', 50).filter(n => 
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.content.toLowerCase().includes(query.toLowerCase())
        ),
        crypto: marketHub.getCryptoData(50).filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.symbol.toLowerCase().includes(query.toLowerCase())
        ),
        economic: marketHub.getEconomicData('', 50).filter(e => 
          e.name.toLowerCase().includes(query.toLowerCase())
        )
      };
      
      res.json(searchResults);
    } catch (error) {
      console.error('Error performing market search:', error);
      res.status(500).json({ message: "Failed to perform market search" });
    }
  });

  // ==================== NEXUS RESEARCH AUTOMATION API ====================
  
  // Get all research targets
  app.get("/api/research/targets", async (req, res) => {
    try {
      const targets = nexusResearch.getResearchTargets();
      res.json(targets);
    } catch (error) {
      console.error('Error fetching research targets:', error);
      res.status(500).json({ message: "Failed to fetch research targets" });
    }
  });

  // Add new research target
  app.post("/api/research/targets", async (req, res) => {
    try {
      const { name, url, type, selectors, frequency } = req.body;
      
      if (!name || !url || !type) {
        return res.status(400).json({ message: "Name, URL, and type are required" });
      }

      const targetId = nexusResearch.addResearchTarget({
        id: `target_${Date.now()}`,
        name,
        url,
        type,
        selectors: selectors || {},
        frequency: frequency || 10,
        isActive: true
      });

      res.json({ id: targetId, message: "Research target added successfully" });
    } catch (error) {
      console.error('Error adding research target:', error);
      res.status(500).json({ message: "Failed to add research target" });
    }
  });

  // Remove research target
  app.delete("/api/research/targets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const removed = nexusResearch.removeResearchTarget(id);
      
      if (removed) {
        res.json({ message: "Research target removed successfully" });
      } else {
        res.status(404).json({ message: "Research target not found" });
      }
    } catch (error) {
      console.error('Error removing research target:', error);
      res.status(500).json({ message: "Failed to remove research target" });
    }
  });

  // Get automation rules
  app.get("/api/research/rules", async (req, res) => {
    try {
      const rules = nexusResearch.getAutomationRules();
      res.json(rules);
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      res.status(500).json({ message: "Failed to fetch automation rules" });
    }
  });

  // Add automation rule
  app.post("/api/research/rules", async (req, res) => {
    try {
      const { name, trigger, conditions, actions } = req.body;
      
      if (!name || !trigger || !conditions || !actions) {
        return res.status(400).json({ message: "Name, trigger, conditions, and actions are required" });
      }

      const ruleId = nexusResearch.addAutomationRule({
        id: `rule_${Date.now()}`,
        name,
        trigger,
        conditions,
        actions,
        isActive: true
      });

      res.json({ id: ruleId, message: "Automation rule added successfully" });
    } catch (error) {
      console.error('Error adding automation rule:', error);
      res.status(500).json({ message: "Failed to add automation rule" });
    }
  });

  // Get research metrics and status
  app.get("/api/research/metrics", async (req, res) => {
    try {
      const metrics = nexusResearch.getResearchMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching research metrics:', error);
      res.status(500).json({ message: "Failed to fetch research metrics" });
    }
  });

  // Manual research execution
  app.post("/api/research/execute", async (req, res) => {
    try {
      const { targetId } = req.body;
      
      if (!targetId) {
        return res.status(400).json({ message: "Target ID is required" });
      }

      // Execute research for specific target
      const result = await (nexusResearch as any).executeResearch(targetId);
      
      if (result) {
        res.json({ 
          message: "Research executed successfully", 
          data: {
            id: result.id,
            quality: result.quality,
            confidence: result.confidence,
            timestamp: result.timestamp
          }
        });
      } else {
        res.status(500).json({ message: "Research execution failed" });
      }
    } catch (error) {
      console.error('Error executing research:', error);
      res.status(500).json({ message: "Failed to execute research" });
    }
  });

  // Research data search
  app.post("/api/research/search", async (req, res) => {
    try {
      const { query, type, startDate, endDate } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Get quantum knowledge nodes from research
      const nodes = await storage.getAllQuantumKnowledgeNodes();
      
      const researchNodes = nodes.filter(node => {
        const matchesQuery = node.content.toLowerCase().includes(query.toLowerCase()) ||
                           node.context?.toLowerCase().includes(query.toLowerCase());
        const isResearchNode = node.learnedFrom === 'nexus_automation';
        const matchesType = !type || node.quantumSignature?.includes(type);
        
        let matchesDate = true;
        if (startDate || endDate) {
          const nodeDate = new Date(node.timestamp);
          if (startDate) matchesDate = matchesDate && nodeDate >= new Date(startDate);
          if (endDate) matchesDate = matchesDate && nodeDate <= new Date(endDate);
        }
        
        return matchesQuery && isResearchNode && matchesType && matchesDate;
      });

      res.json({
        results: researchNodes.map(node => ({
          id: node.nodeId,
          content: node.content,
          context: node.context,
          confidence: node.confidence,
          timestamp: node.timestamp,
          type: node.quantumSignature?.split('_')[1] || 'unknown'
        })),
        total: researchNodes.length
      });
    } catch (error) {
      console.error('Error searching research data:', error);
      res.status(500).json({ message: "Failed to search research data" });
    }
  });

  // Setup market data callbacks for real-time updates
  marketHub.onDataUpdate((data) => {
    broadcast({
      type: 'market_update',
      data: {
        summary: data.summary,
        latest: {
          market: data.market.slice(-5),
          crypto: data.crypto.slice(-5),
          news: data.news.slice(-3)
        },
        timestamp: new Date()
      }
    });
  });

  return httpServer;
}
