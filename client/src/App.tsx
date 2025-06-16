
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

// Enterprise Dashboard Pages
import Dashboard from '@/pages/Dashboard';
import QIEIntelligenceHub from '@/pages/QIEIntelligenceHub';
import LandingPage from '@/pages/LandingPage';

// Enterprise Landing Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Globe, 
  Cpu,
  Zap,
  Target,
  Star,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      refetchInterval: 30 * 1000,
    },
  },
});

// Enterprise Animated Counter Component
const EnterpriseCounter = ({ value, prefix = '', suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span 
      className="font-bold text-3xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

// Enterprise Landing Page Component
const EnterpriseLanding = () => {
  const [activeMetric, setActiveMetric] = useState(0);

  const enterpriseMetrics = [
    { value: 778.19, prefix: '$', suffix: '', label: 'Live Balance', color: 'text-green-400' },
    { value: 99.2, prefix: '', suffix: '%', label: 'AI Accuracy', color: 'text-blue-400' },
    { value: 247000, prefix: '$', suffix: '', label: 'Monthly Volume', color: 'text-purple-400' },
    { value: 5, prefix: '', suffix: '', label: 'Data Sources', color: 'text-orange-400' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % enterpriseMetrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enterprise Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Enterprise Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            className="text-8xl font-black mb-8 tracking-wider"
            style={{
              background: 'linear-gradient(45deg, #00ff64, #00d4ff, #ff6b35)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 255, 100, 0.5)'
            }}
            animate={{ 
              textShadow: [
                '0 0 40px rgba(0, 255, 100, 0.5)',
                '0 0 60px rgba(0, 255, 100, 0.8)',
                '0 0 40px rgba(0, 255, 100, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            NEXUS QIE
          </motion.h1>
          
          <motion.h2 
            className="text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Quantum Intelligence Enterprise
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            The world's most advanced AI-powered trading platform. Quantum-enhanced decision making, 
            autonomous trading algorithms, and enterprise-grade security for the modern financial elite.
          </motion.p>
        </motion.div>

        {/* Enterprise Metrics Banner */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          {enterpriseMetrics.map((metric, index) => (
            <motion.div
              key={index}
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-black/20 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
                <div className="relative z-10">
                  <EnterpriseCounter 
                    value={metric.value} 
                    prefix={metric.prefix} 
                    suffix={metric.suffix} 
                  />
                  <p className="text-gray-300 mt-2 font-medium">{metric.label}</p>
                </div>
                {activeMetric === index && (
                  <motion.div
                    className="absolute inset-0 border-2 border-green-400 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-2xl transform transition-all duration-300 hover:scale-105"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Rocket className="mr-3 h-6 w-6" />
            Launch Dashboard
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-bold py-4 px-12 rounded-full text-lg backdrop-blur-sm"
            onClick={() => window.location.href = '/qie-intelligence-hub'}
          >
            <Brain className="mr-3 h-6 w-6" />
            Intelligence Hub
          </Button>
        </motion.div>

        {/* Enterprise Status Indicator */}
        <motion.div 
          className="fixed bottom-8 right-8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <motion.div 
              className="w-3 h-3 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-green-400 font-medium">NEXUS ONLINE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Show Enterprise Landing for root path
  if (currentPath === '/' || currentPath === '') {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="nexus-ui-theme">
        <QueryClientProvider client={queryClient}>
          <EnterpriseLanding />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nexus-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Routes>
              <Route path="/" element={<EnterpriseLanding />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/qie-intelligence-hub" element={<QIEIntelligenceHub />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
