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
  // Force clear localStorage on every check to ensure landing page shows
  // This addresses the issue where cached auth data bypasses the landing page
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('demo_mode');
  
  // Always return unauthenticated to show the complete application flow
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null
  };
}