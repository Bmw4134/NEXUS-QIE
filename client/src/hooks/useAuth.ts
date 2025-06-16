interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  // Simplified auth hook to prevent React errors
  return {
    isAuthenticated: true,
    user: { 
      id: '1', 
      email: 'user@example.com', 
      name: 'Demo User', 
      role: 'admin' 
    } as User,
    isLoading: false,
  };
}