const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Balance endpoint
app.get('/api/account/balance', (req, res) => {
  res.json({
    totalBalance: 30,
    tradingBalance: 0,
    buyingPower: 0,
    totalEquity: 0,
    coinbaseBalance: 30,
    lastUpdated: new Date().toISOString()
  });
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'bm.watson34@gmail.com') {
    res.json({
      success: true,
      token: `token_${Date.now()}`,
      user: {
        id: '1',
        name: 'Watson Admin',
        email: email,
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});