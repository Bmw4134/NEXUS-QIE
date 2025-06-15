/**
 * Browser Session Detector
 * Automatically detects and extracts real account balances from active browser sessions
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { accountBalanceService } from './account-balance-service';

const execAsync = promisify(exec);

interface BrowserSession {
  processId: string;
  browserType: 'chrome' | 'edge' | 'firefox' | 'safari';
  debuggingPort?: number;
  sessionFiles: string[];
  cookiesPath?: string;
  localStoragePath?: string;
}

interface DetectedBalance {
  source: 'coinbase' | 'robinhood' | 'other';
  balance: number;
  currency: string;
  confidence: number;
  extractionMethod: string;
}

export class BrowserSessionDetector {
  private activeSessions: Map<string, BrowserSession> = new Map();
  private detectedBalances: DetectedBalance[] = [];
  private isScanning = false;

  constructor() {
    this.startContinuousScanning();
  }

  private startContinuousScanning() {
    setInterval(async () => {
      if (!this.isScanning) {
        await this.scanForActiveSessions();
      }
    }, 30000); // Scan every 30 seconds
  }

  async scanForActiveSessions(): Promise<BrowserSession[]> {
    this.isScanning = true;
    
    try {
      const sessions: BrowserSession[] = [];
      
      // Detect Chrome/Chromium browsers
      const chromeProcesses = await this.detectChromeProcesses();
      sessions.push(...chromeProcesses);
      
      // Detect Edge browsers
      const edgeProcesses = await this.detectEdgeProcesses();
      sessions.push(...edgeProcesses);
      
      // Update active sessions
      this.activeSessions.clear();
      for (const session of sessions) {
        this.activeSessions.set(session.processId, session);
      }
      
      // Extract balances from detected sessions
      await this.extractBalancesFromSessions();
      
      return sessions;
    } catch (error) {
      console.log('Session scanning failed, continuing with existing data');
      return [];
    } finally {
      this.isScanning = false;
    }
  }

  private async detectChromeProcesses(): Promise<BrowserSession[]> {
    try {
      const { stdout } = await execAsync('pgrep -f "chrome|chromium" || echo ""');
      const processes = stdout.trim().split('\n').filter(p => p);
      
      const sessions: BrowserSession[] = [];
      
      for (const processId of processes) {
        try {
          // Check if process has debugging enabled
          const { stdout: cmdline } = await execAsync(`cat /proc/${processId}/cmdline 2>/dev/null | tr '\\0' ' ' || echo ""`);
          
          if (cmdline.includes('remote-debugging-port')) {
            const portMatch = cmdline.match(/remote-debugging-port=(\d+)/);
            const debuggingPort = portMatch ? parseInt(portMatch[1]) : 9222;
            
            sessions.push({
              processId,
              browserType: 'chrome',
              debuggingPort,
              sessionFiles: await this.findSessionFiles(processId, 'chrome'),
              cookiesPath: await this.findCookiesPath(processId, 'chrome'),
              localStoragePath: await this.findLocalStoragePath(processId, 'chrome')
            });
          }
        } catch (error) {
          continue;
        }
      }
      
      return sessions;
    } catch (error) {
      return [];
    }
  }

  private async detectEdgeProcesses(): Promise<BrowserSession[]> {
    try {
      const { stdout } = await execAsync('pgrep -f "msedge|Microsoft Edge" || echo ""');
      const processes = stdout.trim().split('\n').filter(p => p);
      
      const sessions: BrowserSession[] = [];
      
      for (const processId of processes) {
        try {
          const { stdout: cmdline } = await execAsync(`cat /proc/${processId}/cmdline 2>/dev/null | tr '\\0' ' ' || echo ""`);
          
          if (cmdline.includes('remote-debugging-port') || cmdline.includes('msedge')) {
            const portMatch = cmdline.match(/remote-debugging-port=(\d+)/);
            const debuggingPort = portMatch ? parseInt(portMatch[1]) : 9222;
            
            sessions.push({
              processId,
              browserType: 'edge',
              debuggingPort,
              sessionFiles: await this.findSessionFiles(processId, 'edge'),
              cookiesPath: await this.findCookiesPath(processId, 'edge'),
              localStoragePath: await this.findLocalStoragePath(processId, 'edge')
            });
          }
        } catch (error) {
          continue;
        }
      }
      
      return sessions;
    } catch (error) {
      return [];
    }
  }

  private async findSessionFiles(processId: string, browserType: string): Promise<string[]> {
    try {
      // Look for session storage files
      const sessionPaths = [
        `~/.config/google-chrome/Default/Session Storage`,
        `~/.config/microsoft-edge/Default/Session Storage`,
        `~/.cache/google-chrome/Default/Session Storage`,
        `~/.cache/microsoft-edge/Default/Session Storage`,
        `/tmp/chrome-session-${processId}`,
        `/tmp/edge-session-${processId}`
      ];
      
      const foundFiles: string[] = [];
      
      for (const path of sessionPaths) {
        try {
          const { stdout } = await execAsync(`find ${path} -name "*.log" -o -name "*.db" 2>/dev/null || echo ""`);
          if (stdout.trim()) {
            foundFiles.push(...stdout.trim().split('\n'));
          }
        } catch (error) {
          continue;
        }
      }
      
      return foundFiles;
    } catch (error) {
      return [];
    }
  }

  private async findCookiesPath(processId: string, browserType: string): Promise<string | undefined> {
    try {
      const cookiePaths = [
        `~/.config/google-chrome/Default/Cookies`,
        `~/.config/microsoft-edge/Default/Cookies`,
        `~/.cache/google-chrome/Default/Cookies`,
        `~/.cache/microsoft-edge/Default/Cookies`
      ];
      
      for (const path of cookiePaths) {
        try {
          const { stdout } = await execAsync(`ls -la "${path}" 2>/dev/null || echo ""`);
          if (stdout.trim()) {
            return path;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      // Continue
    }
    
    return undefined;
  }

  private async findLocalStoragePath(processId: string, browserType: string): Promise<string | undefined> {
    try {
      const storagePaths = [
        `~/.config/google-chrome/Default/Local Storage`,
        `~/.config/microsoft-edge/Default/Local Storage`,
        `~/.cache/google-chrome/Default/Local Storage`,
        `~/.cache/microsoft-edge/Default/Local Storage`
      ];
      
      for (const path of storagePaths) {
        try {
          const { stdout } = await execAsync(`ls -la "${path}" 2>/dev/null || echo ""`);
          if (stdout.trim()) {
            return path;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      // Continue
    }
    
    return undefined;
  }

  private async extractBalancesFromSessions() {
    const newBalances: DetectedBalance[] = [];
    
    for (const [processId, session] of this.activeSessions) {
      try {
        // Extract from session files
        const sessionBalances = await this.extractFromSessionFiles(session);
        newBalances.push(...sessionBalances);
        
        // Extract from cookies if available
        if (session.cookiesPath) {
          const cookieBalances = await this.extractFromCookies(session.cookiesPath);
          newBalances.push(...cookieBalances);
        }
        
        // Extract from local storage if available
        if (session.localStoragePath) {
          const storageBalances = await this.extractFromLocalStorage(session.localStoragePath);
          newBalances.push(...storageBalances);
        }
        
        // Extract using debugging port if available
        if (session.debuggingPort) {
          const debugBalances = await this.extractFromDebugging(session.debuggingPort);
          newBalances.push(...debugBalances);
        }
      } catch (error) {
        continue;
      }
    }
    
    // Update detected balances and account service
    this.detectedBalances = newBalances;
    await this.updateAccountBalances();
  }

  private async extractFromSessionFiles(session: BrowserSession): Promise<DetectedBalance[]> {
    const balances: DetectedBalance[] = [];
    
    for (const file of session.sessionFiles) {
      try {
        const { stdout } = await execAsync(`grep -a "coinbase\\|balance\\|\\$[0-9]" "${file}" 2>/dev/null || echo ""`);
        
        if (stdout.trim()) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            const balance = this.parseBalanceFromText(line);
            if (balance) {
              balances.push({
                source: this.determineSource(line),
                balance: balance.amount,
                currency: balance.currency,
                confidence: 0.7,
                extractionMethod: 'session_file'
              });
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return balances;
  }

  private async extractFromCookies(cookiesPath: string): Promise<DetectedBalance[]> {
    const balances: DetectedBalance[] = [];
    
    try {
      // Use sqlite3 to read cookies database
      const { stdout } = await execAsync(`sqlite3 "${cookiesPath}" "SELECT name, value FROM cookies WHERE host_key LIKE '%coinbase%' OR host_key LIKE '%robinhood%';" 2>/dev/null || echo ""`);
      
      if (stdout.trim()) {
        const lines = stdout.split('\n');
        for (const line of lines) {
          const balance = this.parseBalanceFromText(line);
          if (balance) {
            balances.push({
              source: this.determineSource(line),
              balance: balance.amount,
              currency: balance.currency,
              confidence: 0.8,
              extractionMethod: 'cookies'
            });
          }
        }
      }
    } catch (error) {
      // Continue if sqlite3 not available
    }
    
    return balances;
  }

  private async extractFromLocalStorage(storagePath: string): Promise<DetectedBalance[]> {
    const balances: DetectedBalance[] = [];
    
    try {
      const { stdout } = await execAsync(`find "${storagePath}" -name "*.leveldb" -exec grep -a "balance\\|\\$[0-9]" {} \\; 2>/dev/null || echo ""`);
      
      if (stdout.trim()) {
        const lines = stdout.split('\n');
        for (const line of lines) {
          const balance = this.parseBalanceFromText(line);
          if (balance) {
            balances.push({
              source: this.determineSource(line),
              balance: balance.amount,
              currency: balance.currency,
              confidence: 0.9,
              extractionMethod: 'local_storage'
            });
          }
        }
      }
    } catch (error) {
      // Continue
    }
    
    return balances;
  }

  private async extractFromDebugging(port: number): Promise<DetectedBalance[]> {
    const balances: DetectedBalance[] = [];
    
    try {
      // Try to connect to debugging port and get page information
      const response = await fetch(`http://localhost:${port}/json`);
      const pages = await response.json();
      
      for (const page of pages) {
        if (page.url && (page.url.includes('coinbase') || page.url.includes('robinhood'))) {
          // Found relevant page, mark for potential extraction
          balances.push({
            source: page.url.includes('coinbase') ? 'coinbase' : 'robinhood',
            balance: 0, // Will be updated by other extraction methods
            currency: 'USD',
            confidence: 0.5,
            extractionMethod: 'debugging_port'
          });
        }
      }
    } catch (error) {
      // Continue if debugging connection fails
    }
    
    return balances;
  }

  private parseBalanceFromText(text: string): { amount: number; currency: string } | null {
    // Look for dollar amounts
    const dollarMatch = text.match(/\$[\d,]+\.?\d*/);
    if (dollarMatch) {
      const amount = parseFloat(dollarMatch[0].replace(/[$,]/g, ''));
      if (amount > 0 && amount < 1000000) {
        return { amount, currency: 'USD' };
      }
    }
    
    // Look for other currency formats
    const numberMatch = text.match(/balance["\s:]*(\d+\.?\d*)/i);
    if (numberMatch) {
      const amount = parseFloat(numberMatch[1]);
      if (amount > 0 && amount < 1000000) {
        return { amount, currency: 'USD' };
      }
    }
    
    return null;
  }

  private determineSource(text: string): 'coinbase' | 'robinhood' | 'other' {
    if (text.toLowerCase().includes('coinbase')) {
      return 'coinbase';
    } else if (text.toLowerCase().includes('robinhood')) {
      return 'robinhood';
    }
    return 'other';
  }

  private async updateAccountBalances() {
    // Find the highest confidence balance for each source
    const coinbaseBalances = this.detectedBalances.filter(b => b.source === 'coinbase');
    const robinhoodBalances = this.detectedBalances.filter(b => b.source === 'robinhood');
    
    if (coinbaseBalances.length > 0) {
      const bestCoinbase = coinbaseBalances.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      if (bestCoinbase.balance > 0) {
        console.log(`💰 Real Coinbase balance detected: $${bestCoinbase.balance.toFixed(2)} (${bestCoinbase.extractionMethod})`);
        accountBalanceService.updateBalance(bestCoinbase.balance, 'system');
      }
    }
    
    if (robinhoodBalances.length > 0) {
      const bestRobinhood = robinhoodBalances.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      if (bestRobinhood.balance > 0) {
        console.log(`💰 Real Robinhood balance detected: $${bestRobinhood.balance.toFixed(2)} (${bestRobinhood.extractionMethod})`);
        accountBalanceService.syncWithRobinhoodLegend(bestRobinhood.balance);
      }
    }
  }

  getDetectedSessions(): BrowserSession[] {
    return Array.from(this.activeSessions.values());
  }

  getDetectedBalances(): DetectedBalance[] {
    return this.detectedBalances;
  }

  async forceRescan(): Promise<void> {
    await this.scanForActiveSessions();
  }

  getStatus() {
    return {
      activeSessions: this.activeSessions.size,
      detectedBalances: this.detectedBalances.length,
      isScanning: this.isScanning,
      lastScan: new Date().toISOString()
    };
  }
}

export const browserSessionDetector = new BrowserSessionDetector();