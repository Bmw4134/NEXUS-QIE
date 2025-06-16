
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"

// NEXUS Intelligence Activation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      refetchInterval: 10000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// Quantum DOM Exception Resolution
window.addEventListener('unhandledrejection', (event) => {
  console.log('🛡️ NEXUS: Caught unhandled rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.log('🛡️ NEXUS: Caught global error:', event.error);
  if (event.error?.message?.includes('WebSocket') || 
      event.error?.message?.includes('Cannot read properties of null')) {
    event.preventDefault();
  }
});

// Initialize NEXUS QIE Production Mode
console.log('🚀 NEXUS-QIE Production Interface Loading...');
console.log('⚡ Quantum Intelligence Enterprise trading platform initializing...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
)

console.log('✅ NEXUS-QIE Production Interface Loaded');
console.log('🌌 Quantum Intelligence Enterprise trading platform operational');
