import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Info, 
  Lightbulb, 
  Target, 
  Zap,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Star
} from 'lucide-react';

interface TooltipContext {
  elementType: string;
  elementContent: string;
  userActivity: string;
  timeSpent: number;
  interactionCount: number;
  location: { x: number; y: number };
  timestamp: Date;
}

interface AIInsight {
  type: 'explanation' | 'suggestion' | 'warning' | 'optimization' | 'context' | 'learning';
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedElements?: string[];
}

interface TooltipTheme {
  name: string;
  colors: {
    background: string;
    border: string;
    text: string;
    accent: string;
  };
  animation: string;
}

const themes: TooltipTheme[] = [
  {
    name: 'quantum',
    colors: {
      background: 'rgba(0, 20, 40, 0.95)',
      border: '#00ff64',
      text: '#ffffff',
      accent: '#00ff64'
    },
    animation: 'glow'
  },
  {
    name: 'neural',
    colors: {
      background: 'rgba(20, 0, 40, 0.95)',
      border: '#6600ff',
      text: '#ffffff',
      accent: '#6600ff'
    },
    animation: 'pulse'
  },
  {
    name: 'holographic',
    colors: {
      background: 'rgba(0, 40, 60, 0.95)',
      border: '#00aaff',
      text: '#ffffff',
      accent: '#00aaff'
    },
    animation: 'shimmer'
  }
];

export function AIContextualTooltip({
  children,
  content,
  aiContext = {},
  theme = 'quantum',
  disabled = false,
  showAIInsights = true,
  persistOnClick = false,
  maxWidth = 320,
  delay = 300
}: {
  children: React.ReactNode;
  content?: string;
  aiContext?: Partial<TooltipContext>;
  theme?: string;
  disabled?: boolean;
  showAIInsights?: boolean;
  persistOnClick?: boolean;
  maxWidth?: number;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [context, setContext] = useState<TooltipContext | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const selectedTheme = themes.find(t => t.name === theme) || themes[0];

  const generateAIInsights = useCallback(async (ctx: TooltipContext): Promise<AIInsight[]> => {
    const insights: AIInsight[] = [];

    // Contextual explanation based on element type
    if (ctx.elementType) {
      insights.push({
        type: 'explanation',
        title: 'Element Context',
        content: `This ${ctx.elementType} contains ${ctx.elementContent || 'interactive content'}. ${getElementExplanation(ctx.elementType)}`,
        confidence: 85,
        actionable: false,
        priority: 'medium'
      });
    }

    // User behavior insights
    if (ctx.timeSpent > 5000) {
      insights.push({
        type: 'suggestion',
        title: 'Extended Interaction Detected',
        content: `You've been focusing on this element for ${Math.round(ctx.timeSpent / 1000)}s. Consider exploring related features or taking notes.`,
        confidence: 75,
        actionable: true,
        priority: 'medium'
      });
    }

    // Interaction patterns
    if (ctx.interactionCount > 3) {
      insights.push({
        type: 'learning',
        title: 'Frequent Interaction',
        content: `This element has been accessed ${ctx.interactionCount} times. You might want to bookmark it or explore similar features.`,
        confidence: 80,
        actionable: true,
        priority: 'low'
      });
    }

    // Optimization suggestions
    if (ctx.elementType === 'button' && ctx.interactionCount === 1) {
      insights.push({
        type: 'optimization',
        title: 'Quick Action Available',
        content: 'Pro tip: You can use keyboard shortcuts for faster access to this action.',
        confidence: 70,
        actionable: true,
        priority: 'low'
      });
    }

    // Context-aware warnings
    if (ctx.elementType === 'input' && ctx.timeSpent > 10000) {
      insights.push({
        type: 'warning',
        title: 'Form Timeout Warning',
        content: 'Your session may timeout soon. Consider saving your progress.',
        confidence: 90,
        actionable: true,
        priority: 'high'
      });
    }

    return insights;
  }, []);

  const getElementExplanation = (elementType: string): string => {
    const explanations: Record<string, string> = {
      button: 'Click to perform the associated action. Some buttons may have keyboard shortcuts.',
      input: 'Enter data here. Look for validation hints and auto-completion features.',
      card: 'This component contains related information grouped together for easy scanning.',
      chart: 'Interactive data visualization. Hover over data points for detailed information.',
      table: 'Structured data display. Use column headers to sort and filter content.',
      form: 'Complete all required fields. Your progress is automatically saved.',
      navigation: 'Use these links to move between different sections of the application.',
      tooltip: 'Additional context and help information for the associated element.'
    };
    
    return explanations[elementType] || 'Interactive element with specific functionality.';
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    let y = triggerRect.top - tooltipRect.height - 10;

    // Boundary checks
    if (x < 10) x = 10;
    if (x + tooltipRect.width > viewport.width - 10) {
      x = viewport.width - tooltipRect.width - 10;
    }
    if (y < 10) {
      y = triggerRect.bottom + 10;
    }

    setPosition({ x, y });
  }, []);

  const showTooltip = useCallback(async () => {
    if (disabled) return;

    setInteractionCount(prev => prev + 1);
    startTimeRef.current = Date.now();
    
    // Start time tracking
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setTimeSpent(Date.now() - startTimeRef.current);
      }
    }, 100);

    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const ctx: TooltipContext = {
        elementType: triggerRef.current?.getAttribute('data-element-type') || 'unknown',
        elementContent: triggerRef.current?.textContent || '',
        userActivity: 'hover',
        timeSpent: 0,
        interactionCount: interactionCount + 1,
        location: { x: rect.left, y: rect.top },
        timestamp: new Date(),
        ...aiContext
      };
      
      setContext(ctx);
      
      if (showAIInsights) {
        const insights = await generateAIInsights(ctx);
        setAiInsights(insights);
      }
    }

    setIsVisible(true);
    setTimeout(updatePosition, 10);
  }, [disabled, aiContext, interactionCount, showAIInsights, generateAIInsights, updatePosition]);

  const hideTooltip = useCallback(() => {
    if (isPersistent) return;
    
    setIsVisible(false);
    
    // Clear timing
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startTimeRef.current = undefined;
    setTimeSpent(0);
  }, [isPersistent]);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(showTooltip, delay);
  }, [showTooltip, delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTimeout(hideTooltip, 100);
  }, [hideTooltip]);

  const handleClick = useCallback(() => {
    if (persistOnClick) {
      setIsPersistent(!isPersistent);
      if (!isVisible) {
        showTooltip();
      }
    }
  }, [persistOnClick, isPersistent, isVisible, showTooltip]);

  const getInsightIcon = (type: AIInsight['type']) => {
    const icons = {
      explanation: Info,
      suggestion: Lightbulb,
      warning: Shield,
      optimization: TrendingUp,
      context: Target,
      learning: Star
    };
    return icons[type] || Info;
  };

  const getInsightColor = (type: AIInsight['type']) => {
    const colors = {
      explanation: '#00aaff',
      suggestion: '#ffaa00',
      warning: '#ff4444',
      optimization: '#00ff64',
      context: '#aa00ff',
      learning: '#ff6600'
    };
    return colors[type] || '#00aaff';
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        data-element-type={aiContext.elementType}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 pointer-events-auto"
            style={{
              left: position.x,
              top: position.y,
              maxWidth: maxWidth
            }}
          >
            <Card
              className="backdrop-blur-lg border-2 shadow-2xl"
              style={{
                backgroundColor: selectedTheme.colors.background,
                borderColor: selectedTheme.colors.border,
                color: selectedTheme.colors.text,
                boxShadow: `0 0 20px ${selectedTheme.colors.accent}40`
              }}
            >
              <CardContent className="p-4 space-y-3">
                {/* Base content */}
                {content && (
                  <div className="text-sm leading-relaxed">
                    {content}
                  </div>
                )}

                {/* AI Insights */}
                {showAIInsights && aiInsights.length > 0 && (
                  <div className="space-y-2 border-t border-gray-600 pt-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Brain className="w-3 h-3" style={{ color: selectedTheme.colors.accent }} />
                      AI Insights
                    </div>
                    {aiInsights.slice(0, 3).map((insight, index) => {
                      const IconComponent = getInsightIcon(insight.type);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-2 rounded-lg bg-black/20 border border-gray-600"
                        >
                          <div className="flex items-start gap-2">
                            <IconComponent 
                              className="w-3 h-3 mt-0.5 flex-shrink-0" 
                              style={{ color: getInsightColor(insight.type) }}
                            />
                            <div className="flex-1">
                              <div className="text-xs font-medium mb-1 flex items-center gap-2">
                                {insight.title}
                                <Badge 
                                  variant="outline" 
                                  className="text-xs px-1 py-0"
                                  style={{ 
                                    borderColor: getInsightColor(insight.type),
                                    color: getInsightColor(insight.type)
                                  }}
                                >
                                  {insight.confidence}%
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-300 leading-relaxed">
                                {insight.content}
                              </div>
                              {insight.actionable && (
                                <div className="mt-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    style={{ color: getInsightColor(insight.type) }}
                                  >
                                    Take Action
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Context information */}
                {context && showAIInsights && (
                  <div className="text-xs text-gray-400 border-t border-gray-600 pt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(timeSpent / 1000)}s
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {interactionCount} interactions
                    </div>
                    {isPersistent && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Pinned
                      </div>
                    )}
                  </div>
                )}

                {/* Persistent control */}
                {persistOnClick && (
                  <div className="flex justify-end border-t border-gray-600 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPersistent(!isPersistent)}
                      className="text-xs h-6"
                      style={{ color: selectedTheme.colors.accent }}
                    >
                      {isPersistent ? 'Unpin' : 'Pin'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tooltip arrow */}
            <div
              className="absolute w-3 h-3 transform rotate-45"
              style={{
                backgroundColor: selectedTheme.colors.background,
                borderRight: `2px solid ${selectedTheme.colors.border}`,
                borderBottom: `2px solid ${selectedTheme.colors.border}`,
                left: '50%',
                bottom: '-6px',
                marginLeft: '-6px'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function TooltipPlayground() {
  const [selectedTheme, setSelectedTheme] = useState('quantum');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [persistOnClick, setPersistOnClick] = useState(false);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#00ff64]">AI-Powered Tooltip Playground</h2>
          <p className="text-gray-400">
            Interactive tooltips with contextual AI insights that adapt to user behavior
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Theme</label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            >
              {themes.map(theme => (
                <option key={theme.name} value={theme.name}>
                  {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showAIInsights}
              onChange={(e) => setShowAIInsights(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Show AI Insights</label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={persistOnClick}
              onChange={(e) => setPersistOnClick(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Persist on Click</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button example */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Interactive Button</h3>
            <AIContextualTooltip
              content="This button triggers an important action in the system."
              aiContext={{ elementType: 'button' }}
              theme={selectedTheme}
              showAIInsights={showAIInsights}
              persistOnClick={persistOnClick}
            >
              <Button className="w-full bg-[#00ff64]/20 border-[#00ff64] text-[#00ff64]">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Action Button
              </Button>
            </AIContextualTooltip>
          </div>

          {/* Input example */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Smart Input Field</h3>
            <AIContextualTooltip
              content="Enter your data here. The system will provide real-time validation and suggestions."
              aiContext={{ elementType: 'input' }}
              theme={selectedTheme}
              showAIInsights={showAIInsights}
              persistOnClick={persistOnClick}
            >
              <input
                type="text"
                placeholder="Type something..."
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:border-[#00ff64]"
              />
            </AIContextualTooltip>
          </div>

          {/* Card example */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Information Card</h3>
            <AIContextualTooltip
              content="This card contains grouped information for easy scanning and reference."
              aiContext={{ elementType: 'card' }}
              theme={selectedTheme}
              showAIInsights={showAIInsights}
              persistOnClick={persistOnClick}
            >
              <Card className="border-gray-600 hover:border-[#00ff64]/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#00ff64]" />
                    <span className="text-sm">Hover for AI insights</span>
                  </div>
                </CardContent>
              </Card>
            </AIContextualTooltip>
          </div>

          {/* Navigation example */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Navigation Link</h3>
            <AIContextualTooltip
              content="Navigate to different sections using these links. Keyboard shortcuts available."
              aiContext={{ elementType: 'navigation' }}
              theme={selectedTheme}
              showAIInsights={showAIInsights}
              persistOnClick={persistOnClick}
            >
              <a href="#" className="text-[#00ff64] hover:underline flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Dashboard Analytics
              </a>
            </AIContextualTooltip>
          </div>

          {/* Chart example */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Data Visualization</h3>
            <AIContextualTooltip
              content="Interactive chart with real-time data. Click and drag to zoom, hover for details."
              aiContext={{ elementType: 'chart' }}
              theme={selectedTheme}
              showAIInsights={showAIInsights}
              persistOnClick={persistOnClick}
            >
              <div className="h-24 bg-gradient-to-r from-[#00ff64]/20 to-[#00aaff]/20 rounded border border-gray-600 flex items-center justify-center cursor-pointer">
                <TrendingUp className="w-8 h-8 text-[#00ff64]" />
              </div>
            </AIContextualTooltip>
          </div>

          {/* Form example */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Form Section</h3>
            <AIContextualTooltip
              content="Complete this form to proceed. All fields are validated in real-time."
              aiContext={{ elementType: 'form' }}
              theme={selectedTheme}
              showAIInsights={showAIInsights}
              persistOnClick={persistOnClick}
            >
              <div className="p-4 border border-gray-600 rounded bg-gray-800/50">
                <div className="text-sm text-gray-300">Configuration Form</div>
                <div className="mt-2 text-xs text-gray-400">Hover for guidance</div>
              </div>
            </AIContextualTooltip>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          Try hovering over different elements to see contextual AI insights in action.
          The system learns from your interaction patterns to provide better suggestions.
        </div>
      </CardContent>
    </Card>
  );
}