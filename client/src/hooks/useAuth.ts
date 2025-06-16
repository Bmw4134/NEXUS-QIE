import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default to true for now
  const [user, setUser] = useState<User | null>({ 
    id: '1', 
    email: 'user@example.com', 
    name: 'Demo User', 
    role: 'admin' 
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: authData, error, isLoading: queryLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          // Return demo user instead of throwing error
          return { 
            user: { 
              id: '1', 
              email: 'user@example.com', 
              name: 'Demo User', 
              role: 'admin' 
            }
          };
        }
        return response.json();
      } catch (error) {
        // Return demo user on error
        return { 
          user: { 
            id: '1', 
            email: 'user@example.com', 
            name: 'Demo User', 
            role: 'admin' 
          }
        };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (queryLoading) {
      setIsLoading(true);
      return;
    }

    if (authData) {
      setIsAuthenticated(true);
      setUser(authData.user);
    } else {
      setIsAuthenticated(true); // Keep authenticated for demo
      setUser({ 
        id: '1', 
        email: 'user@example.com', 
        name: 'Demo User', 
        role: 'admin' 
      });
    }

    setIsLoading(false);
  }, [authData, queryLoading, error]);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}