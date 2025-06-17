
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  severity: 'error' | 'warning' | 'info';
}

export const ErrorOverlay: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error: ErrorLog = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        severity: 'error'
      };
      
      setErrors(prev => [error, ...prev.slice(0, 19)]); // Keep last 20 errors
      setIsVisible(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ErrorLog = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date(),
        severity: 'warning'
      };
      
      setErrors(prev => [error, ...prev.slice(0, 19)]);
      setIsVisible(true);
    };

    // Console error interceptor
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const error: ErrorLog = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: args.join(' '),
        timestamp: new Date(),
        severity: 'error'
      };
      
      setErrors(prev => [error, ...prev.slice(0, 19)]);
      originalConsoleError(...args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400 border-red-500';
      case 'warning': return 'text-yellow-400 border-yellow-500';
      case 'info': return 'text-blue-400 border-blue-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  if (!isVisible || errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 w-96 max-h-80 z-50">
      <Card className="bg-red-900/95 border-red-700 text-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <CardTitle className="text-sm">Assistant Errors ({errors.length})</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setErrors([])}
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
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-60 p-2">
          <div className="space-y-2">
            {errors.map(error => (
              <div key={error.id} className={`border-l-2 pl-2 py-1 ${getSeverityColor(error.severity)}`}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {error.severity}
                  </Badge>
                  <span className="text-xs text-gray-300">
                    {error.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs font-medium mb-1">
                  {error.message}
                </div>
                {error.stack && (
                  <details className="text-xs text-gray-300">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
