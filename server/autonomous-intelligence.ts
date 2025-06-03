import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import * as cron from 'node-cron';
import { NexusQuantumDatabase } from './quantum-database';
import { QuantumMLEngine } from './quantum-ml-engine';

export interface IntelligenceSource {
  id: string;
  name: string;
  url: string;
  type: 'news' | 'research' | 'market' | 'tech';
  lastScraped: Date;
  status: 'active' | 'inactive' | 'error';
  dataPoints: number;
}

export interface ScrapedData {
  id: string;
  source: string;
  title: string;
  content: string;
  url: string;
  timestamp: Date;
  relevanceScore: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class AutonomousIntelligenceSystem {
  private browser: Browser | null = null;
  private quantumDB: NexusQuantumDatabase;
  private mlEngine: QuantumMLEngine;
  private intelligenceSources: IntelligenceSource[] = [];
  private scrapedData: ScrapedData[] = [];
  private isCollecting = false;

  constructor(quantumDB: NexusQuantumDatabase, mlEngine: QuantumMLEngine) {
    this.quantumDB = quantumDB;
    this.mlEngine = mlEngine;
    this.initializeIntelligenceSources();
    this.startAutonomousCollection();
  }

  private initializeIntelligenceSources() {
    this.intelligenceSources = [
      {
        id: uuidv4(),
        name: 'AI Research Papers',
        url: 'https://arxiv.org/list/cs.AI/recent',
        type: 'research',
        lastScraped: new Date(),
        status: 'active',
        dataPoints: 0
      },
      {
        id: uuidv4(),
        name: 'Quantum Computing News',
        url: 'https://quantumcomputingreport.com',
        type: 'news',
        lastScraped: new Date(),
        status: 'active',
        dataPoints: 0
      },
      {
        id: uuidv4(),
        name: 'Technology Trends',
        url: 'https://techcrunch.com',
        type: 'tech',
        lastScraped: new Date(),
        status: 'active',
        dataPoints: 0
      },
      {
        id: uuidv4(),
        name: 'Machine Learning News',
        url: 'https://www.kdnuggets.com',
        type: 'research',
        lastScraped: new Date(),
        status: 'active',
        dataPoints: 0
      },
      {
        id: uuidv4(),
        name: 'Autonomous Systems Research',
        url: 'https://www.nature.com/subjects/autonomous-systems',
        type: 'research',
        lastScraped: new Date(),
        status: 'active',
        dataPoints: 0
      }
    ];
  }

  private async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  private startAutonomousCollection() {
    console.log('Starting autonomous intelligence collection system...');
    
    // Collect data every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      this.performIntelligenceCollection();
    });

    // Perform initial collection after 5 seconds
    setTimeout(() => {
      this.performIntelligenceCollection();
    }, 5000);
  }

  private async performIntelligenceCollection() {
    if (this.isCollecting) {
      console.log('Intelligence collection already in progress, skipping...');
      return;
    }

    this.isCollecting = true;
    console.log('Starting autonomous intelligence collection...');

    try {
      const browser = await this.initializeBrowser();
      
      for (const source of this.intelligenceSources) {
        if (source.status === 'active') {
          try {
            const data = await this.scrapeIntelligenceSource(browser, source);
            await this.processScrapedData(data, source);
            source.lastScraped = new Date();
            source.dataPoints += data.length;
            console.log(`Collected ${data.length} data points from ${source.name}`);
          } catch (error) {
            console.error(`Error scraping ${source.name}:`, error);
            source.status = 'error';
          }
        }
      }
    } catch (error) {
      console.error('Error during intelligence collection:', error);
    } finally {
      this.isCollecting = false;
    }
  }

  private async scrapeIntelligenceSource(browser: Browser, source: IntelligenceSource): Promise<ScrapedData[]> {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    try {
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const content = await page.content();
      const $ = cheerio.load(content);
      const scrapedItems: ScrapedData[] = [];

      // Generic scraping logic based on source type
      if (source.type === 'research') {
        $('article, .paper, .publication').each((i, element) => {
          if (i >= 10) return false; // Limit to 10 items per source
          
          const title = $(element).find('h1, h2, h3, .title').first().text().trim();
          const content = $(element).find('p, .abstract, .summary').first().text().trim();
          
          if (title && content && title.length > 10 && content.length > 50) {
            scrapedItems.push({
              id: uuidv4(),
              source: source.name,
              title,
              content: content.substring(0, 500),
              url: source.url,
              timestamp: new Date(),
              relevanceScore: this.calculateRelevanceScore(title + ' ' + content),
              keywords: this.extractKeywords(title + ' ' + content),
              sentiment: this.analyzeSentiment(content)
            });
          }
        });
      } else if (source.type === 'news' || source.type === 'tech') {
        $('article, .post, .news-item').each((i, element) => {
          if (i >= 10) return false;
          
          const title = $(element).find('h1, h2, h3, .headline, .title').first().text().trim();
          const content = $(element).find('p, .excerpt, .summary').first().text().trim();
          
          if (title && content && title.length > 10 && content.length > 50) {
            scrapedItems.push({
              id: uuidv4(),
              source: source.name,
              title,
              content: content.substring(0, 500),
              url: source.url,
              timestamp: new Date(),
              relevanceScore: this.calculateRelevanceScore(title + ' ' + content),
              keywords: this.extractKeywords(title + ' ' + content),
              sentiment: this.analyzeSentiment(content)
            });
          }
        });
      }

      return scrapedItems;
    } finally {
      await page.close();
    }
  }

  private calculateRelevanceScore(text: string): number {
    const relevantKeywords = [
      'artificial intelligence', 'machine learning', 'quantum computing', 'neural network',
      'deep learning', 'autonomous', 'algorithm', 'data science', 'robotics', 'automation',
      'predictive analytics', 'computer vision', 'natural language processing', 'optimization'
    ];

    const lowercaseText = text.toLowerCase();
    let score = 0;

    relevantKeywords.forEach(keyword => {
      const matches = (lowercaseText.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * 0.1;
    });

    return Math.min(1, score);
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'their', 'said', 'each', 'which', 'them', 'what', 'your', 'when', 'were', 'there', 'more']);
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['improve', 'enhance', 'optimize', 'breakthrough', 'advanced', 'innovative', 'efficient', 'successful', 'powerful', 'excellent'];
    const negativeWords = ['problem', 'error', 'fail', 'difficult', 'challenge', 'issue', 'limitation', 'concern', 'risk', 'decline'];

    const lowercaseText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      positiveScore += (lowercaseText.match(new RegExp(word, 'g')) || []).length;
    });

    negativeWords.forEach(word => {
      negativeScore += (lowercaseText.match(new RegExp(word, 'g')) || []).length;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  private async processScrapedData(scrapedItems: ScrapedData[], source: IntelligenceSource) {
    for (const item of scrapedItems) {
      if (item.relevanceScore > 0.3) {
        // Store in quantum database
        const nodeId = this.quantumDB.storeQuantumKnowledge(
          item.content,
          `Source: ${item.source}, Keywords: ${item.keywords.join(', ')}, Sentiment: ${item.sentiment}`,
          'autonomous_intelligence'
        );

        // Enhance with ML predictions
        const mlEnhancement = await this.mlEngine.processQuantumQuery(item.title, item.content);
        
        // Store processed data
        this.scrapedData.push({
          ...item,
          relevanceScore: item.relevanceScore * (1 + mlEnhancement.mlEnhancement)
        });

        console.log(`Processed: ${item.title.substring(0, 50)}... (Relevance: ${item.relevanceScore.toFixed(3)})`);
      }
    }

    // Keep only the last 1000 scraped items
    if (this.scrapedData.length > 1000) {
      this.scrapedData = this.scrapedData.slice(-1000);
    }
  }

  async queryIntelligence(searchQuery: string): Promise<ScrapedData[]> {
    const lowercaseQuery = searchQuery.toLowerCase();
    
    return this.scrapedData
      .filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.content.toLowerCase().includes(lowercaseQuery) ||
        item.keywords.some(keyword => keyword.includes(lowercaseQuery))
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  getIntelligenceMetrics() {
    return {
      totalSources: this.intelligenceSources.length,
      activeSources: this.intelligenceSources.filter(s => s.status === 'active').length,
      totalDataPoints: this.scrapedData.length,
      isCollecting: this.isCollecting,
      lastCollection: Math.max(...this.intelligenceSources.map(s => s.lastScraped.getTime())),
      averageRelevanceScore: this.scrapedData.length > 0 
        ? this.scrapedData.reduce((sum, item) => sum + item.relevanceScore, 0) / this.scrapedData.length 
        : 0,
      sentimentDistribution: {
        positive: this.scrapedData.filter(item => item.sentiment === 'positive').length,
        negative: this.scrapedData.filter(item => item.sentiment === 'negative').length,
        neutral: this.scrapedData.filter(item => item.sentiment === 'neutral').length
      }
    };
  }

  getIntelligenceSources(): IntelligenceSource[] {
    return this.intelligenceSources;
  }

  getLatestIntelligence(limit: number = 20): ScrapedData[] {
    return this.scrapedData
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}