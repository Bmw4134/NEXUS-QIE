import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Zap, TrendingUp, Target } from 'lucide-react';

interface SuccessCelebrationProps {
  show: boolean;
  type: 'trade' | 'prediction' | 'system' | 'achievement' | 'general';
  message?: string;
  onComplete?: () => void;
  position?: 'center' | 'top-right' | 'bottom-right';
}

const celebrationVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    rotate: -180
  },
  visible: { 
    scale: [0, 1.2, 1],
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      scale: {
        times: [0, 0.6, 1],
        duration: 0.6
      }
    }
  },
  exit: { 
    scale: 0,
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3
    }
  }
};

const particleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    x: [0, (i % 2 ? 1 : -1) * (50 + i * 10)],
    y: [0, -30 - i * 5],
    transition: {
      duration: 1.5,
      delay: i * 0.1,
      ease: "easeOut"
    }
  })
};

const rippleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 4],
    opacity: [0.8, 0],
    transition: {
      duration: 1,
      ease: "easeOut"
    }
  }
};

export function SuccessCelebration({ 
  show, 
  type, 
  message, 
  onComplete,
  position = 'center' 
}: SuccessCelebrationProps) {
  const [particles] = useState(Array.from({ length: 8 }, (_, i) => i));

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'trade':
        return <TrendingUp className="h-8 w-8" />;
      case 'prediction':
        return <Target className="h-8 w-8" />;
      case 'system':
        return <Zap className="h-8 w-8" />;
      case 'achievement':
        return <Sparkles className="h-8 w-8" />;
      default:
        return <CheckCircle className="h-8 w-8" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'trade':
        return {
          primary: 'text-green-500',
          bg: 'bg-green-500/20',
          glow: 'shadow-green-500/50'
        };
      case 'prediction':
        return {
          primary: 'text-blue-500',
          bg: 'bg-blue-500/20',
          glow: 'shadow-blue-500/50'
        };
      case 'system':
        return {
          primary: 'text-purple-500',
          bg: 'bg-purple-500/20',
          glow: 'shadow-purple-500/50'
        };
      case 'achievement':
        return {
          primary: 'text-yellow-500',
          bg: 'bg-yellow-500/20',
          glow: 'shadow-yellow-500/50'
        };
      default:
        return {
          primary: 'text-emerald-500',
          bg: 'bg-emerald-500/20',
          glow: 'shadow-emerald-500/50'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={celebrationVariants}
        >
          {/* Ripple Effect */}
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.bg} ${colors.glow} shadow-2xl`}
            variants={rippleVariants}
          />
          
          {/* Main Success Icon */}
          <motion.div
            className={`relative z-10 p-4 rounded-full ${colors.bg} ${colors.glow} shadow-2xl backdrop-blur-sm`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={colors.primary}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 2, ease: "linear", repeat: Infinity },
                scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
              }}
            >
              {getIcon()}
            </motion.div>
          </motion.div>

          {/* Particle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((i) => (
              <motion.div
                key={i}
                className={`absolute top-1/2 left-1/2 w-2 h-2 ${colors.bg} rounded-full`}
                custom={i}
                variants={particleVariants}
                initial="hidden"
                animate="visible"
              />
            ))}
          </div>

          {/* Success Message */}
          {message && (
            <motion.div
              className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {message}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for triggering celebrations
export function useSuccessCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: 'trade' | 'prediction' | 'system' | 'achievement' | 'general';
    message?: string;
    position?: 'center' | 'top-right' | 'bottom-right';
  }>({
    show: false,
    type: 'general'
  });

  const celebrate = (
    type: 'trade' | 'prediction' | 'system' | 'achievement' | 'general',
    message?: string,
    position: 'center' | 'top-right' | 'bottom-right' = 'center'
  ) => {
    setCelebration({
      show: true,
      type,
      message,
      position
    });
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, show: false }));
  };

  return {
    celebration,
    celebrate,
    hideCelebration
  };
}