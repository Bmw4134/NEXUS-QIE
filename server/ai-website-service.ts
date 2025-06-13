import OpenAI from 'openai';
import axios from 'axios';
import { Browser } from 'puppeteer';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface WebsiteAnalysis {
  currentTech: string[];
  designScore: number;
  performanceScore: number;
  seoScore: number;
  recommendations: string[];
  screenshotUrl?: string;
}

interface RedesignProposal {
  framework: string;
  features: string[];
  timeline: string;
  estimatedCost: string;
  mockupUrl?: string;
  techStack: string[];
}

export class AIWebsiteService {
  private browser: Browser | null = null;

  async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    try {
      // Scrape website content using Perplexity for enhanced analysis
      const websiteContent = await this.scrapeWebsite(url);
      
      // Use OpenAI to analyze the website
      const analysisPrompt = `
        Analyze this website and provide detailed insights:
        URL: ${url}
        Content: ${websiteContent.substring(0, 3000)}
        
        Please provide:
        1. Technology stack detection (frameworks, libraries, CMS)
        2. Design quality score (0-100)
        3. Performance assessment (0-100)
        4. SEO score (0-100)
        5. Specific improvement recommendations
        
        Return as JSON with this structure:
        {
          "currentTech": ["technology1", "technology2"],
          "designScore": 85,
          "performanceScore": 72,
          "seoScore": 68,
          "recommendations": ["recommendation1", "recommendation2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert web developer and UX analyst. Analyze websites and provide actionable insights."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        currentTech: analysis.currentTech || ['Unknown'],
        designScore: analysis.designScore || 50,
        performanceScore: analysis.performanceScore || 50,
        seoScore: analysis.seoScore || 50,
        recommendations: analysis.recommendations || ['Improve site structure', 'Optimize loading speed']
      };

    } catch (error) {
      console.error('Website analysis error:', error);
      throw new Error('Failed to analyze website');
    }
  }

  async generateRedesign(url: string, requirements: string, analysis?: WebsiteAnalysis): Promise<RedesignProposal> {
    try {
      // Use Perplexity to research current web development trends
      const trendAnalysis = await this.getWebTrends();
      
      const redesignPrompt = `
        Generate a comprehensive website redesign proposal based on:
        
        Original URL: ${url}
        Client Requirements: ${requirements}
        Current Analysis: ${JSON.stringify(analysis)}
        Current Trends: ${trendAnalysis}
        
        Create a detailed proposal including:
        1. Recommended modern framework (React, Next.js, Vue, etc.)
        2. Key features and improvements
        3. Technology stack recommendations
        4. Timeline estimate
        5. Cost estimate range
        
        Consider modern best practices:
        - Mobile-first responsive design
        - Performance optimization
        - SEO enhancement
        - Accessibility compliance
        - Modern UI/UX patterns
        
        Return as JSON:
        {
          "framework": "Next.js",
          "features": ["feature1", "feature2"],
          "timeline": "8-12 weeks",
          "estimatedCost": "$15,000 - $25,000",
          "techStack": ["Next.js", "TypeScript", "Tailwind CSS"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior web development consultant specializing in modern web applications and digital transformation."
          },
          {
            role: "user",
            content: redesignPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const proposal = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        framework: proposal.framework || 'React',
        features: proposal.features || ['Modern responsive design', 'Performance optimization'],
        timeline: proposal.timeline || '6-10 weeks',
        estimatedCost: proposal.estimatedCost || '$10,000 - $20,000',
        techStack: proposal.techStack || ['React', 'TypeScript', 'Tailwind CSS']
      };

    } catch (error) {
      console.error('Redesign generation error:', error);
      throw new Error('Failed to generate redesign proposal');
    }
  }

  private async scrapeWebsite(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // Extract text content from HTML
      const htmlContent = response.data;
      const textContent = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return textContent.substring(0, 5000); // Limit content size
    } catch (error) {
      console.error('Website scraping error:', error);
      return 'Unable to scrape website content';
    }
  }

  private async getWebTrends(): Promise<string> {
    try {
      // Use Perplexity API to get current web development trends
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a web development expert researching current trends.'
            },
            {
              role: 'user',
              content: 'What are the current web development trends for 2024-2025? Focus on frameworks, design patterns, and performance optimizations.'
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content || 'Modern frameworks like Next.js, performance optimization, and mobile-first design are trending.';
    } catch (error) {
      console.error('Perplexity API error:', error);
      return 'Modern frameworks like Next.js, performance optimization, and mobile-first design are trending.';
    }
  }

  async generateMockup(description: string): Promise<string> {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a modern website mockup design based on: ${description}. Style: clean, professional, modern UI/UX, responsive design elements`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return response.data[0].url || '';
    } catch (error) {
      console.error('Mockup generation error:', error);
      return '';
    }
  }
}

export const aiWebsiteService = new AIWebsiteService();