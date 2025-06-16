/**
 * NEXUS Main Server Entry Point
 * Utilizes the NEXUS Startup Orchestrator for comprehensive initialization
 */

import { nexusStartupOrchestrator } from './nexus-startup-orchestrator';

async function main() {
  try {
    console.log('🔄 Initializing NEXUS Enterprise Platform...');
    await nexusStartupOrchestrator.startServer();
    
    // Log successful startup
    const status = nexusStartupOrchestrator.getServerStatus();
    console.log('✅ NEXUS Platform fully operational');
    console.log(`📊 System Health: ${status.systemHealth}%`);
    console.log(`🧠 Active Modules: ${Object.keys(status.modules).length}`);
    
  } catch (error) {
    console.error('❌ NEXUS Platform startup failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error('❌ Fatal error during startup:', error);
  process.exit(1);
});