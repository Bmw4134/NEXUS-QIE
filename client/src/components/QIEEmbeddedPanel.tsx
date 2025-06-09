import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Brain, Radio, Activity, Minimize2, Maximize2, X, Settings } from 'lucide-react';

interface QIEPanelProps {
  panelId: string;
  type: 'mini_intelligence' | 'signal_feed' | 'ops_daemon';
  position?: 'top_right' | 'bottom_left' | 'floating';
  dashboard: string;
}

interface PanelData {
  totalSignals?: number;
  averageConfidence?: number;
  activePlatforms?: number;
  cognitionAccuracy?: number;
  signals?: Array<{
    id: string;
    source: string;
    type: string;
    confidence: number;
    timestamp: string;
  }>;
  status?: string;
  processedSignals?: number;
  activeMirrors?: number;
  systemLoad?: number;
  memoryUsage?: number;
  networkLatency?: number;
  lastUpdate?: string;
}

export default function QIEEmbeddedPanel({ panelId, type, position = 'floating', dashboard }: QIEPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const { data: panelData, isLoading } = useQuery<PanelData>({
    queryKey: [`/api/qie/embedded-panel/${panelId}`],
    refetchInterval: type === 'ops_daemon' ? 2000 : type === 'signal_feed' ? 3000 : 5000,
    retry: false
  });

  const { data: unifiedStatus } = useQuery({
    queryKey: ['/api/qie/unified/status'],
    refetchInterval: 10000,
    retry: false
  });

  if (!isVisible || !unifiedStatus?.config?.embeddedPanelsActive) {
    return null;
  }

  const renderMiniIntelligence = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="font-bold text-blue-900 dark:text-blue-100">
            {panelData?.totalSignals || 0}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Signals</div>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
          <div className="font-bold text-green-900 dark:text-green-100">
            {panelData?.averageConfidence || 0}%
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">Confidence</div>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>{panelData?.activePlatforms || 0} platforms</span>
        <span>{panelData?.cognitionAccuracy || 0}% accuracy</span>
      </div>
    </div>
  );

  const renderSignalFeed = () => (
    <div className="space-y-2">
      <div className="max-h-24 overflow-y-auto space-y-1">
        {panelData?.signals?.slice(0, 3).map((signal, index) => (
          <div key={index} className="flex items-center justify-between text-xs p-1 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                signal.source === 'TRAXOVO' ? 'bg-blue-500' :
                signal.source === 'DWC' ? 'bg-green-500' :
                signal.source === 'JDD' ? 'bg-purple-500' :
                'bg-orange-500'
              }`}></div>
              <span className="font-medium">{signal.source}</span>
              <span className="text-gray-500">{signal.type}</span>
            </div>
            <span className="text-gray-600">{signal.confidence}%</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 text-center">
        {panelData?.signals?.length || 0} active signals
      </div>
    </div>
  );

  const renderOpsDaemon = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="text-center">
          <div className="font-bold">{panelData?.processedSignals || 0}</div>
          <div className="text-gray-500">Processed</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{panelData?.activeMirrors || 0}</div>
          <div className="text-gray-500">Mirrors</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-green-600">{panelData?.status || 'active'}</div>
          <div className="text-gray-500">Status</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>CPU:</span>
          <span>{panelData?.systemLoad || 0}%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Memory:</span>
          <span>{panelData?.memoryUsage || 0}%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Latency:</span>
          <span>{panelData?.networkLatency || 0}ms</span>
        </div>
      </div>
    </div>
  );

  const getIcon = () => {
    switch (type) {
      case 'mini_intelligence': return Brain;
      case 'signal_feed': return Radio;
      case 'ops_daemon': return Activity;
      default: return Brain;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'mini_intelligence': return 'QIE Intelligence';
      case 'signal_feed': return 'Signal Feed';
      case 'ops_daemon': return 'Ops Daemon';
      default: return 'QIE Panel';
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'top_right': return 'fixed top-4 right-4 z-50';
      case 'bottom_left': return 'fixed bottom-4 left-4 z-50';
      case 'floating': return 'fixed top-20 right-4 z-50';
      default: return 'fixed top-20 right-4 z-50';
    }
  };

  const IconComponent = getIcon();

  return (
    <div className={`${getPositionClass()} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
      <Card className={`transition-all duration-300 ${
        isMinimized ? 'w-48 h-12' : 'w-64 h-auto'
      } bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg hover:shadow-xl`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <IconComponent className="h-4 w-4 mr-2" />
              {getTitle()}
              <Badge variant="outline" className="ml-2 text-xs">
                Live
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {type === 'mini_intelligence' && renderMiniIntelligence()}
                {type === 'signal_feed' && renderSignalFeed()}
                {type === 'ops_daemon' && renderOpsDaemon()}
              </>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {dashboard}
              </div>
              <div className="text-xs text-gray-500">
                {panelData?.lastUpdate 
                  ? new Date(panelData.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                }
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Settings Panel (appears on hover) */}
      {!isMinimized && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-white/90 dark:bg-gray-900/90 border shadow-sm"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}