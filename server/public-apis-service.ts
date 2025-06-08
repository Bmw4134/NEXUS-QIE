/**
 * Free Public APIs Service
 * Integrates various free APIs for enhanced AI capabilities
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface CountryInfo {
  name: string;
  capital: string;
  population: number;
  region: string;
  languages: string[];
  currencies: string[];
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export class PublicApisService {
  private baseUrls = {
    weather: 'https://api.openweathermap.org/data/2.5',
    news: 'https://newsapi.org/v2',
    countries: 'https://restcountries.com/v3.1',
    wikipedia: 'https://en.wikipedia.org/api/rest_v1',
    exchange: 'https://api.exchangerate-api.com/v4/latest'
  };

  // Weather API (requires API key but has free tier)
  async getWeather(city: string, apiKey?: string): Promise<ApiResponse<WeatherData>> {
    try {
      if (!apiKey) {
        // Fallback to mock data for demo purposes
        return {
          success: true,
          data: {
            location: city,
            temperature: 22,
            description: 'Partly cloudy',
            humidity: 65,
            windSpeed: 8.5
          },
          source: 'demo'
        };
      }

      const response = await fetch(
        `${this.baseUrls.weather}/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) throw new Error('Weather API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          location: data.name,
          temperature: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed
        },
        source: 'openweathermap'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'openweathermap'
      };
    }
  }

  // REST Countries API (completely free)
  async getCountryInfo(countryName: string): Promise<ApiResponse<CountryInfo>> {
    try {
      const response = await fetch(`${this.baseUrls.countries}/name/${countryName}`);
      
      if (!response.ok) throw new Error('Countries API error');
      
      const data = await response.json();
      const country = data[0];
      
      return {
        success: true,
        data: {
          name: country.name.common,
          capital: country.capital?.[0] || 'N/A',
          population: country.population,
          region: country.region,
          languages: Object.values(country.languages || {}),
          currencies: Object.keys(country.currencies || {})
        },
        source: 'restcountries'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'restcountries'
      };
    }
  }

  // Wikipedia API (completely free)
  async searchWikipedia(query: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(
        `${this.baseUrls.wikipedia}/page/summary/${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Wikipedia API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: [{
          title: data.title,
          description: data.extract,
          url: data.content_urls?.desktop?.page || '',
          thumbnail: data.thumbnail?.source || null
        }],
        source: 'wikipedia'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'wikipedia'
      };
    }
  }

  // Exchange Rates API (completely free)
  async getExchangeRates(baseCurrency: string = 'USD'): Promise<ApiResponse<ExchangeRates>> {
    try {
      const response = await fetch(`${this.baseUrls.exchange}/${baseCurrency}`);
      
      if (!response.ok) throw new Error('Exchange rates API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          base: data.base,
          rates: data.rates,
          lastUpdated: data.date
        },
        source: 'exchangerate-api'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'exchangerate-api'
      };
    }
  }

  // Free News API (using NewsAPI.org with demo data fallback)
  async getNews(category: string = 'general', apiKey?: string): Promise<ApiResponse<NewsItem[]>> {
    try {
      if (!apiKey) {
        // Demo news data
        return {
          success: true,
          data: [
            {
              title: 'Technology Advances in AI',
              description: 'Latest developments in artificial intelligence and machine learning.',
              url: 'https://example.com/news/ai-advances',
              publishedAt: new Date().toISOString(),
              source: 'Tech News'
            },
            {
              title: 'Market Updates',
              description: 'Global market trends and financial insights.',
              url: 'https://example.com/news/market-updates',
              publishedAt: new Date().toISOString(),
              source: 'Financial Times'
            }
          ],
          source: 'demo'
        };
      }

      const response = await fetch(
        `${this.baseUrls.news}/top-headlines?category=${category}&apiKey=${apiKey}`
      );
      
      if (!response.ok) throw new Error('News API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.articles.slice(0, 10).map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name
        })),
        source: 'newsapi'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'newsapi'
      };
    }
  }

  // Get all API statuses
  async getApiStatuses(): Promise<Record<string, boolean>> {
    const statuses: Record<string, boolean> = {};
    
    try {
      // Test REST Countries (always free)
      const countryTest = await this.getCountryInfo('United States');
      statuses.countries = countryTest.success;
      
      // Test Exchange Rates (always free)
      const exchangeTest = await this.getExchangeRates();
      statuses.exchange = exchangeTest.success;
      
      // Test Wikipedia (always free)
      const wikiTest = await this.searchWikipedia('Technology');
      statuses.wikipedia = wikiTest.success;
      
      // Demo statuses for APIs requiring keys
      statuses.weather = true; // Demo mode
      statuses.news = true; // Demo mode
      
      return statuses;
    } catch (error) {
      console.error('Error checking API statuses:', error);
      return {
        countries: false,
        exchange: false,
        wikipedia: false,
        weather: false,
        news: false
      };
    }
  }
}

export const publicApisService = new PublicApisService();