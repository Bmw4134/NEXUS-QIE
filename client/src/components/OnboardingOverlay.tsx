import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  Brain, 
  Shield, 
  ChevronRight,
  CheckCircle,
  ArrowDown
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  highlight: string;
  icon: React.ComponentType<any>;
  position: { x: string; y: string };
}

interface OnboardingOverlayProps {
  show: boolean;
  onComplete: () => void;
}

export function OnboardingOverlay({ show, onComplete }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to NEXUS Quantum Intelligence',
      description: 'Your enterprise-grade trading and intelligence platform',
      highlight: 'Live trading balance: $756.95 with real-time market data',
      icon: Sparkles,
      position: { x: '50%', y: '20%' }
    },
    {
      id: 'hero-metrics',
      title: 'Live Trading Dashboard',
      description: 'Monitor your real-time trading balance and AI performance',
      highlight: 'Click any metric card to see animated celebrations',
      icon: TrendingUp,
      position: { x: '50%', y: '35%' }
    },
    {
      id: 'quick-actions',
      title: 'Interactive Demo Features',
      description: 'Test the animated micro-interactions and success celebrations',
      highlight: 'Try the colorful action buttons to see particle effects',
      icon: Brain,
      position: { x: '50%', y: '55%' }
    },
    {
      id: 'floating-button',
      title: 'Quantum Trading Hub',
      description: 'Access quick trading actions via the floating menu',
      highlight: 'Located in bottom-right corner with expandable options',
      icon: Shield,
      position: { x: '85%', y: '85%' }
    }
  ];

  const nextStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Onboarding Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[101]"
            style={{ 
              left: steps[currentStep].position.x, 
              top: steps[currentStep].position.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Card className="w-80 shadow-2xl border-purple-200 dark:border-purple-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    Step {currentStep + 1} of {steps.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip Tour
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 text-purple-600" })}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
                  </div>
                </div>
                
                <Progress value={progressPercentage} className="mt-3" />
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-3">
                  {steps[currentStep].description}
                </CardDescription>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {steps[currentStep].highlight}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          completedSteps.has(index)
                            ? 'bg-green-500'
                            : index === currentStep
                            ? 'bg-purple-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                    {currentStep === steps.length - 1 ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pointer Arrow */}
            {currentStep > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              >
                <ArrowDown className="h-6 w-6 text-purple-600 animate-bounce" />
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}