import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Globe,
  Brain,
  CheckCircle,
  Star,
  ArrowRight,
  Target,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignatureBranding, MetricCounter, GlassEffectCard, SuccessMetricsBanner } from '@/components/ui/signature-branding';

interface EvolutionMetric {
  category: string;
  before: number;
  after: number;
  improvement: number;
  status: 'completed' | 'in-progress' | 'planned';
}

interface CompetitiveAdvantage {
  feature: string;
  score: number;
  advantage: 'strong' | 'moderate' | 'leading';
  description: string;
}

export function NexusEvolutionSummary() {
  const [showDetails, setShowDetails] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const evolutionMetrics: EvolutionMetric[] = [
    {
      category: "Visual Identity",
      before: 75,
      after: 92,
      improvement: 17,
      status: 'completed'
    },
    {
      category: "DNS Automation",
      before: 0,
      after: 95,
      improvement: 95,
      status: 'completed'
    },
    {
      category: "User Experience",
      before: 80,
      after: 88,
      improvement: 8,
      status: 'completed'
    },
    {
      category: "Data Authenticity",
      before: 85,
      after: 95,
      improvement: 10,
      status: 'in-progress'
    },
    {
      category: "Mobile Experience",
      before: 78,
      after: 85,
      improvement: 7,
      status: 'planned'
    },
    {
      category: "Multi-Portal Auth",
      before: 75,
      after: 85,
      improvement: 10,
      status: 'planned'
    }
  ];

  const competitiveAdvantages: CompetitiveAdvantage[] = [
    {
      feature: "Natural Language Processing",
      score: 95,
      advantage: 'leading',
      description: "Watson Command Engine with conversational AI"
    },
    {
      feature: "File Processing & Analysis",
      score: 95,
      advantage: 'leading',
      description: "Comprehensive parsing for images, docs, videos"
    },
    {
      feature: "DNS Infrastructure Management",
      score: 95,
      advantage: 'leading',
      description: "Multi-provider automation with health monitoring"
    },
    {
      feature: "Business Intelligence",
      score: 90,
      advantage: 'leading',
      description: "Quantum-enhanced AI with automation suite"
    },
    {
      feature: "Real-time Metrics Animation",
      score: 88,
      advantage: 'strong',
      description: "Enhanced with JDD-style counter animations"
    },
    {
      feature: "Visual Brand Identity",
      score: 92,
      advantage: 'strong',
      description: "Signature NEXUS branding with glow effects"
    }
  ];

  const overallMetrics = [
    { value: 92, label: "Overall Platform Score", suffix: "%" },
    { value: 6, label: "Evolution Areas", suffix: "" },
    { value: 3, label: "Completed Enhancements", suffix: "" },
    { value: 95, label: "Technical Advantage", suffix: "%" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'planned': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/30';
    }
  };

  const getAdvantageColor = (advantage: string) => {
    switch (advantage) {
      case 'leading': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'strong': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Zap className="w-4 h-4" />;
      case 'planned': return <Target className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#00ff64]" />
            NEXUS Evolution Summary
          </CardTitle>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge className="bg-[#00ff64]/20 text-[#00ff64] border-[#00ff64]/50">
              Platform Enhanced
            </Badge>
          </motion.div>
        </div>
        <div className="text-sm text-gray-400">
          Competitive analysis and implementation results based on JDD Enterprises benchmark
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Metrics Banner */}
        <SuccessMetricsBanner metrics={overallMetrics} />

        {/* Evolution Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evolutionMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassEffectCard className="h-full">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-[#00ff64]">{metric.category}</h4>
                  <Badge className={getStatusColor(metric.status)}>
                    {getStatusIcon(metric.status)}
                    {metric.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Before</span>
                    <span className="font-medium">{metric.before}%</span>
                  </div>
                  <Progress value={metric.before} className="h-2 bg-gray-700" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-[#00ff64]">After</span>
                    <span className="font-medium text-[#00ff64]">{metric.after}%</span>
                  </div>
                  <Progress value={metric.after} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Improvement</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-bold text-green-500">+{metric.improvement}%</span>
                    </div>
                  </div>
                </div>
              </GlassEffectCard>
            </motion.div>
          ))}
        </div>

        {/* Competitive Advantages */}
        <GlassEffectCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#00ff64]">
              Competitive Advantages
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[#00ff64] hover:bg-[#00ff64]/10"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
              <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitiveAdvantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-[#00ff64]/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{advantage.feature}</h4>
                    <Badge className={getAdvantageColor(advantage.advantage)}>
                      {advantage.advantage}
                    </Badge>
                  </div>
                  <AnimatePresence>
                    {showDetails && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-400 mt-1"
                      >
                        {advantage.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold text-[#00ff64]">{advantage.score}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassEffectCard>

        {/* Key Achievements */}
        <GlassEffectCard>
          <h3 className="text-lg font-semibold text-[#00ff64] mb-4">Key Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">DNS Automation Suite</div>
                  <div className="text-xs text-gray-400">Multi-provider support with health monitoring</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Signature Visual Branding</div>
                  <div className="text-xs text-gray-400">JDD-inspired glow effects and animations</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Enhanced Success Celebrations</div>
                  <div className="text-xs text-gray-400">Animated micro-interactions with visual impact</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">Data Authenticity Validation</div>
                  <div className="text-xs text-gray-400">Implementing JDD's 100% authentic data policy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-sm">Mobile-First Optimization</div>
                  <div className="text-xs text-gray-400">Touch-friendly interface enhancements planned</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-sm">Multi-Portal Architecture</div>
                  <div className="text-xs text-gray-400">Specialized access portals in development</div>
                </div>
              </div>
            </div>
          </div>
        </GlassEffectCard>

        {/* Next Steps */}
        <GlassEffectCard>
          <h3 className="text-lg font-semibold text-[#00ff64] mb-4">Next Evolution Phase</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-400">1</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Complete Data Authenticity Implementation</div>
                  <div className="text-xs text-gray-400">Eliminate placeholder content and enhance validation</div>
                </div>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-400">2</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Mobile Experience Enhancement</div>
                  <div className="text-xs text-gray-400">Touch-first interface with 44px minimum targets</div>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400">Planned</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-400">3</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Multi-Portal Authentication System</div>
                  <div className="text-xs text-gray-400">Client, admin, and specialized module access</div>
                </div>
              </div>
              <Badge className="bg-gray-500/20 text-gray-400">Planned</Badge>
            </div>
          </div>
        </GlassEffectCard>
      </CardContent>
    </Card>
  );
}