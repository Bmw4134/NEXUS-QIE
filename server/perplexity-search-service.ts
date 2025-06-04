import axios from 'axios';

export interface PerplexitySearchRequest {
  query: string;
  context?: string;
  searchType: 'general' | 'finance' | 'tech' | 'news' | 'research';
  maxTokens?: number;
  temperature?: number;
}

export interface PerplexitySearchResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface NexusSearchResult {
  query: string;
  response: string;
  citations: string[];
  searchType: string;
  confidence: number;
  timestamp: Date;
  relatedTopics: string[];
  sources: string[];
}

export class PerplexitySearchService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || null;
  }

  async search(request: PerplexitySearchRequest): Promise<NexusSearchResult> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const systemPrompt = this.getSystemPrompt(request.searchType);
    const enhancedQuery = this.enhanceQuery(request.query, request.context);

    try {
      const response = await axios.post<PerplexitySearchResponse>(
        this.baseUrl,
        {
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: enhancedQuery
            }
          ],
          max_tokens: request.maxTokens || 2048,
          temperature: request.temperature || 0.2,
          top_p: 0.9,
          search_recency_filter: 'month',
          return_images: false,
          return_related_questions: false,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchResult: NexusSearchResult = {
        query: request.query,
        response: response.data.choices[0]?.message?.content || 'No response received',
        citations: response.data.citations || [],
        searchType: request.searchType,
        confidence: this.calculateConfidence(response.data),
        timestamp: new Date(),
        relatedTopics: this.extractRelatedTopics(response.data.choices[0]?.message?.content || ''),
        sources: this.extractSources(response.data.citations || [])
      };

      return searchResult;

    } catch (error) {
      console.error('Perplexity search failed:', error);
      throw new Error(`Search failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private getSystemPrompt(searchType: string): string {
    const prompts = {
      general: 'Provide comprehensive, accurate information with reliable sources. Focus on factual content and cite sources.',
      finance: 'You are a financial research expert. Provide detailed financial analysis, market insights, and economic data with proper citations. Focus on current market conditions, trends, and actionable intelligence.',
      tech: 'You are a technology research specialist. Provide technical insights, industry analysis, and innovation trends. Include latest developments and credible tech sources.',
      news: 'You are a news analyst. Provide current, factual news information with focus on recent developments. Prioritize credible news sources and verify information.',
      research: 'You are an academic research assistant. Provide scholarly, well-researched information with academic and industry sources. Focus on depth and accuracy.'
    };

    return prompts[searchType] || prompts.general;
  }

  private enhanceQuery(query: string, context?: string): string {
    let enhancedQuery = query;

    if (context) {
      enhancedQuery = `Context: ${context}\n\nQuery: ${query}`;
    }

    // Add NEXUS-specific enhancements
    enhancedQuery += '\n\nPlease provide detailed, actionable insights suitable for a financial intelligence platform.';

    return enhancedQuery;
  }

  private calculateConfidence(response: PerplexitySearchResponse): number {
    // Calculate confidence based on response quality indicators
    const hasContent = response.choices[0]?.message?.content?.length > 100;
    const hasCitations = (response.citations?.length || 0) > 0;
    const tokenUsage = response.usage.completion_tokens / response.usage.total_tokens;

    let confidence = 0.5; // Base confidence

    if (hasContent) confidence += 0.2;
    if (hasCitations) confidence += 0.2;
    if (tokenUsage > 0.3) confidence += 0.1; // Good response length

    return Math.min(confidence, 1.0);
  }

  private extractRelatedTopics(content: string): string[] {
    // Extract potential related topics from the content
    const topics: string[] = [];
    const sentences = content.split(/[.!?]+/);

    sentences.forEach(sentence => {
      // Look for key phrases that might indicate related topics
      const keyPhrases = sentence.match(/(?:related to|similar to|also consider|see also|including)\s+([^,.!?]+)/gi);
      if (keyPhrases) {
        keyPhrases.forEach(phrase => {
          const topic = phrase.replace(/(?:related to|similar to|also consider|see also|including)\s+/i, '').trim();
          if (topic.length > 3 && topic.length < 50) {
            topics.push(topic);
          }
        });
      }
    });

    return [...new Set(topics)].slice(0, 5); // Unique topics, max 5
  }

  private extractSources(citations: string[]): string[] {
    return citations.map(citation => {
      try {
        const url = new URL(citation);
        return url.hostname.replace('www.', '');
      } catch {
        return citation;
      }
    }).slice(0, 10); // Max 10 sources
  }

  async searchFinancialIntelligence(query: string, context?: string): Promise<NexusSearchResult> {
    const financialQuery = `Financial Intelligence Query: ${query}

Please provide:
1. Current market relevance and implications
2. Key financial metrics or indicators
3. Market sentiment analysis
4. Potential investment considerations
5. Risk factors and opportunities

${context ? `Additional Context: ${context}` : ''}`;

    return this.search({
      query: financialQuery,
      context,
      searchType: 'finance',
      maxTokens: 3000,
      temperature: 0.1
    });
  }

  async searchTechnicalAnalysis(symbol: string, timeframe?: string): Promise<NexusSearchResult> {
    const query = `Technical analysis for ${symbol} ${timeframe ? `over ${timeframe}` : ''}. 

Provide detailed analysis including:
- Current price action and trends
- Support and resistance levels
- Technical indicators (RSI, MACD, moving averages)
- Volume analysis
- Short-term and medium-term outlook
- Key levels to watch`;

    return this.search({
      query,
      searchType: 'finance',
      maxTokens: 2500,
      temperature: 0.1
    });
  }

  async searchMarketNews(topic: string): Promise<NexusSearchResult> {
    const query = `Latest market news and developments regarding ${topic}. 

Focus on:
- Recent news and announcements
- Market impact analysis
- Expert opinions and analyst views
- Regulatory developments
- Industry trends`;

    return this.search({
      query,
      searchType: 'news',
      maxTokens: 2000,
      temperature: 0.2
    });
  }

  isConfigured(): boolean {
    return this.apiKey !== null;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      apiEndpoint: this.baseUrl,
      lastUsed: new Date(),
      status: this.isConfigured() ? 'active' : 'needs_api_key'
    };
  }
}

export const perplexitySearch = new PerplexitySearchService();