import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Zap, Trophy, Target, Rocket } from 'lucide-react';

interface SuccessCelebrationProps {
  isVisible: boolean;
  message: string;
  type?: 'default' | 'achievement' | 'command' | 'optimization' | 'analysis' | 'emergency';
  duration?: number;
  onComplete?: () => void;
}

const celebrationVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotate: -10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
      duration: 0.6
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.1,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1.2, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.2,
      delay: i * 0.1,
      repeat: 2,
      ease: "easeInOut"
    }
  })
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function SuccessCelebration({ 
  isVisible, 
  message, 
  type = 'default', 
  duration = 3000,
  onComplete 
}: SuccessCelebrationProps) {
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowSparkles(true);
      const timer = setTimeout(() => {
        setShowSparkles(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'command':
        return <Zap className="w-8 h-8 text-blue-500" />;
      case 'optimization':
        return <Target className="w-8 h-8 text-green-500" />;
      case 'analysis':
        return <Sparkles className="w-8 h-8 text-purple-500" />;
      case 'emergency':
        return <Rocket className="w-8 h-8 text-red-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'achievement':
        return {
          bg: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20',
          border: 'border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'command':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200'
        };
      case 'optimization':
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-300 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200'
        };
      case 'analysis':
        return {
          bg: 'bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20',
          border: 'border-purple-300 dark:border-purple-700',
          text: 'text-purple-800 dark:text-purple-200'
        };
      case 'emergency':
        return {
          bg: 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-300 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200'
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          variants={celebrationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className={`relative p-4 rounded-lg border-2 ${colors.bg} ${colors.border} shadow-lg backdrop-blur-sm min-w-[300px]`}
            variants={pulseVariants}
            animate="pulse"
          >
            {/* Sparkle effects */}
            <AnimatePresence>
              {showSparkles && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${20 + (i * 12)}%`,
                        top: `${10 + (i % 2) * 70}%`
                      }}
                      variants={sparkleVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex items-center space-x-3 relative z-10">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {getIcon()}
              </motion.div>
              
              <div className="flex-1">
                <motion.div
                  className={`font-semibold ${colors.text}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Success!
                </motion.div>
                <motion.div
                  className={`text-sm ${colors.text} opacity-90`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {message}
                </motion.div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for triggering success celebrations
export function useSuccessCelebration() {
  const [celebration, setCelebration] = useState<{
    isVisible: boolean;
    message: string;
    type?: SuccessCelebrationProps['type'];
  }>({
    isVisible: false,
    message: '',
    type: 'default'
  });

  const celebrate = (
    message: string, 
    type: SuccessCelebrationProps['type'] = 'default'
  ) => {
    setCelebration({
      isVisible: true,
      message,
      type
    });
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  };

  return {
    celebration,
    celebrate,
    hideCelebration
  };
}