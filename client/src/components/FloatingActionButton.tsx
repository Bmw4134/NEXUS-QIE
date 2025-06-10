import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, TrendingUp, Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuccessCelebration } from './SuccessCelebration';

interface FloatingActionButtonProps {
  onTradeAction?: () => void;
  onPredictionAction?: () => void;
  onAIAction?: () => void;
  onSystemAction?: () => void;
}

export function FloatingActionButton({
  onTradeAction,
  onPredictionAction,
  onAIAction,
  onSystemAction
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { celebrate } = useSuccessCelebration();

  const actions = [
    {
      icon: TrendingUp,
      label: 'Execute Trade',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        onTradeAction?.();
        celebrate('trade', 'Trade executed successfully!', 'bottom-right');
        setIsOpen(false);
      }
    },
    {
      icon: Brain,
      label: 'AI Analysis',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        onAIAction?.();
        celebrate('prediction', 'AI analysis initiated!', 'bottom-right');
        setIsOpen(false);
      }
    },
    {
      icon: Zap,
      label: 'Quantum Boost',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        onSystemAction?.();
        celebrate('system', 'Quantum enhancement activated!', 'bottom-right');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'System Config',
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => {
        celebrate('system', 'System configuration accessed!', 'bottom-right');
        setIsOpen(false);
      }
    }
  ];

  const containerVariants = {
    open: {
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    closed: {
      scale: 1,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.3,
      transition: {
        duration: 0.2
      }
    }
  };

  const mainButtonVariants = {
    open: { rotate: 45 },
    closed: { rotate: 0 }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        variants={containerVariants}
        animate={isOpen ? "open" : "closed"}
        className="flex flex-col-reverse items-end space-y-reverse space-y-3"
      >
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <motion.div
                key={action.label}
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="closed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={action.onClick}
                  className={`${action.color} text-white shadow-lg w-12 h-12 rounded-full p-0 group relative`}
                  title={action.label}
                >
                  <IconComponent className="h-5 w-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute right-14 top-1/2 transform -translate-y-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {action.label}
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl w-14 h-14 rounded-full p-0"
          >
            <motion.div
              variants={mainButtonVariants}
              animate={isOpen ? "open" : "closed"}
            >
              <Plus className="h-6 w-6" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}