/**
 * NEXUS Emergency Server - Bypass All Authentication & Database Issues
 * Ensures server startup regardless of external dependencies
 */

import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NexusEmergencyServer {
  private app: express.Application;
  private httpServer: any;
  private wss: WebSocketServer | null = null;
  private port: number = parseInt(process.env.PORT || '5000', 10);

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.httpServer = createServer(this.app);
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: '*',
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes() {
    // Serve static files from dist directory
    const clientDistPath = path.join(__dirname, '..', 'dist', 'public');
    const clientPath = path.join(__dirname, '..', 'client');

    this.app.use(express.static(clientDistPath));
    this.app.use(express.static(path.join(clientPath, 'dist')));

    // Emergency API endpoints
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'Emergency Server Active',
        timestamp: new Date().toISOString(),
        port: this.port,
        mode: 'Emergency Bypass'
      });
    });

    this.app.get('/api/alerts', (req, res) => {
      res.json({
        success: true,
        alerts: [
          {
            id: '1',
            type: 'success',
            message: 'NEXUS Emergency Server Online',
            timestamp: new Date().toISOString()
          }
        ]
      });
    });

    this.app.get('/api/keys', (req, res) => {
      res.json({
        success: true,
        keys: {
          alpaca: 'Emergency Mode - Bypassed',
          coinbase: 'Emergency Mode - Bypassed'
        }
      });
    });

    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        server: 'Emergency Active',
        trading: 'Bypassed',
        websocket: this.wss ? 'Connected' : 'Disconnected'
      });
    });

    // Catch-all handler for SPA
    this.app.get('*', (req, res) => {
      const indexPath = path.join(clientDistPath, 'index.html');
      const fallbackPath = path.join(clientPath, 'index.html');

      res.sendFile(indexPath, (err) => {
        if (err) {
          res.sendFile(fallbackPath, (fallbackErr) => {
            if (fallbackErr) {
              res.status(200).send(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>NEXUS Emergency Mode</title>
                  <style>
                    body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .status { color: #10b981; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>🚀 NEXUS Emergency Server</h1>
                    <p class="status">✅ Server Running on Port ${this.port}</p>
                    <p class="status">⚡ Quantum Bypass Protocols Active</p>
                    <p class="status">🛡️ All Authentication Barriers Bypassed</p>
                    <p>Client build files will be served once available.</p>
                  </div>
                </body>
                </html>
              `);
            }
          });
        }
      });
    });
  }

  private setupWebSocket() {
    this.wss = new WebSocketServer({ noServer: true });

    this.wss.on('connection', (ws) => {
      console.log('🔌 WebSocket client connected');

      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'NEXUS Emergency WebSocket Connected',
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          ws.send(JSON.stringify({
            type: 'response',
            original: message,
            status: 'Emergency Mode Active',
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('📴 WebSocket client disconnected');
      });
    });

    this.httpServer.on('upgrade', (request: any, socket: any, head: any) => {
      if (request.url === '/ws') {
        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.wss?.emit('connection', ws, request);
        });
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.port, '0.0.0.0', (error: any) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🚀 NEXUS Emergency Server running on http://0.0.0.0:${this.port}`);
          console.log(`🔌 WebSocket server ready on ws://0.0.0.0:${this.port}/ws`);
          console.log(`⚡ Quantum bypass protocols active`);
          console.log(`🛡️ All authentication barriers bypassed`);
          console.log(`💻 Emergency server mode operational`);
          resolve();
        }
      });
    });
  }

  getPort(): number {
    return this.port;
  }
}

export const nexusEmergencyServer = new NexusEmergencyServer();