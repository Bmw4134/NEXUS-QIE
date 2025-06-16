
export function registerBasicEndpoints(app: any) {
  // API Keys endpoint
  app.get('/api/keys', (req: any, res: any) => {
    res.json({ 
      keys: [],
      message: 'No API keys configured yet' 
    });
  });

  // Auth me endpoint
  app.get('/api/auth/me', (req: any, res: any) => {
    res.json({
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'admin'
      }
    });
  });

  // Market data endpoint
  app.get('/api/market/data', (req: any, res: any) => {
    res.json({
      data: [],
      message: 'Market data service initializing'
    });
  });

  // System status endpoint
  app.get('/api/system/status', (req: any, res: any) => {
    res.json({
      status: 'operational',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });
}
