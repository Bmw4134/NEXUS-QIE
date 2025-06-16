import React, { Suspense, ReactNode } from 'react';
import { Skeleton } from './ui/skeleton';

interface AsyncComponentWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AsyncComponentWrapper({ children, fallback }: AsyncComponentWrapperProps) {
  // Ensure children is properly resolved before rendering
  const resolvedChildren = React.isValidElement(children) ? children : null;

  if (!resolvedChildren) {
    return fallback || <Skeleton className="w-full h-32" />;
  }

  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-32" />}>
      {resolvedChildren}
    </Suspense>
  );
}

// Helper component for async components that return promises
export function PromiseResolver({ 
  promise, 
  fallback 
}: { 
  promise: Promise<ReactNode>; 
  fallback?: ReactNode;
}) {
  const [resolved, setResolved] = React.useState<ReactNode>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    promise
      .then(setResolved)
      .catch(() => setResolved(<div>Error loading component</div>))
      .finally(() => setLoading(false));
  }, [promise]);

  if (loading) {
    return <>{fallback || <Skeleton className="w-full h-32" />}</>;
  }

  return <>{resolved}</>;
}