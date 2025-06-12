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
  const authToken = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  // Check for valid authentication
  if (authToken && userData) {
    try {
      const user = JSON.parse(userData);
      return {
        user: user as User,
        isLoading: false,
        isAuthenticated: true,
        error: null
      };
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }
  
  // Not authenticated
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null
  };
}