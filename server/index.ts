/**
 * NEXUS Emergency Server Entry Point
 * Bypasses all authentication and database dependencies
 */

import { nexusEmergencyServer } from './nexus-emergency-server';

async function main() {
  try {
    console.log('Initializing NEXUS Production Server...');
    process.env.NODE_ENV = 'production';
    await nexusEmergencyServer.start();
    
    console.log('NEXUS Production Server operational');
    console.log(`Port: ${nexusEmergencyServer.getPort()}`);
    console.log('Production mode: Active');
    console.log('Ready for deployment');
    
  } catch (error) {
    console.error('Production server startup failed:', error);
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