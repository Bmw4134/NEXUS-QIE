
import React, { Suspense } from 'react';
import { Skeleton } from './ui/skeleton';

interface AsyncComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AsyncComponentWrapper({ children, fallback }: AsyncComponentWrapperProps) {
  const defaultFallback = (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}
