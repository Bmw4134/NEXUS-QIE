# NEXUS Research Automation - Complete Integration Guide

## Overview
The NEXUS Research Automation module provides intelligent web scraping and market research capabilities using Puppeteer for automated data collection from financial websites.

## Core Features

### Automated Research Targets
- **Bloomberg Markets** - Financial news and market data
- **Yahoo Finance Trending** - Real-time stock trends
- **CoinMarketCap** - Cryptocurrency market movements
- **Investing.com Economic Calendar** - Economic events
- **Finviz News** - Market news aggregation

### Intelligent Automation Rules
- **High Volatility Detection** - Triggers on price movements >5%
- **Breaking News Monitoring** - Keyword-based news alerts
- **Market Opening Research** - Scheduled data collection
- **Volume Spike Alerts** - Unusual trading activity detection

## API Endpoints

### Research Targets Management
```
GET    /api/research/targets          # Get all research targets
POST   /api/research/targets          # Add new research target
DELETE /api/research/targets/:id      # Remove research target
```

### Automation Rules
```
GET    /api/research/rules            # Get automation rules
POST   /api/research/rules            # Add automation rule
```

### Research Execution
```
POST   /api/research/execute          # Manual research execution
POST   /api/research/search           # Search research data
GET    /api/research/metrics          # Get system metrics
```

## API Usage Examples

### Adding a Research Target
```javascript
const response = await fetch('/api/research/targets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'SEC Filings Monitor',
    url: 'https://www.sec.gov/edgar/searchedgar/recent',
    type: 'financial',
    selectors: {
      title: '.company-name',
      content: '.filing-type',
      timestamp: '.filing-date'
    },
    frequency: 30 // minutes
  })
});
```

### Creating Automation Rules
```javascript
const response = await fetch('/api/research/rules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Earnings Alert System',
    trigger: 'news_keyword',
    conditions: {
      keywords: ['earnings', 'quarterly', 'results'],
      sources: ['bloomberg', 'reuters']
    },
    actions: [
      {
        type: 'scrape',
        target: 'all_financial_targets',
        parameters: { priority: 'high' }
      },
      {
        type: 'alert',
        target: 'earnings_notification',
        parameters: { severity: 'medium' }
      }
    ]
  })
});
```

### Manual Research Execution
```javascript
const response = await fetch('/api/research/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetId: 'bloomberg_markets'
  })
});

const result = await response.json();
// Returns: { message, data: { id, quality, confidence, timestamp } }
```

### Searching Research Data
```javascript
const response = await fetch('/api/research/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'interest rates',
    type: 'financial',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});

const results = await response.json();
// Returns: { results: [...], total: number }
```

## Frontend Integration

### React Hook for Research Data
```javascript
import { useQuery } from '@tanstack/react-query';

function useResearchData() {
  return useQuery({
    queryKey: ['/api/research/targets'],
    refetchInterval: 60000 // Refresh every minute
  });
}

function ResearchDashboard() {
  const { data: targets, isLoading } = useResearchData();
  
  const executeResearch = async (targetId) => {
    await fetch('/api/research/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId })
    });
  };

  return (
    <div className="research-dashboard">
      <h2>Active Research Targets</h2>
      {targets?.map(target => (
        <div key={target.id} className="target-card">
          <h3>{target.name}</h3>
          <p>Type: {target.type}</p>
          <p>Frequency: {target.frequency} minutes</p>
          <button onClick={() => executeResearch(target.id)}>
            Execute Now
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Real-time Research Updates
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'research_update') {
    console.log('New research data:', data.data);
    updateResearchDashboard(data.data);
  }
};
```

## Configuration Examples

### Custom Research Targets
```javascript
const customTargets = [
  {
    name: 'Federal Reserve Speeches',
    url: 'https://www.federalreserve.gov/newsevents/speeches.htm',
    type: 'economic',
    selectors: {
      title: '.speech-title',
      content: '.speech-summary',
      timestamp: '.speech-date'
    },
    frequency: 60
  },
  {
    name: 'Treasury Yield Curves',
    url: 'https://www.treasury.gov/resource-center/data-chart-center/interest-rates/',
    type: 'financial',
    selectors: {
      title: '.yield-curve-header',
      content: '.yield-data',
      timestamp: '.data-date'
    },
    frequency: 15
  }
];
```

### Advanced Automation Rules
```javascript
const advancedRules = [
  {
    name: 'Corporate Earnings Surveillance',
    trigger: 'time_based',
    conditions: {
      time: '07:00',
      timezone: 'EST',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    actions: [
      {
        type: 'scrape',
        target: 'earnings_calendar',
        parameters: { depth: 'comprehensive' }
      },
      {
        type: 'analyze',
        target: 'earnings_sentiment',
        parameters: { ai_model: 'advanced' }
      }
    ]
  },
  {
    name: 'Geopolitical Risk Monitor',
    trigger: 'news_keyword',
    conditions: {
      keywords: ['sanctions', 'trade war', 'conflict', 'crisis'],
      urgency: 'high'
    },
    actions: [
      {
        type: 'scrape',
        target: 'global_news_sources',
        parameters: { immediate: true }
      },
      {
        type: 'alert',
        target: 'risk_team',
        parameters: { priority: 'critical' }
      }
    ]
  }
];
```

## Data Flow Architecture

### Research Pipeline
```
Web Sources → Puppeteer Scraping → Data Validation → Quantum Storage → AI Analysis → Dashboard Display
```

### Processing Stages
1. **Target Scheduling** - Automated execution based on frequency
2. **Data Extraction** - Puppeteer-based web scraping
3. **Quality Assessment** - Data completeness and accuracy scoring
4. **Quantum Storage** - Integration with knowledge database
5. **Rule Evaluation** - Trigger-based automation execution
6. **Real-time Broadcasting** - WebSocket updates to frontend

## System Metrics

### Performance Monitoring
```javascript
const metrics = await fetch('/api/research/metrics').then(r => r.json());

console.log({
  totalTargets: metrics.totalTargets,
  activeTargets: metrics.activeTargets,
  totalScrapes: metrics.totalScrapes,
  rulesActive: metrics.rulesActive,
  isRunning: metrics.isRunning,
  lastUpdate: metrics.lastUpdate
});
```

### Data Quality Indicators
- **Quality Score**: 0-1 based on data completeness
- **Confidence Level**: 0-1 based on source reliability
- **Freshness**: Time since last successful scrape
- **Success Rate**: Percentage of successful scraping attempts

## Error Handling

### Robust Scraping Strategy
```javascript
// Built-in error recovery
try {
  await page.goto(target.url, { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });
} catch (error) {
  console.error(`Navigation failed for ${target.name}:`, error);
  // Automatic retry with fallback selectors
}
```

### Rate Limiting Protection
- Configurable delays between requests
- User-agent rotation
- Request header randomization
- Graceful handling of anti-bot measures

## Security Considerations

### Safe Scraping Practices
- Respect robots.txt files
- Implement request throttling
- Use appropriate user agents
- Handle captcha challenges gracefully

### Data Privacy
- No personal data collection
- Public information only
- Compliance with website terms of service
- Automatic data retention policies

## Deployment Configuration

### Environment Variables
```bash
# Puppeteer Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_HEADLESS=true

# Research Settings
RESEARCH_MAX_CONCURRENT=5
RESEARCH_TIMEOUT=30000
RESEARCH_RETRY_ATTEMPTS=3
```

### Production Optimizations
```javascript
// Browser pool management
const browserPool = {
  maxBrowsers: 3,
  maxPages: 10,
  timeout: 60000,
  retries: 2
};

// Memory optimization
const pageOptions = {
  args: [
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
};
```

## Integration with External APIs

### Premium Data Sources
To enhance research capabilities with premium APIs, you'll need API keys for:

- **Alpha Vantage** - Enhanced stock data
- **Quandl** - Economic datasets
- **News API** - Structured news feeds
- **Financial Modeling Prep** - Corporate financials

### API Key Configuration
```bash
# Add these to your environment
ALPHA_VANTAGE_API_KEY=your_key_here
QUANDL_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
FMP_API_KEY=your_key_here
```

## Monitoring and Alerting

### System Health Checks
```javascript
setInterval(async () => {
  const metrics = await fetch('/api/research/metrics').then(r => r.json());
  
  if (!metrics.isRunning) {
    alert('Research automation system is down');
  }
  
  if (metrics.activeTargets === 0) {
    alert('No active research targets configured');
  }
}, 60000);
```

### Performance Alerts
- Browser crash detection
- Network timeout monitoring
- Data quality degradation alerts
- Storage capacity warnings

This comprehensive research automation system provides enterprise-grade web scraping capabilities with intelligent rule-based automation for financial market research.