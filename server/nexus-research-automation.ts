import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage';

export interface ResearchTarget {
  id: string;
  name: string;
  url: string;
  type: 'financial' | 'news' | 'economic' | 'crypto' | 'technical';
  selectors: {
    title?: string;
    content?: string;
    price?: string;
    change?: string;
    volume?: string;
    timestamp?: string;
  };
  frequency: number; // minutes between scrapes
  lastScraped: Date;
  isActive: boolean;
}

export interface ResearchData {
  id: string;
  targetId: string;
  data: Record<string, any>;
  timestamp: Date;
  quality: number; // 0-1 data quality score
  confidence: number; // 0-1 confidence in data accuracy
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'price_change' | 'news_keyword' | 'time_based' | 'volume_spike';
  conditions: Record<string, any>;
  actions: Array<{
    type: 'scrape' | 'alert' | 'analyze' | 'store';
    target: string;
    parameters: Record<string, any>;
  }>;
  isActive: boolean;
}

export class NexusResearchAutomation {
  private browser: Browser | null = null;
  private activePages: Map<string, Page> = new Map();
  private researchTargets: Map<string, ResearchTarget> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    this.initializeBrowser();
    this.setupDefaultTargets();
    this.setupDefaultRules();
  }

  // ==================== INITIALIZATION ====================
  private async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
      console.log('Nexus Research Browser initialized');
      this.isRunning = true;
      this.startAutomation();
    } catch (error) {
      console.error('Browser initialization failed:', error);
    }
  }

  private setupDefaultTargets() {
    const targets: ResearchTarget[] = [
      {
        id: 'bloomberg_markets',
        name: 'Bloomberg Markets',
        url: 'https://www.bloomberg.com/markets',
        type: 'financial',
        selectors: {
          title: 'h1, h2, h3',
          content: '.story-body, .article-body',
          timestamp: 'time, .timestamp'
        },
        frequency: 5, // 5 minutes
        lastScraped: new Date(0),
        isActive: true
      },
      {
        id: 'yahoo_finance_trending',
        name: 'Yahoo Finance Trending',
        url: 'https://finance.yahoo.com/trending-tickers',
        type: 'financial',
        selectors: {
          title: '[data-symbol]',
          price: '[data-field="regularMarketPrice"]',
          change: '[data-field="regularMarketChangePercent"]'
        },
        frequency: 2,
        lastScraped: new Date(0),
        isActive: true
      },
      {
        id: 'coinmarketcap_trending',
        name: 'CoinMarketCap Trending',
        url: 'https://coinmarketcap.com/trending-cryptocurrencies/',
        type: 'crypto',
        selectors: {
          title: '.cmc-table__cell--sort-by__symbol',
          price: '.cmc-table__cell--sort-by__price',
          change: '.cmc-table__cell--sort-by__percent-change-24-h'
        },
        frequency: 3,
        lastScraped: new Date(0),
        isActive: true
      },
      {
        id: 'investing_economic_calendar',
        name: 'Investing.com Economic Calendar',
        url: 'https://www.investing.com/economic-calendar/',
        type: 'economic',
        selectors: {
          title: '.left.event',
          content: '.time, .currency, .impact',
          timestamp: '.first.left'
        },
        frequency: 15,
        lastScraped: new Date(0),
        isActive: true
      },
      {
        id: 'finviz_market_news',
        name: 'Finviz Market News',
        url: 'https://finviz.com/news.ashx',
        type: 'news',
        selectors: {
          title: '.news-link-container a',
          timestamp: '.news-datetime'
        },
        frequency: 10,
        lastScraped: new Date(0),
        isActive: true
      }
    ];

    targets.forEach(target => {
      this.researchTargets.set(target.id, target);
    });
  }

  private setupDefaultRules() {
    const rules: AutomationRule[] = [
      {
        id: 'high_volatility_alert',
        name: 'High Volatility Detection',
        trigger: 'price_change',
        conditions: {
          changePercent: { gt: 5 },
          volume: { gt: 1000000 }
        },
        actions: [
          {
            type: 'scrape',
            target: 'bloomberg_markets',
            parameters: { priority: 'high' }
          },
          {
            type: 'analyze',
            target: 'sentiment_analysis',
            parameters: { depth: 'deep' }
          }
        ],
        isActive: true
      },
      {
        id: 'breaking_news_monitor',
        name: 'Breaking News Monitor',
        trigger: 'news_keyword',
        conditions: {
          keywords: ['breaking', 'alert', 'urgent', 'market', 'crash', 'surge'],
          sources: ['bloomberg', 'reuters', 'cnbc']
        },
        actions: [
          {
            type: 'scrape',
            target: 'all_news_sources',
            parameters: { immediate: true }
          },
          {
            type: 'store',
            target: 'high_priority_news',
            parameters: { priority: 'critical' }
          }
        ],
        isActive: true
      },
      {
        id: 'market_open_research',
        name: 'Market Opening Research',
        trigger: 'time_based',
        conditions: {
          time: '09:30',
          timezone: 'EST',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        actions: [
          {
            type: 'scrape',
            target: 'all_financial_targets',
            parameters: { batch: true }
          }
        ],
        isActive: true
      }
    ];

    rules.forEach(rule => {
      this.automationRules.set(rule.id, rule);
    });
  }

  // ==================== AUTOMATION ENGINE ====================
  private startAutomation() {
    if (!this.isRunning) return;

    // Schedule all research targets
    this.researchTargets.forEach((target, targetId) => {
      if (target.isActive) {
        this.scheduleTarget(targetId);
      }
    });

    // Setup rule monitoring
    this.startRuleMonitoring();

    console.log('Nexus Research Automation started');
  }

  private scheduleTarget(targetId: string) {
    const target = this.researchTargets.get(targetId);
    if (!target) return;

    const intervalMs = target.frequency * 60 * 1000;
    
    const task = setInterval(async () => {
      await this.executeResearch(targetId);
    }, intervalMs);

    this.scheduledTasks.set(targetId, task);

    // Execute immediately if never scraped
    if (target.lastScraped.getTime() === 0) {
      this.executeResearch(targetId);
    }
  }

  private startRuleMonitoring() {
    // Monitor rules every 30 seconds
    setInterval(() => {
      this.automationRules.forEach((rule, ruleId) => {
        if (rule.isActive) {
          this.evaluateRule(ruleId);
        }
      });
    }, 30000);
  }

  // ==================== RESEARCH EXECUTION ====================
  private async executeResearch(targetId: string): Promise<ResearchData | null> {
    const target = this.researchTargets.get(targetId);
    if (!target || !this.browser) return null;

    try {
      console.log(`Executing research for: ${target.name}`);
      
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Navigate with timeout
      await page.goto(target.url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Extract data based on selectors
      const extractedData = await page.evaluate((selectors) => {
        const data: Record<string, any> = {};
        
        Object.entries(selectors).forEach(([key, selector]) => {
          if (selector) {
            const elements = document.querySelectorAll(selector);
            data[key] = Array.from(elements).map(el => ({
              text: el.textContent?.trim(),
              href: el.getAttribute('href'),
              html: el.innerHTML
            })).filter(item => item.text);
          }
        });
        
        return data;
      }, target.selectors);

      await page.close();

      // Process and validate data
      const researchData: ResearchData = {
        id: `research_${targetId}_${Date.now()}`,
        targetId,
        data: extractedData,
        timestamp: new Date(),
        quality: this.calculateDataQuality(extractedData),
        confidence: this.calculateConfidence(extractedData, target)
      };

      // Update last scraped time
      target.lastScraped = new Date();
      this.researchTargets.set(targetId, target);

      // Store in quantum database
      await this.storeResearchData(researchData, target);

      console.log(`Research completed for ${target.name} - Quality: ${researchData.quality.toFixed(2)}`);
      return researchData;

    } catch (error) {
      console.error(`Research failed for ${target.name}:`, error);
      return null;
    }
  }

  private calculateDataQuality(data: Record<string, any>): number {
    let quality = 0;
    let totalFields = 0;

    Object.values(data).forEach(fieldData => {
      totalFields++;
      if (Array.isArray(fieldData) && fieldData.length > 0) {
        quality += fieldData.filter(item => item.text && item.text.length > 3).length / fieldData.length;
      }
    });

    return totalFields > 0 ? quality / totalFields : 0;
  }

  private calculateConfidence(data: Record<string, any>, target: ResearchTarget): number {
    let confidence = 0.5; // Base confidence

    // Check data freshness
    if (target.lastScraped.getTime() > Date.now() - 60000) {
      confidence += 0.2; // Recent data
    }

    // Check data completeness
    const expectedFields = Object.keys(target.selectors).length;
    const foundFields = Object.keys(data).filter(key => 
      Array.isArray(data[key]) && data[key].length > 0
    ).length;
    
    confidence += (foundFields / expectedFields) * 0.3;

    return Math.min(confidence, 1.0);
  }

  private async storeResearchData(researchData: ResearchData, target: ResearchTarget) {
    try {
      // Create content summary
      const contentSummary = Object.entries(researchData.data)
        .map(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            return `${key}: ${values.slice(0, 3).map(v => v.text).join(', ')}`;
          }
          return '';
        })
        .filter(Boolean)
        .join(' | ');

      // Store as quantum knowledge node
      await storage.createQuantumKnowledgeNode({
        nodeId: researchData.id,
        content: `Research: ${target.name} - ${contentSummary}`,
        context: `Automated research from ${target.url}. Type: ${target.type}`,
        confidence: researchData.confidence,
        quantumState: 'research_entangled',
        learnedFrom: 'nexus_automation',
        timestamp: researchData.timestamp,
        connections: [],
        asiEnhancementLevel: 1.3 + researchData.quality,
        retrievalCount: 0,
        successRate: 1.0,
        quantumSignature: `nexus_${target.type}_${target.id}`
      });

    } catch (error) {
      console.error('Error storing research data:', error);
    }
  }

  // ==================== RULE EVALUATION ====================
  private async evaluateRule(ruleId: string) {
    const rule = this.automationRules.get(ruleId);
    if (!rule) return;

    try {
      let shouldTrigger = false;

      switch (rule.trigger) {
        case 'time_based':
          shouldTrigger = await this.evaluateTimeBasedRule(rule);
          break;
        case 'price_change':
          shouldTrigger = await this.evaluatePriceChangeRule(rule);
          break;
        case 'news_keyword':
          shouldTrigger = await this.evaluateNewsKeywordRule(rule);
          break;
        case 'volume_spike':
          shouldTrigger = await this.evaluateVolumeSpikeRule(rule);
          break;
      }

      if (shouldTrigger) {
        await this.executeRuleActions(rule);
      }

    } catch (error) {
      console.error(`Rule evaluation failed for ${rule.name}:`, error);
    }
  }

  private async evaluateTimeBasedRule(rule: AutomationRule): Promise<boolean> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return rule.conditions.time === currentTime;
  }

  private async evaluatePriceChangeRule(rule: AutomationRule): Promise<boolean> {
    // Check recent market data for price changes
    // This would integrate with your market data
    return Math.random() > 0.9; // Placeholder for actual price change detection
  }

  private async evaluateNewsKeywordRule(rule: AutomationRule): Promise<boolean> {
    // Check recent news for keywords
    const keywords = rule.conditions.keywords as string[];
    // Implementation would check recent news data
    return Math.random() > 0.95; // Placeholder
  }

  private async evaluateVolumeSpikeRule(rule: AutomationRule): Promise<boolean> {
    // Check for volume spikes in market data
    return Math.random() > 0.97; // Placeholder
  }

  private async executeRuleActions(rule: AutomationRule) {
    console.log(`Executing rule: ${rule.name}`);
    
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'scrape':
            await this.executeActionScrape(action);
            break;
          case 'alert':
            await this.executeActionAlert(action);
            break;
          case 'analyze':
            await this.executeActionAnalyze(action);
            break;
          case 'store':
            await this.executeActionStore(action);
            break;
        }
      } catch (error) {
        console.error(`Action execution failed:`, error);
      }
    }
  }

  private async executeActionScrape(action: any) {
    if (action.target === 'all_financial_targets') {
      const financialTargets = Array.from(this.researchTargets.values())
        .filter(t => t.type === 'financial' && t.isActive);
      
      for (const target of financialTargets) {
        await this.executeResearch(target.id);
      }
    } else {
      await this.executeResearch(action.target);
    }
  }

  private async executeActionAlert(action: any) {
    console.log(`ALERT: ${action.target} - ${JSON.stringify(action.parameters)}`);
  }

  private async executeActionAnalyze(action: any) {
    console.log(`ANALYZE: ${action.target} - ${JSON.stringify(action.parameters)}`);
  }

  private async executeActionStore(action: any) {
    console.log(`STORE: ${action.target} - ${JSON.stringify(action.parameters)}`);
  }

  // ==================== MANAGEMENT INTERFACE ====================
  public addResearchTarget(target: Omit<ResearchTarget, 'lastScraped'>): string {
    const fullTarget: ResearchTarget = {
      ...target,
      lastScraped: new Date(0)
    };
    
    this.researchTargets.set(target.id, fullTarget);
    
    if (target.isActive) {
      this.scheduleTarget(target.id);
    }
    
    return target.id;
  }

  public removeResearchTarget(targetId: string): boolean {
    const task = this.scheduledTasks.get(targetId);
    if (task) {
      clearInterval(task);
      this.scheduledTasks.delete(targetId);
    }
    
    return this.researchTargets.delete(targetId);
  }

  public addAutomationRule(rule: AutomationRule): string {
    this.automationRules.set(rule.id, rule);
    return rule.id;
  }

  public getResearchTargets(): ResearchTarget[] {
    return Array.from(this.researchTargets.values());
  }

  public getAutomationRules(): AutomationRule[] {
    return Array.from(this.automationRules.values());
  }

  public getResearchMetrics() {
    const targets = Array.from(this.researchTargets.values());
    const activeTargets = targets.filter(t => t.isActive).length;
    const totalScrapes = targets.reduce((sum, t) => 
      sum + (t.lastScraped.getTime() > 0 ? 1 : 0), 0
    );
    
    return {
      totalTargets: targets.length,
      activeTargets,
      totalScrapes,
      rulesActive: Array.from(this.automationRules.values()).filter(r => r.isActive).length,
      isRunning: this.isRunning,
      lastUpdate: new Date().toISOString()
    };
  }

  // ==================== CLEANUP ====================
  public async shutdown() {
    this.isRunning = false;
    
    // Clear all scheduled tasks
    this.scheduledTasks.forEach(task => clearInterval(task));
    this.scheduledTasks.clear();
    
    // Close browser
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('Nexus Research Automation shutdown complete');
  }
}

export const nexusResearch = new NexusResearchAutomation();