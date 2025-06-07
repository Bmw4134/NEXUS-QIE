import puppeteer, { Browser, Page } from 'puppeteer';
import express from 'express';

export interface PTNIProxySession {
  browser: Browser | null;
  page: Page | null;
  sessionId: string;
  isActive: boolean;
  targetUrl: string;
  lastActivity: Date;
}

export class PTNIBrowserProxy {
  private sessions: Map<string, PTNIProxySession> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeProxy();
  }

  private async initializeProxy() {
    console.log('🔮 PTNI Browser Proxy: Initializing quantum tunnel...');
    this.isInitialized = true;
  }

  async createProxySession(targetUrl: string): Promise<string> {
    const sessionId = `ptni-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🌐 PTNI Proxy: Creating session for ${targetUrl}`);
    
    try {
      // Launch headless browser for proxying
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });

      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to target URL
      console.log(`🔗 PTNI Proxy: Navigating to ${targetUrl}`);
      await page.goto(targetUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const session: PTNIProxySession = {
        browser,
        page,
        sessionId,
        isActive: true,
        targetUrl,
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, session);
      
      console.log(`✅ PTNI Proxy: Session ${sessionId} created successfully`);
      return sessionId;

    } catch (error) {
      console.error('❌ PTNI Proxy: Failed to create session:', error);
      throw new Error(`Failed to create proxy session: ${error}`);
    }
  }

  async getPageScreenshot(sessionId: string): Promise<string | null> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.page) {
      return null;
    }

    try {
      session.lastActivity = new Date();
      const screenshot = await session.page.screenshot({ 
        type: 'png',
        encoding: 'base64',
        fullPage: false
      });
      return screenshot as string;
    } catch (error) {
      console.error('PTNI Proxy: Screenshot failed:', error);
      return null;
    }
  }

  async getPageContent(sessionId: string): Promise<string | null> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.page) {
      return null;
    }

    try {
      session.lastActivity = new Date();
      
      // Get the page content and inject PTNI modifications
      const content = await session.page.evaluate(() => {
        // Remove X-Frame-Options headers and modify page for embedding
        const metaTags = document.querySelectorAll('meta[http-equiv]');
        metaTags.forEach(tag => {
          if (tag.getAttribute('http-equiv')?.toLowerCase().includes('frame')) {
            tag.remove();
          }
        });

        // Add PTNI styling for better integration
        const style = document.createElement('style');
        style.textContent = `
          body { 
            margin: 0 !important; 
            padding: 0 !important;
            background: #1a1a1a !important;
          }
          .ptni-overlay {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 100, 200, 0.9);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 999999;
          }
        `;
        document.head.appendChild(style);

        // Add PTNI status overlay
        const overlay = document.createElement('div');
        overlay.className = 'ptni-overlay';
        overlay.textContent = 'PTNI QUANTUM TUNNEL ACTIVE';
        document.body.appendChild(overlay);

        return document.documentElement.outerHTML;
      });

      return content;
    } catch (error) {
      console.error('PTNI Proxy: Content extraction failed:', error);
      return null;
    }
  }

  async navigateSession(sessionId: string, url: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.page) {
      return false;
    }

    try {
      console.log(`🔗 PTNI Proxy: Navigating session ${sessionId} to ${url}`);
      await session.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      session.targetUrl = url;
      session.lastActivity = new Date();
      return true;
    } catch (error) {
      console.error('PTNI Proxy: Navigation failed:', error);
      return false;
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.browser) {
        await session.browser.close();
      }
      this.sessions.delete(sessionId);
      console.log(`🗑️ PTNI Proxy: Session ${sessionId} destroyed`);
    }
  }

  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys()).filter(id => {
      const session = this.sessions.get(id);
      return session?.isActive;
    });
  }

  async cleanup(): Promise<void> {
    console.log('🧹 PTNI Proxy: Cleaning up sessions...');
    for (const [sessionId, session] of this.sessions) {
      if (session.browser) {
        await session.browser.close();
      }
    }
    this.sessions.clear();
  }
}

export const ptniProxy = new PTNIBrowserProxy();