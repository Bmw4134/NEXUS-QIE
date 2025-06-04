import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  Search
} from 'lucide-react';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  favicon?: string;
}

export function InternalBrowser() {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: '1',
      title: 'NEXUS Dashboard',
      url: window.location.origin,
      isActive: true
    }
  ]);
  const [currentUrl, setCurrentUrl] = useState(window.location.origin);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const quickAccess = [
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com', icon: TrendingUp },
    { name: 'CoinGecko', url: 'https://www.coingecko.com', icon: Zap },
    { name: 'TradingView', url: 'https://www.tradingview.com', icon: TrendingUp },
    { name: 'Reuters', url: 'https://www.reuters.com/business/finance', icon: Globe },
    { name: 'Bloomberg', url: 'https://www.bloomberg.com/markets', icon: TrendingUp },
    { name: 'Perplexity', url: 'https://www.perplexity.ai', icon: Search }
  ];

  const createNewTab = (url: string, title?: string) => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      title: title || 'New Tab',
      url,
      isActive: true
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab));
    setCurrentUrl(url);
    navigateToUrl(url);
  };

  const switchTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));

    const activeTab = tabs.find(tab => tab.id === tabId);
    if (activeTab) {
      setCurrentUrl(activeTab.url);
      navigateToUrl(activeTab.url);
    }
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const wasActive = tabs[tabIndex].isActive;
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));

    if (wasActive) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      const newActiveTabs = tabs.filter(tab => tab.id !== tabId);
      if (newActiveTabs[newActiveIndex]) {
        switchTab(newActiveTabs[newActiveIndex].id);
      }
    }
  };

  const navigateToUrl = (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    // Update current tab title
    setTabs(prev => prev.map(tab => 
      tab.isActive ? { ...tab, url, title: getDomainName(url) } : tab
    ));

    setTimeout(() => setIsLoading(false), 2000);
  };

  const getDomainName = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlInput = e.target as HTMLFormElement;
    const input = urlInput.elements.namedItem('url') as HTMLInputElement;
    let url = input.value;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    navigateToUrl(url);
  };

  const goBack = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const goForward = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const goHome = () => {
    navigateToUrl(window.location.origin);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Internal Browser
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => createNewTab('https://www.google.com', 'Google')}
          >
            New Tab
          </Button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mt-2 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-t-lg border-b-2 cursor-pointer min-w-32 max-w-48 ${
                tab.isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => switchTab(tab.id)}
            >
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={goBack}>
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={goForward}>
              <ArrowRight className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={refresh}>
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={goHome}>
              <Home className="w-3 h-3" />
            </Button>
          </div>

          <form onSubmit={handleUrlSubmit} className="flex-1">
            <div className="flex gap-2">
              <Input
                name="url"
                placeholder="Enter URL..."
                defaultValue={currentUrl}
                className="text-sm"
              />
              <Button type="submit" size="sm">
                Go
              </Button>
            </div>
          </form>

          <Badge variant={isLoading ? "secondary" : "default"} className="text-xs">
            {isLoading ? 'Loading...' : 'Ready'}
          </Badge>
        </div>

        {/* Quick Access */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap self-center">
            Quick:
          </span>
          {quickAccess.map((site) => {
            const IconComponent = site.icon;
            return (
              <Button
                key={site.name}
                size="sm"
                variant="outline"
                onClick={() => createNewTab(site.url, site.name)}
                className="text-xs whitespace-nowrap"
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {site.name}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="h-full border rounded-lg overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full"
            style={{ minHeight: '600px' }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-navigation"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </CardContent>
    </Card>
  );
}