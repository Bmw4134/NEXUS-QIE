
/**
 * Alpaca API Key Finder
 * Intelligent browser scraper to find and extract Alpaca API credentials
 */

import { spawn } from 'child_process';
import { openaiService } from './openai-service';

interface AlpacaCredentials {
  apiKey: string;
  secretKey: string;
  environment: 'paper' | 'live';
  found: boolean;
  location: string;
}

export class AlpacaAPIKeyFinder {
  private isScanning = false;

  constructor() {
    console.log('🔍 Alpaca API Key Finder initialized');
  }

  async findAlpacaCredentials(): Promise<AlpacaCredentials[]> {
    if (this.isScanning) {
      throw new Error('Already scanning for credentials');
    }

    this.isScanning = true;
    console.log('🔍 Scanning Edge browser for Alpaca API credentials...');

    try {
      // Step 1: Find Alpaca tabs in Edge browser
      const alpacaTabs = await this.findAlpacaTabs();
      
      // Step 2: Extract page content from each tab
      const pageContents = await this.extractPageContents(alpacaTabs);
      
      // Step 3: Use OpenAI to intelligently analyze the content
      const credentials = await this.analyzeWithOpenAI(pageContents);
      
      return credentials;
    } finally {
      this.isScanning = false;
    }
  }

  private async findAlpacaTabs(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import json
import subprocess
import re

def find_edge_process():
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        processes = result.stdout.split('\\n')
        
        edge_processes = []
        for process in processes:
            if 'Microsoft Edge' in process and '--remote-debugging-port' in process:
                edge_processes.append(process)
        
        return len(edge_processes) > 0
    except:
        return False

def get_browser_tabs():
    try:
        # Try to connect to Edge remote debugging
        import requests
        response = requests.get('http://localhost:9222/json/tabs', timeout=5)
        tabs = response.json()
        
        alpaca_tabs = []
        for tab in tabs:
            url = tab.get('url', '')
            if 'alpaca' in url.lower() or 'api' in url.lower():
                alpaca_tabs.append({
                    'id': tab.get('id'),
                    'url': url,
                    'title': tab.get('title', '')
                })
        
        return alpaca_tabs
    except:
        return []

if find_edge_process():
    tabs = get_browser_tabs()
    print(f"ALPACA_TABS_FOUND:{json.dumps(tabs)}")
else:
    print("ALPACA_TABS_ERROR:No Edge browser with debugging enabled found")
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript]);
      
      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_TABS_FOUND')) {
          const jsonStr = output.split('ALPACA_TABS_FOUND:')[1].trim();
          try {
            const tabs = JSON.parse(jsonStr);
            resolve(tabs.map((tab: any) => tab.url));
          } catch (error) {
            resolve([]);
          }
        } else {
          resolve([]);
        }
      });
    });
  }

  private async extractPageContents(urls: string[]): Promise<Array<{url: string, content: string}>> {
    const contents = [];
    
    for (const url of urls) {
      try {
        console.log(`📄 Extracting content from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        const content = await response.text();
        contents.push({ url, content });
      } catch (error) {
        console.log(`Failed to extract content from ${url}`);
        contents.push({ url, content: '' });
      }
    }
    
    return contents;
  }

  private async analyzeWithOpenAI(pageContents: Array<{url: string, content: string}>): Promise<AlpacaCredentials[]> {
    const credentials: AlpacaCredentials[] = [];
    
    for (const page of pageContents) {
      if (!page.content) continue;
      
      try {
        console.log(`🤖 Analyzing page with OpenAI: ${page.url}`);
        
        const prompt = `
You are an expert at analyzing web pages to help users find their API credentials. 

Analyze this Alpaca Markets web page content and help identify:
1. Where API keys are typically located on this page
2. Any visible API keys or secret keys
3. Navigation instructions to find API credentials
4. Whether this is a paper trading or live trading environment

Page URL: ${page.url}
Page Content (first 3000 chars): ${page.content.substring(0, 3000)}

Please respond in JSON format:
{
  "hasApiCredentials": boolean,
  "apiKey": "string or null",
  "secretKey": "string or null", 
  "environment": "paper" or "live" or "unknown",
  "location": "description of where credentials are found",
  "navigationInstructions": "step by step instructions to find API keys"
}
`;

        const analysis = await openaiService.generateCompletion(prompt, {
          maxTokens: 500,
          temperature: 0.1
        });

        try {
          const result = JSON.parse(analysis);
          
          if (result.hasApiCredentials) {
            credentials.push({
              apiKey: result.apiKey || '',
              secretKey: result.secretKey || '',
              environment: result.environment || 'unknown',
              found: !!result.apiKey,
              location: result.location || page.url
            });
            
            console.log(`✅ API credentials analysis completed for ${page.url}`);
            console.log(`📍 Location: ${result.location}`);
            console.log(`🔧 Instructions: ${result.navigationInstructions}`);
          }
        } catch (parseError) {
          console.log('Failed to parse OpenAI response for', page.url);
        }
      } catch (error) {
        console.log(`OpenAI analysis failed for ${page.url}:`, error);
      }
    }
    
    return credentials;
  }

  async getAlpacaNavigationGuide(): Promise<string> {
    const guide = await openaiService.generateCompletion(`
Based on Alpaca Markets documentation, provide a step-by-step guide for users to find their API keys in the Alpaca dashboard. 

Include:
1. How to log into Alpaca Markets
2. Where to navigate to find API keys
3. How to generate new API keys if needed
4. Difference between paper and live trading keys
5. Security best practices

Make it clear and easy to follow.
`, {
      maxTokens: 800,
      temperature: 0.1
    });

    return guide;
  }

  async scanForAlpacaSession(): Promise<{found: boolean, details: any}> {
    console.log('🔍 Scanning for active Alpaca session in Edge browser...');
    
    return new Promise((resolve) => {
      const pythonScript = `
import subprocess
import json
import re

def check_alpaca_session():
    try:
        # Check for Edge processes
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        processes = result.stdout
        
        # Look for Alpaca-related processes
        alpaca_indicators = [
            'alpaca.markets',
            'app.alpaca.markets', 
            'paper-api.alpaca.markets',
            'api.alpaca.markets'
        ]
        
        found_sessions = []
        for line in processes.split('\\n'):
            for indicator in alpaca_indicators:
                if indicator in line.lower():
                    found_sessions.append({
                        'type': 'process',
                        'indicator': indicator,
                        'process_line': line.strip()
                    })
        
        # Try to get browser tabs if remote debugging is available
        try:
            import requests
            response = requests.get('http://localhost:9222/json/tabs', timeout=2)
            tabs = response.json()
            
            for tab in tabs:
                url = tab.get('url', '').lower()
                if 'alpaca' in url:
                    found_sessions.append({
                        'type': 'browser_tab',
                        'url': tab.get('url'),
                        'title': tab.get('title', ''),
                        'id': tab.get('id')
                    })
        except:
            pass
        
        result = {
            'found': len(found_sessions) > 0,
            'sessions': found_sessions,
            'count': len(found_sessions)
        }
        
        print(f"ALPACA_SESSION_RESULT:{json.dumps(result)}")
        
    except Exception as e:
        print(f"ALPACA_SESSION_ERROR:{str(e)}")

check_alpaca_session()
`;

      const pythonProcess = spawn('python3', ['-c', pythonScript]);
      
      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (output.includes('ALPACA_SESSION_RESULT')) {
          const jsonStr = output.split('ALPACA_SESSION_RESULT:')[1].trim();
          try {
            const result = JSON.parse(jsonStr);
            resolve(result);
          } catch (error) {
            resolve({ found: false, details: null });
          }
        } else {
          resolve({ found: false, details: null });
        }
      });
    });
  }
}

export const alpacaAPIKeyFinder = new AlpacaAPIKeyFinder();
