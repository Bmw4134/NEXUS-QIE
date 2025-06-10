import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  successAnimation?: boolean;
  pulseOnHover?: boolean;
  glowEffect?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  successAnimation = true,
  pulseOnHover = true,
  glowEffect = false,
  ...props
}: AnimatedButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsClicked(true);
    
    if (successAnimation) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 600);
    }
    
    setTimeout(() => setIsClicked(false), 150);
    
    onClick?.();
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: pulseOnHover ? { 
      scale: 1.02,
      transition: { duration: 0.2 }
    } : {},
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    clicked: {
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3 }
    }
  };

  const glowVariants = {
    initial: { opacity: 0, scale: 1 },
    hover: glowEffect ? {
      opacity: 0.6,
      scale: 1.1,
      transition: { duration: 0.3 }
    } : {},
    clicked: {
      opacity: [0, 0.8, 0],
      scale: [1, 1.2, 1.4],
      transition: { duration: 0.6 }
    }
  };

  const successVariants = {
    initial: { scale: 0, opacity: 0 },
    show: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0],
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div className="relative inline-block">
      {/* Glow Effect */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-md blur-md"
          variants={glowVariants}
          initial="initial"
          whileHover="hover"
          animate={isClicked ? "clicked" : "initial"}
        />
      )}
      
      {/* Main Button */}
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={isClicked ? "clicked" : "initial"}
      >
        <Button
          variant={variant}
          size={size}
          className={cn(
            "relative z-10 transition-all duration-200",
            showSuccess && "bg-green-500 hover:bg-green-600",
            className
          )}
          onClick={handleClick}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      </motion.div>

      {/* Success Ripple */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 bg-green-400 rounded-md opacity-30"
          variants={successVariants}
          initial="initial"
          animate="show"
        />
      )}
    </motion.div>
  );
}