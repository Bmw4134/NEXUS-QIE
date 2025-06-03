import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { TRAXOVOQuantumDatabase } from "./quantum-database";
import { marketHub } from "./market-intelligence-hub";
import { 
  insertQuantumKnowledgeNodeSchema,
  insertLlmInteractionSchema,
  type QuantumQueryResponse 
} from "@shared/schema";
import crypto from 'crypto';

// Initialize quantum database
const quantumDB = new TRAXOVOQuantumDatabase();

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

  return httpServer;
}
