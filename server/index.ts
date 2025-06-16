import express from "express";
import { registerAPIRoutes } from "./routes";
import { nexusIntelligence } from "./nexus-intelligence-orchestrator";
import { evolutionEngine } from "./recursive-evolution-engine";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for proper IP detection
app.set('trust proxy', true);

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'NEXUS Intelligence Platform'
  });
});

// Initialize NEXUS Intelligence System
async function initializeNEXUS() {
  console.log('🚀 Initializing NEXUS Intelligence Platform...');

  try {
    // Start Evolution Engine
    await evolutionEngine.startEvolution();
    console.log('✅ Recursive Evolution Engine started');

    // NEXUS Intelligence Orchestrator initializes automatically
    const status = await nexusIntelligence.getStatus();
    console.log('✅ NEXUS Intelligence Orchestrator operational');
    console.log(`🧠 System Health: ${status.systemHealth}%, Quantum IQ: ${status.quantumIQ}`);

    return true;
  } catch (error) {
    console.error('❌ NEXUS initialization failed:', error);
    return false;
  }
}

// Register all API routes
registerAPIRoutes(app);

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback to serve React app for any non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Initialize NEXUS system
    const nexusInitialized = await initializeNEXUS();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
      console.log(`🎯 NEXUS Intelligence: ${nexusInitialized ? 'OPERATIONAL' : 'LIMITED MODE'}`);
      console.log('🔮 Recursive Evolution: ACTIVE');
      console.log('🧠 Quantum AI: ENGAGED');
      console.log('⚡ All systems ready for non-regressive enhancement');
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    await evolutionEngine.stopEvolution();
    console.log('✅ Evolution Engine stopped');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the server
startServer();