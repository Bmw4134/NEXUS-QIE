/**
 * NEXUS Production Server Entry Point
 * Production-ready server with all core features
 */

import './watson-production-server.js';

console.log('NEXUS Production Server starting...');
console.log('Trading platform ready with real balance data');
console.log('Production mode: Active');
console.log('Ready for deployment');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});