import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SignatureBrandingProps {
  className?: string;
  showCompanyName?: boolean;
  animated?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
}

interface MetricCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  label: string;
}

export function SignatureBranding({ 
  className, 
  showCompanyName = true, 
  animated = true,
  glowIntensity = 'medium'
}: SignatureBrandingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const glowStyles = {
    low: 'drop-shadow-[0_0_15px_rgba(0,255,100,0.6)]',
    medium: 'drop-shadow-[0_0_30px_rgba(0,255,100,0.8)]',
    high: 'drop-shadow-[0_0_40px_rgba(0,255,100,1)]'
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <AnimatePresence>
        {isVisible && showCompanyName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <motion.h1
              className={cn(
                "text-4xl md:text-6xl font-black tracking-wide text-[#00ff64]",
                glowStyles[glowIntensity],
                animated && "animate-pulse"
              )}
              style={{
                textShadow: animated ? '0 0 30px rgba(0, 255, 100, 0.8)' : undefined,
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
              animate={animated ? {
                textShadow: [
                  '0 0 30px rgba(0, 255, 100, 0.8)',
                  '0 0 40px rgba(0, 255, 100, 1)',
                  '0 0 30px rgba(0, 255, 100, 0.8)'
                ]
              } : undefined}
              transition={animated ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              NEXUS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-gray-300 mt-2 tracking-wider"
            >
              Quantum Intelligence Platform
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MetricCounter({ 
  target, 
  prefix = '', 
  suffix = '', 
  duration = 2, 
  className,
  label 
}: MetricCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(startValue + (target - startValue) * easeOutQuart);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }, 500);

    return () => clearTimeout(timer);
  }, [target, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("text-center", className)}
    >
      <motion.div
        className="text-3xl md:text-4xl font-bold text-[#00ff64]"
        style={{ textShadow: '0 0 20px rgba(0, 255, 100, 0.6)' }}
        animate={{
          scale: count === target ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {prefix}{count.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-sm text-gray-400 mt-1 uppercase tracking-wide">
        {label}
      </div>
    </motion.div>
  );
}

export function GlassEffectCard({ 
  children, 
  className, 
  hoverEffect = true 
}: { 
  children: React.ReactNode; 
  className?: string; 
  hoverEffect?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "backdrop-blur-lg bg-black/20 border border-[#00ff64]/30 rounded-2xl p-6",
        "shadow-lg shadow-[#00ff64]/10",
        hoverEffect && "hover:bg-black/30 hover:border-[#00ff64]/50 hover:shadow-[#00ff64]/20",
        "transition-all duration-300",
        className
      )}
      whileHover={hoverEffect ? { y: -5, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function ParticleBackground({ density = 50 }: { density?: number }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [density]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[#00ff64]/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

export function SuccessMetricsBanner({ 
  metrics 
}: { 
  metrics: Array<{ value: number; label: string; prefix?: string; suffix?: string }> 
}) {
  return (
    <GlassEffectCard className="w-full">
      <ParticleBackground density={30} />
      <div className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCounter
              key={index}
              target={metric.value}
              prefix={metric.prefix}
              suffix={metric.suffix}
              label={metric.label}
              duration={2 + index * 0.3}
            />
          ))}
        </div>
      </div>
    </GlassEffectCard>
  );
}

export function SignatureButton({ 
  children, 
  onClick, 
  variant = 'primary',
  className,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  [key: string]: any;
}) {
  const variants = {
    primary: "bg-[#00ff64]/20 border-[#00ff64] text-[#00ff64] hover:bg-[#00ff64]/30 hover:shadow-[0_0_20px_rgba(0,255,100,0.5)]",
    secondary: "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500",
    ghost: "bg-transparent border-transparent text-[#00ff64] hover:bg-[#00ff64]/10"
  };

  return (
    <motion.button
      className={cn(
        "px-6 py-3 rounded-lg border-2 font-semibold tracking-wide",
        "transition-all duration-300 backdrop-blur-sm",
        variants[variant],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}