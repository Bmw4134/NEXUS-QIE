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
    exchange: 'https://api.exchangerate-api.com/v4/latest',
    ipapi: 'https://ipapi.co',
    advice: 'https://api.adviceslip.com',
    jokes: 'https://v2.jokeapi.dev',
    quotes: 'https://api.quotable.io',
    facts: 'http://numbersapi.com',
    universities: 'http://universities.hipolabs.com',
    publicHolidays: 'https://date.nager.at/api/v3',
    dogImages: 'https://dog.ceo/api',
    cats: 'https://api.thecatapi.com/v1',
    bored: 'https://www.boredapi.com/api',
    github: 'https://api.github.com',
    agify: 'https://api.agify.io',
    genderize: 'https://api.genderize.io',
    nationalize: 'https://api.nationalize.io',
    spacex: 'https://api.spacexdata.com/v4',
    pokemonAPI: 'https://pokeapi.co/api/v2',
    jsonplaceholder: 'https://jsonplaceholder.typicode.com',
    randomuser: 'https://randomuser.me/api',
    catfacts: 'https://catfact.ninja',
    kanye: 'https://api.kanye.rest',
    chucknorris: 'https://api.chucknorris.io/jokes',
    uselessfacts: 'https://uselessfacts.jsph.pl',
    quotegarden: 'https://quotegarden.herokuapp.com/api/v3',
    breakingbad: 'https://www.breakingbadapi.com/api',
    mealdb: 'https://www.themealdb.com/api/json/v1/1',
    cocktaildb: 'https://www.thecocktaildb.com/api/json/v1/1',
    zippopotam: 'http://api.zippopotam.us',
    coingecko: 'https://api.coingecko.com/api/v3',
    dictionaryapi: 'https://api.dictionaryapi.dev/api/v2',
    httpbin: 'https://httpbin.org',
    jsontest: 'http://echo.jsontest.com',
    timeapi: 'http://worldtimeapi.org/api',
    isbndb: 'https://openlibrary.org',
    numbersapi: 'http://numbersapi.com',
    carbonintensity: 'https://api.carbonintensity.org.uk',
    sunrise: 'https://api.sunrise-sunset.org',
    randomfox: 'https://randomfox.ca',
    httpstatusdogs: 'https://httpstatusdogs.com'
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

  // IP Geolocation API (completely free)
  async getIPLocation(ip?: string): Promise<ApiResponse<any>> {
    try {
      const endpoint = ip ? `/${ip}/json` : '/json';
      const response = await fetch(`${this.baseUrls.ipapi}${endpoint}`);
      
      if (!response.ok) throw new Error('IP API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          timezone: data.timezone,
          currency: data.currency,
          languages: data.languages
        },
        source: 'ipapi'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'ipapi'
      };
    }
  }

  // Random Advice API (completely free)
  async getRandomAdvice(): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrls.advice}/advice`);
      
      if (!response.ok) throw new Error('Advice API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.slip.advice,
        source: 'adviceslip'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'adviceslip'
      };
    }
  }

  // Random Quotes API (completely free)
  async getRandomQuote(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.quotes}/random`);
      
      if (!response.ok) throw new Error('Quotes API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          content: data.content,
          author: data.author,
          tags: data.tags
        },
        source: 'quotable'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'quotable'
      };
    }
  }

  // Universities API (completely free)
  async getUniversities(country: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrls.universities}/search?country=${country}`);
      
      if (!response.ok) throw new Error('Universities API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.slice(0, 10).map((uni: any) => ({
          name: uni.name,
          country: uni.country,
          domains: uni.domains,
          webPages: uni.web_pages
        })),
        source: 'universities'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'universities'
      };
    }
  }

  // Public Holidays API (completely free)
  async getPublicHolidays(year: number, countryCode: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrls.publicHolidays}/PublicHolidays/${year}/${countryCode}`);
      
      if (!response.ok) throw new Error('Public holidays API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.map((holiday: any) => ({
          date: holiday.date,
          name: holiday.name,
          localName: holiday.localName,
          countryCode: holiday.countryCode
        })),
        source: 'nager'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'nager'
      };
    }
  }

  // Random Dog Images API (completely free)
  async getRandomDogImage(): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrls.dogImages}/breeds/image/random`);
      
      if (!response.ok) throw new Error('Dog API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: data.message,
        source: 'dog-ceo'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'dog-ceo'
      };
    }
  }

  // Activity Suggestions API (completely free)
  async getActivitySuggestion(type?: string): Promise<ApiResponse<any>> {
    try {
      const url = type ? `${this.baseUrls.bored}/activity?type=${type}` : `${this.baseUrls.bored}/activity`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Bored API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          activity: data.activity,
          type: data.type,
          participants: data.participants,
          price: data.price,
          accessibility: data.accessibility
        },
        source: 'boredapi'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'boredapi'
      };
    }
  }

  // GitHub User API (completely free, no auth required for public data)
  async getGitHubUser(username: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.github}/users/${username}`);
      
      if (!response.ok) throw new Error('GitHub API error');
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          login: data.login,
          name: data.name,
          bio: data.bio,
          publicRepos: data.public_repos,
          followers: data.followers,
          following: data.following,
          location: data.location,
          company: data.company
        },
        source: 'github'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'github'
      };
    }
  }

  // Name Demographics APIs (completely free)
  async getNameAge(name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.agify}?name=${name}`);
      if (!response.ok) throw new Error('Agify API error');
      const data = await response.json();
      
      return {
        success: true,
        data: { name: data.name, age: data.age, count: data.count },
        source: 'agify'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'agify'
      };
    }
  }

  async getNameGender(name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.genderize}?name=${name}`);
      if (!response.ok) throw new Error('Genderize API error');
      const data = await response.json();
      
      return {
        success: true,
        data: { name: data.name, gender: data.gender, probability: data.probability },
        source: 'genderize'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'genderize'
      };
    }
  }

  async getNameNationality(name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.nationalize}?name=${name}`);
      if (!response.ok) throw new Error('Nationalize API error');
      const data = await response.json();
      
      return {
        success: true,
        data: { name: data.name, countries: data.country },
        source: 'nationalize'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'nationalize'
      };
    }
  }

  // SpaceX API (completely free)
  async getSpaceXLaunches(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrls.spacex}/launches/latest`);
      if (!response.ok) throw new Error('SpaceX API error');
      const data = await response.json();
      
      return {
        success: true,
        data: [{
          name: data.name,
          date: data.date_utc,
          success: data.success,
          details: data.details,
          rocket: data.rocket
        }],
        source: 'spacex'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'spacex'
      };
    }
  }

  // Pokemon API (completely free)
  async getPokemon(name: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.pokemonAPI}/pokemon/${name.toLowerCase()}`);
      if (!response.ok) throw new Error('Pokemon API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          name: data.name,
          id: data.id,
          height: data.height,
          weight: data.weight,
          types: data.types.map((t: any) => t.type.name),
          abilities: data.abilities.map((a: any) => a.ability.name),
          sprite: data.sprites.front_default
        },
        source: 'pokemon'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'pokemon'
      };
    }
  }

  // Random User API (completely free)
  async getRandomUser(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.randomuser}`);
      if (!response.ok) throw new Error('Random User API error');
      const data = await response.json();
      const user = data.results[0];
      
      return {
        success: true,
        data: {
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          phone: user.phone,
          location: `${user.location.city}, ${user.location.country}`,
          picture: user.picture.medium,
          age: user.dob.age
        },
        source: 'randomuser'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'randomuser'
      };
    }
  }

  // Cat Facts API (completely free)
  async getCatFact(): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrls.catfacts}/fact`);
      if (!response.ok) throw new Error('Cat Facts API error');
      const data = await response.json();
      
      return {
        success: true,
        data: data.fact,
        source: 'catfacts'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'catfacts'
      };
    }
  }

  // Recipe API (completely free)
  async getRandomRecipe(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.mealdb}/random.php`);
      if (!response.ok) throw new Error('MealDB API error');
      const data = await response.json();
      const meal = data.meals[0];
      
      return {
        success: true,
        data: {
          name: meal.strMeal,
          category: meal.strCategory,
          area: meal.strArea,
          instructions: meal.strInstructions,
          image: meal.strMealThumb,
          ingredients: Object.keys(meal)
            .filter(key => key.startsWith('strIngredient') && meal[key])
            .map(key => meal[key])
            .filter(Boolean)
        },
        source: 'mealdb'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'mealdb'
      };
    }
  }

  // Cocktail API (completely free)
  async getRandomCocktail(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.cocktaildb}/random.php`);
      if (!response.ok) throw new Error('CocktailDB API error');
      const data = await response.json();
      const drink = data.drinks[0];
      
      return {
        success: true,
        data: {
          name: drink.strDrink,
          category: drink.strCategory,
          instructions: drink.strInstructions,
          image: drink.strDrinkThumb,
          glass: drink.strGlass,
          ingredients: Object.keys(drink)
            .filter(key => key.startsWith('strIngredient') && drink[key])
            .map(key => drink[key])
            .filter(Boolean)
        },
        source: 'cocktaildb'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'cocktaildb'
      };
    }
  }

  // Zip Code Lookup (completely free)
  async getLocationByZip(zipCode: string, countryCode: string = 'us'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.zippopotam}/${countryCode}/${zipCode}`);
      if (!response.ok) throw new Error('Zippopotam API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          country: data.country,
          countryAbbr: data['country abbreviation'],
          places: data.places.map((place: any) => ({
            placeName: place['place name'],
            longitude: place.longitude,
            latitude: place.latitude,
            state: place.state
          }))
        },
        source: 'zippopotam'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'zippopotam'
      };
    }
  }

  // Cryptocurrency Market Data (completely free)
  async getCryptoPrice(coinId: string = 'bitcoin'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.coingecko}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
      if (!response.ok) throw new Error('CoinGecko API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          id: coinId,
          price: data[coinId]?.usd,
          change24h: data[coinId]?.usd_24h_change,
          marketCap: data[coinId]?.usd_market_cap
        },
        source: 'coingecko'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'coingecko'
      };
    }
  }

  // Dictionary API (completely free)
  async getWordDefinition(word: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.dictionaryapi}/entries/en/${word}`);
      if (!response.ok) throw new Error('Dictionary API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          word: data[0]?.word,
          phonetic: data[0]?.phonetic,
          meanings: data[0]?.meanings?.slice(0, 3).map((meaning: any) => ({
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions?.slice(0, 2).map((def: any) => ({
              definition: def.definition,
              example: def.example
            }))
          }))
        },
        source: 'dictionaryapi'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'dictionaryapi'
      };
    }
  }

  // World Time API (completely free)
  async getWorldTime(timezone: string = 'UTC'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.timeapi}/timezone/${timezone}`);
      if (!response.ok) throw new Error('World Time API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          timezone: data.timezone,
          datetime: data.datetime,
          utcOffset: data.utc_offset,
          dayOfWeek: data.day_of_week,
          dayOfYear: data.day_of_year,
          weekNumber: data.week_number
        },
        source: 'worldtimeapi'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'worldtimeapi'
      };
    }
  }

  // Book Information API (completely free)
  async getBookInfo(isbn: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.isbndb}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      if (!response.ok) throw new Error('Open Library API error');
      const data = await response.json();
      const bookData = data[`ISBN:${isbn}`];
      
      if (!bookData) {
        throw new Error('Book not found');
      }
      
      return {
        success: true,
        data: {
          title: bookData.title,
          authors: bookData.authors?.map((author: any) => author.name),
          publishDate: bookData.publish_date,
          publishers: bookData.publishers?.map((pub: any) => pub.name),
          subjects: bookData.subjects?.slice(0, 5).map((subject: any) => subject.name),
          pageCount: bookData.number_of_pages
        },
        source: 'openlibrary'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'openlibrary'
      };
    }
  }

  // Numbers Facts API (completely free)
  async getNumberFact(number: number): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrls.numbersapi}/${number}`);
      if (!response.ok) throw new Error('Numbers API error');
      const data = await response.text();
      
      return {
        success: true,
        data: data,
        source: 'numbersapi'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'numbersapi'
      };
    }
  }

  // Carbon Intensity API (UK - completely free)
  async getCarbonIntensity(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.carbonintensity}/intensity`);
      if (!response.ok) throw new Error('Carbon Intensity API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          intensity: data.data[0]?.intensity?.actual,
          forecast: data.data[0]?.intensity?.forecast,
          index: data.data[0]?.intensity?.index,
          from: data.data[0]?.from,
          to: data.data[0]?.to
        },
        source: 'carbonintensity'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'carbonintensity'
      };
    }
  }

  // Sunrise/Sunset API (completely free)
  async getSunriseSunset(lat: number, lng: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrls.sunrise}/json?lat=${lat}&lng=${lng}&formatted=0`);
      if (!response.ok) throw new Error('Sunrise Sunset API error');
      const data = await response.json();
      
      return {
        success: true,
        data: {
          sunrise: data.results.sunrise,
          sunset: data.results.sunset,
          solarNoon: data.results.solar_noon,
          dayLength: data.results.day_length,
          civilTwilightBegin: data.results.civil_twilight_begin,
          civilTwilightEnd: data.results.civil_twilight_end
        },
        source: 'sunrise-sunset'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'sunrise-sunset'
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

      // Test IP Location (always free)
      const ipTest = await this.getIPLocation();
      statuses.ipLocation = ipTest.success;

      // Test Random Advice (always free)
      const adviceTest = await this.getRandomAdvice();
      statuses.advice = adviceTest.success;

      // Test Random Quotes (always free)
      const quoteTest = await this.getRandomQuote();
      statuses.quotes = quoteTest.success;

      // Test Universities (always free)
      const uniTest = await this.getUniversities('United States');
      statuses.universities = uniTest.success;

      // Test GitHub (always free for public data)
      const githubTest = await this.getGitHubUser('octocat');
      statuses.github = githubTest.success;
      
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
        ipLocation: false,
        advice: false,
        quotes: false,
        universities: false,
        github: false,
        weather: false,
        news: false
      };
    }
  }
}

export const publicApisService = new PublicApisService();