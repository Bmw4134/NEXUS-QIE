
import React, { useState, useEffect } from 'react';
import { useKaizenAssistant } from './KaizenAssistantCore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

interface EventLog {
  id: string;
  eventName: string;
  data: any;
  timestamp: Date;
}

export const DebugOverlay: React.FC = () => {
  const { eventBus } = useKaizenAssistant();
  const [isVisible, setIsVisible] = useState(false);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    
    // Subscribe to all events we want to track
    const eventsToTrack = [
      'prompt_executed',
      'chart_requested',
      'validation_required',
      'metric_collected',
      'widget_registered',
      'widget_updated',
      'kaizen_system_ready'
    ];

    eventsToTrack.forEach(eventName => {
      const unsubscribe = eventBus.subscribe(eventName, (data) => {
        const log: EventLog = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          eventName,
          data,
          timestamp: new Date()
        };
        
        setEventLogs(prev => [log, ...prev.slice(0, 49)]); // Keep last 50 events
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [eventBus]);

  const filteredLogs = eventLogs.filter(log => 
    !filter || log.eventName.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
        >
          <Eye className="w-4 h-4 mr-1" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-80 z-50">
      <Card className="bg-slate-900/95 border-slate-700 text-white h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Event Bus Debug</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setEventLogs([])}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Filter events..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded"
          />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          {/* Performance Summary */}
          <div className="mb-3 p-2 bg-slate-800 rounded border">
            <div className="text-xs font-semibold mb-1">Performance Summary</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Events: {eventLogs.length}</div>
              <div>Memory: {(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0).toFixed(1)}MB</div>
            </div>
          </div>

          <div className="space-y-1">
            {filteredLogs.map(log => (
              <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-2 py-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {log.eventName}
                  </Badge>
                  <span className="text-gray-400">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {log.data && (
                  <div className="text-gray-300 mt-1 max-h-16 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(log.data, null, 1)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
