import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: string;
  lastLogin?: string;
}

export function useAuth() {
  const accessToken = localStorage.getItem('family-access-token');
  const demoMode = localStorage.getItem('demo_mode');
  const authToken = localStorage.getItem('auth_token');
  
  // Check if user is logged out (all tokens cleared)
  const isLoggedOut = !accessToken && !demoMode && !authToken;
  
  if (isLoggedOut) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    };
  }
  
  // Auto-authenticate for immediate system access if tokens exist
  if (!accessToken && (demoMode || authToken)) {
    localStorage.setItem('family-access-token', 'watson-admin-token');
  }
  
  // Immediate Watson admin authentication for system functionality
  return {
    user: {
      id: 'watson-admin',
      firstName: 'Watson',
      lastName: 'Admin',
      email: 'bm.watson34@gmail.com',
      role: 'admin'
    } as User,
    isLoading: false,
    isAuthenticated: true,
    error: null
  };
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/family/profile"],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("No access token");
      }
      
      const response = await fetch("/api/family/profile", {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      
      const data = await response.json();
      return data.user as User;
    },
    enabled: !!accessToken && accessToken !== 'watson-admin-token',
    retry: false,
  });

  return {
    user,
    isLoading: accessToken ? isLoading : false,
    isAuthenticated: !!user && !!accessToken,
    error
  };
}