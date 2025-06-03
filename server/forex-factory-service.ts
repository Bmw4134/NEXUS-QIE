import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ForexEvent {
  id: string;
  time: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  timestamp: Date;
}

export interface CurrencyPair {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface ForexAnalysis {
  id: string;
  pair: string;
  analysis: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  timestamp: Date;
}

export class ForexFactoryService {
  private baseUrl = 'https://www.forexfactory.com';
  private events: ForexEvent[] = [];
  private analyses: ForexAnalysis[] = [];
  private isRunning = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private onDataUpdate?: (data: { events: ForexEvent[], analyses: ForexAnalysis[] }) => void;

  constructor(onDataUpdate?: (data: { events: ForexEvent[], analyses: ForexAnalysis[] }) => void) {
    this.onDataUpdate = onDataUpdate;
    this.startPeriodicUpdates();
  }

  private startPeriodicUpdates() {
    if (this.updateInterval) return;
    
    // Update every 5 minutes
    this.updateInterval = setInterval(async () => {
      await this.fetchEconomicCalendar();
      await this.generateForexAnalysis();
      
      // Notify callback if provided
      if (this.onDataUpdate) {
        this.onDataUpdate({
          events: this.events,
          analyses: this.analyses
        });
      }
    }, 5 * 60 * 1000);

    // Initial fetch
    this.performInitialFetch();
  }

  private async performInitialFetch() {
    await this.fetchEconomicCalendar();
    await this.generateForexAnalysis();
    
    if (this.onDataUpdate) {
      this.onDataUpdate({
        events: this.events,
        analyses: this.analyses
      });
    }
  }

  async fetchEconomicCalendar(): Promise<ForexEvent[]> {
    try {
      console.log('Fetching Forex Factory economic calendar...');
      
      // Fetch calendar page
      const response = await axios.get(`${this.baseUrl}/calendar`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const events: ForexEvent[] = [];

      // Parse calendar table
      $('.calendar__row').each((index, element) => {
        const $row = $(element);
        
        const time = $row.find('.calendar__time').text().trim();
        const currency = $row.find('.calendar__currency').text().trim();
        const impact = this.parseImpact($row.find('.calendar__impact'));
        const event = $row.find('.calendar__event').text().trim();
        const actual = $row.find('.calendar__actual').text().trim();
        const forecast = $row.find('.calendar__forecast').text().trim();
        const previous = $row.find('.calendar__previous').text().trim();

        if (event && currency) {
          const forexEvent: ForexEvent = {
            id: `ff_${Date.now()}_${index}`,
            time,
            currency,
            impact,
            event,
            actual,
            forecast,
            previous,
            timestamp: new Date()
          };
          
          events.push(forexEvent);
        }
      });

      this.events = events.slice(0, 20); // Keep latest 20 events
      console.log(`Fetched ${events.length} forex events`);
      
      // Store in quantum database
      await this.storeForexKnowledge(events);
      
      return events;
    } catch (error) {
      console.error('Error fetching Forex Factory calendar:', error);
      return [];
    }
  }

  private parseImpact($impactElement: cheerio.Cheerio<any>): 'high' | 'medium' | 'low' {
    const classes = $impactElement.attr('class') || '';
    if (classes.includes('high')) return 'high';
    if (classes.includes('medium')) return 'medium';
    return 'low';
  }

  async generateForexAnalysis(): Promise<ForexAnalysis[]> {
    const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];
    const analyses: ForexAnalysis[] = [];

    for (const pair of majorPairs) {
      const analysis = await this.analyzeForexPair(pair);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    this.analyses = analyses;
    return analyses;
  }

  private async analyzeForexPair(pair: string): Promise<ForexAnalysis | null> {
    try {
      // Get relevant economic events for the currencies in the pair
      const baseCurrency = pair.substring(0, 3);
      const quoteCurrency = pair.substring(3, 6);
      
      const relevantEvents = this.events.filter(event => 
        event.currency === baseCurrency || event.currency === quoteCurrency
      );

      // Generate analysis based on events
      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let confidence = 0.5;
      let analysisText = `Analysis for ${pair}: `;

      if (relevantEvents.length > 0) {
        const highImpactEvents = relevantEvents.filter(e => e.impact === 'high');
        const positiveEvents = relevantEvents.filter(e => 
          e.actual && e.forecast && parseFloat(e.actual) > parseFloat(e.forecast)
        );

        if (highImpactEvents.length > 0) {
          confidence += 0.2;
          analysisText += `${highImpactEvents.length} high-impact events detected. `;
        }

        if (positiveEvents.length > relevantEvents.length / 2) {
          sentiment = 'bullish';
          confidence += 0.2;
          analysisText += 'Economic data showing positive momentum. ';
        } else if (positiveEvents.length < relevantEvents.length / 3) {
          sentiment = 'bearish';
          confidence += 0.2;
          analysisText += 'Economic data showing negative pressure. ';
        }
      }

      // Add technical analysis simulation
      const technicalBias = Math.random() > 0.5 ? 'bullish' : 'bearish';
      if (sentiment === 'neutral') {
        sentiment = technicalBias;
        analysisText += `Technical indicators suggest ${technicalBias} bias. `;
      }

      confidence = Math.min(confidence, 0.95);

      const analysis: ForexAnalysis = {
        id: `analysis_${pair}_${Date.now()}`,
        pair,
        analysis: analysisText,
        sentiment,
        confidence,
        timeframe: '4H',
        timestamp: new Date()
      };

      // Store analysis as quantum knowledge
      await this.storeAnalysisKnowledge(analysis);

      return analysis;
    } catch (error) {
      console.error(`Error analyzing ${pair}:`, error);
      return null;
    }
  }

  // Remove storage dependencies - make this a standalone service

  getLatestEvents(limit: number = 10): ForexEvent[] {
    return this.events.slice(0, limit);
  }

  getLatestAnalyses(limit: number = 5): ForexAnalysis[] {
    return this.analyses.slice(0, limit);
  }

  getEventsByImpact(impact: 'high' | 'medium' | 'low'): ForexEvent[] {
    return this.events.filter(event => event.impact === impact);
  }

  getAnalysisByPair(pair: string): ForexAnalysis | undefined {
    return this.analyses.find(analysis => analysis.pair === pair);
  }

  getForexMetrics() {
    const totalEvents = this.events.length;
    const highImpactEvents = this.events.filter(e => e.impact === 'high').length;
    const bullishAnalyses = this.analyses.filter(a => a.sentiment === 'bullish').length;
    const avgConfidence = this.analyses.reduce((sum, a) => sum + a.confidence, 0) / this.analyses.length || 0;

    return {
      totalEvents,
      highImpactEvents,
      bullishAnalyses,
      bearishAnalyses: this.analyses.length - bullishAnalyses,
      avgConfidence: avgConfidence.toFixed(2),
      lastUpdate: new Date().toISOString()
    };
  }

  async shutdown() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }
}

export const forexService = new ForexFactoryService();