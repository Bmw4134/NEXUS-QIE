
#!/usr/bin/env node

/**
 * Production Startup Script for NEXUS-QIE Platform
 * Ensures all systems are ready for deployment
 */

import { nexusStartupOrchestrator } from './nexus-startup-orchestrator.js';
import { deploymentController } from './deployment-controller.js';

async function startProduction() {
  try {
    console.log('🚀 Starting NEXUS-QIE Production Deployment...');
    
    // Initialize deployment controller
    const deploymentStatus = deploymentController.getDeploymentStatus();
    console.log(`📊 Deployment Hash: ${deploymentStatus.deploymentHash}`);
    
    // Start the main orchestrator
    await nexusStartupOrchestrator.startServer();
    
    console.log('✅ NEXUS-QIE Production Ready!');
    console.log('🌐 Platform URL: https://your-repl-name.your-username.repl.co');
    
  } catch (error) {
    console.error('❌ Production startup failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
});

startProduction();
