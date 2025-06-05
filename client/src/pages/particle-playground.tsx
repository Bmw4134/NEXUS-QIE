import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImmersiveParticleBackground } from '@/components/ui/immersive-particle-background';
import { TooltipPlayground, AIContextualTooltip } from '@/components/ui/ai-contextual-tooltip';
import { Settings, Sparkles, Brain, Zap } from 'lucide-react';

export default function ParticlePlayground() {
  const [showControls, setShowControls] = useState(true);
  const [particleConfig, setParticleConfig] = useState({
    count: 150,
    effect: 'quantum',
    showConnections: true,
    showTrails: true,
    interactionMode: 'attract'
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-black">
      {/* Immersive Particle Background */}
      <ImmersiveParticleBackground
        className="absolute inset-0 z-0"
        showControls={showControls}
        initialConfig={particleConfig}
      />
      
      {/* Main Content */}
      <div className="relative z-10 p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#00ff64] mb-2">
              Immersive UI Playground
            </h1>
            <p className="text-gray-300">
              Interactive particle systems and AI-powered contextual tooltips
            </p>
          </div>
          
          <div className="flex gap-2">
            <AIContextualTooltip
              content="Toggle particle system controls to customize the background effects in real-time."
              aiContext={{ elementType: 'button' }}
              showAIInsights={true}
            >
              <Button
                onClick={() => setShowControls(!showControls)}
                variant="outline"
                className="border-[#00ff64]/50 text-[#00ff64] hover:bg-[#00ff64]/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showControls ? 'Hide Controls' : 'Show Controls'}
              </Button>
            </AIContextualTooltip>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Particle System Demo */}
          <Card className="backdrop-blur-lg bg-black/20 border-[#00ff64]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00ff64]">
                <Sparkles className="w-5 h-5" />
                Particle System Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="presets">Presets</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                  <TabsTrigger value="interaction">Interaction</TabsTrigger>
                </TabsList>
                
                <TabsContent value="presets" className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Quantum Field', effect: 'quantum' },
                      { name: 'Neural Network', effect: 'neural' },
                      { name: 'Galaxy Dust', effect: 'galaxy' },
                      { name: 'Matrix Rain', effect: 'matrix' }
                    ].map((preset) => (
                      <AIContextualTooltip
                        key={preset.name}
                        content={`Switch to ${preset.name} particle effect with optimized settings for this visual style.`}
                        aiContext={{ elementType: 'button' }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setParticleConfig(prev => ({ ...prev, effect: preset.effect }))}
                          className="border-gray-600 hover:border-[#00ff64]/50"
                        >
                          {preset.name}
                        </Button>
                      </AIContextualTooltip>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="effects" className="space-y-3">
                  <div className="space-y-3">
                    {[
                      { label: 'Particle Connections', key: 'showConnections' },
                      { label: 'Motion Trails', key: 'showTrails' }
                    ].map((effect) => (
                      <AIContextualTooltip
                        key={effect.key}
                        content={`Toggle ${effect.label.toLowerCase()} to enhance visual feedback and particle relationships.`}
                        aiContext={{ elementType: 'input' }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={particleConfig[effect.key as keyof typeof particleConfig] as boolean}
                            onChange={(e) => setParticleConfig(prev => ({
                              ...prev,
                              [effect.key]: e.target.checked
                            }))}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-300">{effect.label}</label>
                        </div>
                      </AIContextualTooltip>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="interaction" className="space-y-3">
                  <AIContextualTooltip
                    content="Mouse interaction modes change how particles respond to cursor movement."
                    aiContext={{ elementType: 'form' }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Mouse Interaction</label>
                      <select
                        value={particleConfig.interactionMode}
                        onChange={(e) => setParticleConfig(prev => ({ 
                          ...prev, 
                          interactionMode: e.target.value 
                        }))}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                      >
                        <option value="none">None</option>
                        <option value="attract">Attract</option>
                        <option value="repel">Repel</option>
                      </select>
                    </div>
                  </AIContextualTooltip>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* AI Tooltip Features */}
          <Card className="backdrop-blur-lg bg-black/20 border-[#00ff64]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00ff64]">
                <Brain className="w-5 h-5" />
                AI Tooltip Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-300 leading-relaxed">
                Experience contextual tooltips that adapt to your interaction patterns
                and provide intelligent insights based on element usage.
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <AIContextualTooltip
                  content="This demonstrates behavior tracking - the tooltip learns from your interaction frequency."
                  aiContext={{ elementType: 'card' }}
                  showAIInsights={true}
                >
                  <div className="p-3 border border-gray-600 rounded bg-gray-800/50 hover:border-[#00ff64]/50 transition-colors cursor-pointer">
                    <div className="text-sm font-medium text-gray-200">Behavioral Analysis</div>
                    <div className="text-xs text-gray-400 mt-1">Hover to see AI insights</div>
                  </div>
                </AIContextualTooltip>
                
                <AIContextualTooltip
                  content="Performance optimization suggestions based on your usage patterns."
                  aiContext={{ elementType: 'button' }}
                  showAIInsights={true}
                  persistOnClick={true}
                >
                  <Button className="w-full bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30">
                    <Zap className="w-4 h-4 mr-2" />
                    Performance Insights
                  </Button>
                </AIContextualTooltip>
                
                <AIContextualTooltip
                  content="Context-aware warnings appear when the system detects potential issues."
                  aiContext={{ elementType: 'input' }}
                  showAIInsights={true}
                >
                  <input
                    type="text"
                    placeholder="Type to trigger context analysis..."
                    className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:border-[#00ff64]"
                  />
                </AIContextualTooltip>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>• Tooltips track interaction time and frequency</div>
                <div>• AI provides contextual suggestions and warnings</div>
                <div>• Visual themes adapt to system state</div>
                <div>• Persistent mode available for complex interfaces</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Tooltip Playground */}
        <TooltipPlayground />

        {/* Performance Metrics */}
        <Card className="backdrop-blur-lg bg-black/20 border-[#00ff64]/30">
          <CardHeader>
            <CardTitle className="text-[#00ff64]">System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AIContextualTooltip
                content="Particle rendering performance in frames per second."
                aiContext={{ elementType: 'chart' }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00ff64]">60</div>
                  <div className="text-sm text-gray-400">FPS</div>
                </div>
              </AIContextualTooltip>
              
              <AIContextualTooltip
                content="Number of active particles in the current scene."
                aiContext={{ elementType: 'chart' }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{particleConfig.count}</div>
                  <div className="text-sm text-gray-400">Particles</div>
                </div>
              </AIContextualTooltip>
              
              <AIContextualTooltip
                content="GPU memory usage for particle system rendering."
                aiContext={{ elementType: 'chart' }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">24</div>
                  <div className="text-sm text-gray-400">MB GPU</div>
                </div>
              </AIContextualTooltip>
              
              <AIContextualTooltip
                content="Number of AI insights generated in this session."
                aiContext={{ elementType: 'chart' }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">12</div>
                  <div className="text-sm text-gray-400">AI Insights</div>
                </div>
              </AIContextualTooltip>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}