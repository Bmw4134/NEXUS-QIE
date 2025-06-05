import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Rocket,
  CheckCircle,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignatureBranding, MetricCounter, GlassEffectCard, SuccessMetricsBanner } from '@/components/ui/signature-branding';

interface CompetitiveFeature {
  name: string;
  nexusScore: number;
  jddScore: number;
  advantage: 'nexus' | 'jdd' | 'tie';
  description: string;
  improvementOpportunity?: string;
}

interface EvolutionRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  feature: string;
  description: string;
  implementation: string;
  impact: number;
  status: 'planned' | 'in-progress' | 'completed';
}

export function CompetitiveIntelligencePanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'evolution'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const competitiveFeatures: CompetitiveFeature[] = [
    {
      name: "Natural Language Processing",
      nexusScore: 95,
      jddScore: 70,
      advantage: 'nexus',
      description: "NEXUS: Advanced Watson Command Engine with conversational AI. JDD: Basic BMI Intelligence model.",
      improvementOpportunity: "Enhance with emotional context awareness from JDD's blissful memories tracker"
    },
    {
      name: "Real-time Metrics Animation",
      nexusScore: 85,
      jddScore: 90,
      advantage: 'jdd',
      description: "JDD: Counter animations with 'wow factor' on load. NEXUS: Real-time data updates.",
      improvementOpportunity: "Implement JDD-style metric counter animations with visual impact"
    },
    {
      name: "File Processing & Analysis",
      nexusScore: 95,
      jddScore: 60,
      advantage: 'nexus',
      description: "NEXUS: Comprehensive file parsing (images, docs, videos). JDD: Basic file handling.",
      improvementOpportunity: "Maintain advantage while adding JDD's business document focus"
    },
    {
      name: "User Experience Design",
      nexusScore: 80,
      jddScore: 92,
      advantage: 'jdd',
      description: "JDD: Signature brand identity with green glow effects. NEXUS: Modern functional design.",
      improvementOpportunity: "Adopt JDD's signature visual branding approach for stronger identity"
    },
    {
      name: "Authentication & Access Control",
      nexusScore: 75,
      jddScore: 85,
      advantage: 'jdd',
      description: "JDD: Multiple portal system with tier-based access. NEXUS: Standard role-based access.",
      improvementOpportunity: "Implement JDD's multi-portal architecture with specialized access points"
    },
    {
      name: "Business Intelligence",
      nexusScore: 90,
      jddScore: 88,
      advantage: 'nexus',
      description: "NEXUS: Quantum-enhanced AI with automation suite. JDD: Focused commercial equipment intelligence.",
      improvementOpportunity: "Add JDD's industry-specific business valuation capabilities"
    },
    {
      name: "Data Authenticity",
      nexusScore: 85,
      jddScore: 100,
      advantage: 'jdd',
      description: "JDD: 100% authentic data policy with verification. NEXUS: Real-time data with some placeholders.",
      improvementOpportunity: "Implement JDD's strict authentic data validation system"
    },
    {
      name: "DNS Automation",
      nexusScore: 95,
      jddScore: 65,
      advantage: 'nexus',
      description: "NEXUS: Comprehensive DNS automation with multi-provider support. JDD: Basic domain management.",
      improvementOpportunity: "Enhance with JDD's business-focused domain optimization strategies"
    }
  ];

  const evolutionRecommendations: EvolutionRecommendation[] = [
    {
      category: "Visual Identity Evolution",
      priority: 'high',
      feature: "Signature Brand Glow Effects",
      description: "Implement JDD's signature green glow animations and color scheme for stronger brand identity",
      implementation: "Enhanced NEXUS branding with signature green (#00ff64) glow effects and animations",
      impact: 85,
      status: 'completed'
    },
    {
      category: "User Experience Enhancement",
      priority: 'high',
      feature: "Metric Counter Animations",
      description: "Add JDD-style animated metric counters with 'wow factor' on dashboard load",
      implementation: "Animated metric counters with easing functions and visual impact on load",
      impact: 90,
      status: 'completed'
    },
    {
      category: "DNS Infrastructure",
      priority: 'high',
      feature: "DNS Automation Suite",
      description: "Comprehensive DNS management with provider integration and health monitoring",
      implementation: "Full DNS automation service with Cloudflare, Route53, GoDaddy support",
      impact: 95,
      status: 'completed'
    },
    {
      category: "Data Integrity",
      priority: 'high',
      feature: "Authentic Data Validation",
      description: "Implement JDD's 100% authentic data policy with verification systems",
      implementation: "Data authenticity validation and elimination of placeholder content",
      impact: 95,
      status: 'in-progress'
    },
    {
      category: "Mobile Experience",
      priority: 'medium',
      feature: "Touch-First Interface",
      description: "Enhance mobile experience with JDD's touch-friendly design principles",
      implementation: "44px minimum touch targets and one-handed usage optimization",
      impact: 85,
      status: 'planned'
    },
    {
      category: "Authentication Architecture",
      priority: 'medium',
      feature: "Multi-Portal Access System",
      description: "Implement JDD's multiple portal approach for different user types and access levels",
      implementation: "Specialized portals: client, admin, and restricted module access",
      impact: 80,
      status: 'planned'
    }
  ];

  const overviewMetrics = [
    { value: 8, label: "Feature Areas Analyzed", suffix: "" },
    { value: 88, label: "Average NEXUS Score", suffix: "%" },
    { value: 6, label: "Evolution Opportunities", suffix: "" },
    { value: 87, label: "Implementation Progress", suffix: "%" }
  ];

  const getAdvantageColor = (advantage: string) => {
    switch (advantage) {
      case 'nexus': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'jdd': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'planned': return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800/30';
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
            <Brain className="w-5 h-5 text-[#00ff64]" />
            Competitive Intelligence Analysis
          </CardTitle>
          <SignatureBranding showCompanyName={false} className="text-xl" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Strategic Overview</TabsTrigger>
            <TabsTrigger value="analysis">Feature Analysis</TabsTrigger>
            <TabsTrigger value="evolution">Evolution Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Success Metrics Banner */}
            <SuccessMetricsBanner metrics={overviewMetrics} />

            {/* Competitive Advantage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassEffectCard>
                <h3 className="text-lg font-semibold text-[#00ff64] mb-4">NEXUS Advantages</h3>
                <div className="space-y-3">
                  {competitiveFeatures.filter(f => f.advantage === 'nexus').map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs text-gray-400">Score: {feature.nexusScore}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassEffectCard>

              <GlassEffectCard>
                <h3 className="text-lg font-semibold text-[#00ff64] mb-4">Improvement Opportunities</h3>
                <div className="space-y-3">
                  {competitiveFeatures.filter(f => f.advantage === 'jdd').map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-yellow-500" />
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs text-gray-400">Gap: {feature.jddScore - feature.nexusScore}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassEffectCard>
            </div>

            {/* Evolution Progress */}
            <GlassEffectCard>
              <h3 className="text-lg font-semibold text-[#00ff64] mb-4">Evolution Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <MetricCounter 
                    target={evolutionRecommendations.filter(r => r.status === 'completed').length}
                    label="Completed"
                    className="text-green-500"
                  />
                </div>
                <div className="text-center">
                  <MetricCounter 
                    target={evolutionRecommendations.filter(r => r.status === 'in-progress').length}
                    label="In Progress"
                    className="text-blue-500"
                  />
                </div>
                <div className="text-center">
                  <MetricCounter 
                    target={evolutionRecommendations.filter(r => r.status === 'planned').length}
                    label="Planned"
                    className="text-gray-500"
                  />
                </div>
              </div>
            </GlassEffectCard>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {competitiveFeatures.map((feature, index) => (
                  <GlassEffectCard key={index}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg text-[#00ff64]">{feature.name}</h4>
                      <Badge className={getAdvantageColor(feature.advantage)}>
                        {feature.advantage === 'nexus' ? 'NEXUS Advantage' : 
                         feature.advantage === 'jdd' ? 'JDD Advantage' : 'Tie'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#00ff64]">NEXUS Score</span>
                          <span className="font-medium">{feature.nexusScore}%</span>
                        </div>
                        <Progress value={feature.nexusScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-500">JDD Score</span>
                          <span className="font-medium">{feature.jddScore}%</span>
                        </div>
                        <Progress value={feature.jddScore} className="h-2" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
                    
                    {feature.improvementOpportunity && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-yellow-300">Improvement Opportunity</div>
                            <div className="text-sm text-yellow-200">{feature.improvementOpportunity}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </GlassEffectCard>
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="evolution" className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="evolution"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {evolutionRecommendations.map((recommendation, index) => (
                  <GlassEffectCard key={index}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-[#00ff64]">{recommendation.feature}</h4>
                        <div className="text-sm text-gray-400">{recommendation.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(recommendation.status)}>
                          {getStatusIcon(recommendation.status)}
                          {recommendation.status.replace('-', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{recommendation.impact}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{recommendation.description}</p>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Rocket className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-blue-300">Implementation Status</div>
                          <div className="text-sm text-blue-200">{recommendation.implementation}</div>
                        </div>
                      </div>
                    </div>
                  </GlassEffectCard>
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}