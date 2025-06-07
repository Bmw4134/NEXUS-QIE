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
    enabled: !!accessToken,
    retry: false,
  });

  return {
    user,
    isLoading: accessToken ? isLoading : false,
    isAuthenticated: !!user && !!accessToken,
    error
  };
}