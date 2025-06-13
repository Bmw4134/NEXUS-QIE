import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Eye, 
  EyeOff,
  Sparkles,
  Target,
  Zap,
  Globe,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface InvestorKPI {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  target: number;
  icon: any;
  color: string;
  description: string;
}

export default function InvestorMode() {
  const [isInvestorMode, setIsInvestorMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});

  const investorKPIs: InvestorKPI[] = [
    {
      id: 'revenue',
      title: 'Annual Revenue',
      value: 2750000,
      unit: '$',
      change: 34.2,
      target: 5000000,
      icon: DollarSign,
      color: 'text-green-500',
      description: 'Total revenue growth trajectory'
    },
    {
      id: 'clients',
      title: 'Enterprise Clients',
      value: 127,
      unit: '',
      change: 28.5,
      target: 200,
      icon: Users,
      color: 'text-blue-500',
      description: 'Active enterprise customer base'
    },
    {
      id: 'growth',
      title: 'Monthly Growth',
      value: 18.7,
      unit: '%',
      change: 4.3,
      target: 25,
      icon: TrendingUp,
      color: 'text-purple-500',
      description: 'Month-over-month growth rate'
    },
    {
      id: 'valuation',
      title: 'Market Valuation',
      value: 45000000,
      unit: '$',
      change: 67.8,
      target: 100000000,
      icon: BarChart3,
      color: 'text-orange-500',
      description: 'Current market valuation estimate'
    },
    {
      id: 'retention',
      title: 'Client Retention',
      value: 94.5,
      unit: '%',
      change: 2.1,
      target: 98,
      icon: Award,
      color: 'text-cyan-500',
      description: 'Customer retention rate'
    },
    {
      id: 'efficiency',
      title: 'AI Efficiency',
      value: 847,
      unit: '%',
      change: 156.2,
      target: 1000,
      icon: Zap,
      color: 'text-yellow-500',
      description: 'AI processing efficiency vs baseline'
    }
  ];

  useEffect(() => {
    if (isInvestorMode) {
      setShowWelcome(true);
      
      // Animate KPI values
      const animations = investorKPIs.reduce((acc, kpi) => {
        acc[kpi.id] = 0;
        return acc;
      }, {} as { [key: string]: number });
      
      setAnimatedValues(animations);
      
      // Stagger the animations
      investorKPIs.forEach((kpi, index) => {
        setTimeout(() => {
          setAnimatedValues(prev => ({
            ...prev,
            [kpi.id]: kpi.value
          }));
        }, index * 200);
      });
    }
  }, [isInvestorMode]);

  const formatValue = (value: number, unit: string) => {
    if (unit === '$' && value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (unit === '$' && value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="relative">
      {/* Investor Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Eye className={`w-5 h-5 ${isInvestorMode ? 'text-green-500' : 'text-gray-400'}`} />
            <Switch
              checked={isInvestorMode}
              onCheckedChange={(checked) => {
                setIsInvestorMode(checked);
                if (!checked) {
                  setShowWelcome(false);
                }
              }}
            />
            <span className="text-sm font-medium">Investor View</span>
          </div>
        </Card>
      </div>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Investor Dashboard Active
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Welcome to the executive overview. All metrics are now displaying real-time investor-grade analytics.
                </p>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-4 mb-6"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">$2.75M</div>
                  <div className="text-sm text-gray-500">ARR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">127</div>
                  <div className="text-sm text-gray-500">Enterprise</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">94.5%</div>
                  <div className="text-sm text-gray-500">Retention</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button onClick={() => setShowWelcome(false)} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investor Dashboard */}
      <AnimatePresence>
        {isInvestorMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Globe className="w-8 h-8 text-blue-500" />
                  Executive Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Real-time business intelligence and growth metrics
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Live Data
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investorKPIs.map((kpi, index) => (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        key={animatedValues[kpi.id]}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold mb-1"
                      >
                        {formatValue(animatedValues[kpi.id] || 0, kpi.unit)}
                      </motion.div>
                      
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-green-600">+{kpi.change}%</span>
                        <span className="ml-1">vs last period</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress to target</span>
                          <span>{getProgressPercentage(kpi.value, kpi.target).toFixed(0)}%</span>
                        </div>
                        <motion.div 
                          className="w-full bg-gray-200 rounded-full h-1.5"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: index * 0.2 }}
                        >
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage(kpi.value, kpi.target)}%` }}
                            transition={{ delay: index * 0.2 + 0.3, duration: 1 }}
                          />
                        </motion.div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        {kpi.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Investment Highlights</CardTitle>
                  <CardDescription>Key value propositions for potential investors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Exponential Growth</h3>
                          <p className="text-sm text-gray-600">34.2% revenue growth with expanding enterprise client base</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">AI Technology Edge</h3>
                          <p className="text-sm text-gray-600">847% efficiency improvement through proprietary AI systems</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Market Leadership</h3>
                          <p className="text-sm text-gray-600">94.5% client retention rate demonstrates product-market fit</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                        <h3 className="font-medium mb-2">Funding Target</h3>
                        <div className="text-2xl font-bold text-purple-600">$15M Series A</div>
                        <p className="text-sm text-gray-600 mt-1">
                          To accelerate enterprise expansion and AI development
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Use of Funds</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Product Development</span>
                            <span className="font-medium">40%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sales & Marketing</span>
                            <span className="font-medium">35%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team Expansion</span>
                            <span className="font-medium">25%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}