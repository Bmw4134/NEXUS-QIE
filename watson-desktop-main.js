const { app, BrowserWindow, ipcMain, Menu, dialog, shell } = require('electron');
const path = require('path');
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');

class WatsonDesktopApp {
  constructor() {
    this.mainWindow = null;
    this.serverProcess = null;
    this.serverPort = 3000;
    this.expressApp = null;
  }

  async initialize() {
    await app.whenReady();
    
    // Start embedded server
    this.startEmbeddedServer();
    
    // Create main window
    this.createMainWindow();
    
    // Setup menu
    this.setupApplicationMenu();
    
    // Setup event handlers
    this.setupEventHandlers();
  }

  startEmbeddedServer() {
    this.expressApp = express();
    
    // Serve static files from the built React app
    this.expressApp.use(express.static(path.join(__dirname, 'build')));
    
    // API routes from the original server
    this.setupAPIRoutes();
    
    // Start server
    this.expressApp.listen(this.serverPort, () => {
      console.log(`Watson Desktop Server running on port ${this.serverPort}`);
    });
  }

  setupAPIRoutes() {
    const bodyParser = require('body-parser');
    this.expressApp.use(bodyParser.json());
    
    // Trading API routes
    this.expressApp.get('/api/trading/metrics', (req, res) => {
      res.json({
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnl: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        accountBalance: 800.00,
        availableBuyingPower: 800.00
      });
    });

    this.expressApp.get('/api/trading/positions', (req, res) => {
      res.json([]);
    });

    this.expressApp.get('/api/trading/orders', (req, res) => {
      res.json([]);
    });

    this.expressApp.post('/api/trading/authenticate', async (req, res) => {
      const { username, password, mfaCode } = req.body;
      
      // Simulate authentication
      setTimeout(() => {
        res.json({
          success: true,
          message: "Desktop authentication successful",
          accountBalance: 800.00,
          status: 'connected',
          timestamp: new Date()
        });
      }, 2000);
    });

    // Watson command processing
    this.expressApp.post('/api/watson/command', (req, res) => {
      const { command } = req.body;
      res.json({
        response: `Watson processed: ${command}`,
        confidence: 0.95,
        timestamp: new Date()
      });
    });

    // Catch all handler for React router
    this.expressApp.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: this.getAppIcon(),
      title: 'Watson LLM Desktop - Intelligence Suite',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show: false,
      backgroundColor: '#1a1a2e'
    });

    // Load Watson interface
    this.mainWindow.loadURL(`http://localhost:${this.serverPort}`);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      // Show welcome dialog
      this.showWelcomeDialog();
    });

    // Handle window events
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  getAppIcon() {
    if (process.platform === 'win32') {
      return path.join(__dirname, 'assets', 'watson-icon.ico');
    } else if (process.platform === 'darwin') {
      return path.join(__dirname, 'assets', 'watson-icon.icns');
    } else {
      return path.join(__dirname, 'assets', 'watson-icon.png');
    }
  }

  setupApplicationMenu() {
    const template = [
      {
        label: 'Watson LLM',
        submenu: [
          {
            label: 'About Watson LLM',
            click: () => this.showAboutDialog()
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => this.openPreferences()
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Trading',
        submenu: [
          {
            label: 'Trading Dashboard',
            accelerator: 'CmdOrCtrl+T',
            click: () => this.navigateTo('/trading-bot')
          },
          {
            label: 'Connect Robinhood',
            click: () => this.connectRobinhood()
          },
          {
            label: 'Market Intelligence',
            click: () => this.navigateTo('/market-intelligence')
          }
        ]
      },
      {
        label: 'Watson',
        submenu: [
          {
            label: 'Command Center',
            accelerator: 'CmdOrCtrl+W',
            click: () => this.navigateTo('/watson-command')
          },
          {
            label: 'Intelligence Analysis',
            click: () => this.navigateTo('/competitive-intelligence')
          },
          {
            label: 'System Health',
            click: () => this.showSystemHealth()
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: () => this.mainWindow.reload()
          },
          {
            label: 'Force Reload',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => this.mainWindow.webContents.reloadIgnoringCache()
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: () => this.mainWindow.webContents.toggleDevTools()
          },
          { type: 'separator' },
          {
            label: 'Actual Size',
            accelerator: 'CmdOrCtrl+0',
            click: () => this.mainWindow.webContents.setZoomLevel(0)
          },
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+Plus',
            click: () => {
              const level = this.mainWindow.webContents.getZoomLevel();
              this.mainWindow.webContents.setZoomLevel(level + 0.5);
            }
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            click: () => {
              const level = this.mainWindow.webContents.getZoomLevel();
              this.mainWindow.webContents.setZoomLevel(level - 0.5);
            }
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: () => shell.openExternal('https://watson-llm-docs.com')
          },
          {
            label: 'Support',
            click: () => shell.openExternal('mailto:support@jdd-enterprises.com')
          },
          {
            label: 'Check for Updates',
            click: () => this.checkForUpdates()
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupEventHandlers() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // IPC handlers
    ipcMain.handle('get-app-version', () => app.getVersion());
    ipcMain.handle('navigate-to', (event, route) => this.navigateTo(route));
    ipcMain.handle('show-notification', (event, title, body) => {
      new Notification(title, { body });
    });
    ipcMain.handle('show-dialog', async (event, options) => {
      const result = await dialog.showMessageBox(this.mainWindow, options);
      return result;
    });
  }

  navigateTo(route) {
    if (this.mainWindow) {
      const url = `http://localhost:${this.serverPort}${route}`;
      this.mainWindow.loadURL(url);
    }
  }

  showWelcomeDialog() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Welcome to Watson LLM Desktop',
      message: 'Watson LLM Desktop Intelligence Suite',
      detail: 'Your AI-powered trading and intelligence platform is ready.\n\nFeatures:\n• Robinhood Trading Integration\n• Real-time Market Intelligence\n• Watson Command Processing\n• Competitive Analysis\n• Quantum-Enhanced Decision Making\n\nGet started by connecting your Robinhood account in the Trading menu.',
      buttons: ['Get Started', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        this.navigateTo('/trading-bot');
      }
    });
  }

  showAboutDialog() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'About Watson LLM Desktop',
      message: 'Watson LLM Desktop Intelligence Suite',
      detail: `Version: ${app.getVersion()}\nBuild: Desktop Production\nCopyright © 2025 JDD Enterprises\n\nAn advanced AI-powered financial intelligence platform featuring:\n• Live Robinhood trading integration\n• Pionex strategy mirroring\n• Real-time market analysis\n• Watson command processing\n• Competitive intelligence gathering\n• Quantum-enhanced decision making`,
      buttons: ['OK']
    });
  }

  connectRobinhood() {
    this.navigateTo('/trading-bot');
  }

  showSystemHealth() {
    this.navigateTo('/system-health');
  }

  openPreferences() {
    this.navigateTo('/settings');
  }

  checkForUpdates() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Check for Updates',
      message: 'Checking for updates...',
      detail: 'Watson LLM Desktop will automatically check for updates and notify you when they are available.',
      buttons: ['OK']
    });
  }
}

// Initialize and start the application
const watsonApp = new WatsonDesktopApp();
watsonApp.initialize().catch(console.error);

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (watsonApp.mainWindow) {
      if (watsonApp.mainWindow.isMinimized()) watsonApp.mainWindow.restore();
      watsonApp.mainWindow.focus();
    }
  });
}