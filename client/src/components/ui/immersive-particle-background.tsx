import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Palette, 
  Zap,
  Circle,
  Square,
  Triangle,
  Star
} from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'triangle' | 'star';
  trail: Array<{ x: number; y: number; opacity: number }>;
}

interface ParticleConfig {
  count: number;
  speed: number;
  size: { min: number; max: number };
  colors: string[];
  shapes: string[];
  opacity: { min: number; max: number };
  life: { min: number; max: number };
  gravity: number;
  wind: number;
  connectionDistance: number;
  showConnections: boolean;
  showTrails: boolean;
  interactionMode: 'attract' | 'repel' | 'none';
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  effect: 'float' | 'fireworks' | 'galaxy' | 'quantum' | 'neural' | 'matrix';
}

interface ParticlePreset {
  name: string;
  description: string;
  config: ParticleConfig;
}

const defaultConfig: ParticleConfig = {
  count: 100,
  speed: 1,
  size: { min: 2, max: 6 },
  colors: ['#00ff64', '#00aaff', '#ff6600', '#ff0066'],
  shapes: ['circle'],
  opacity: { min: 0.3, max: 0.8 },
  life: { min: 3000, max: 8000 },
  gravity: 0,
  wind: 0,
  connectionDistance: 150,
  showConnections: true,
  showTrails: false,
  interactionMode: 'attract',
  blendMode: 'normal',
  effect: 'quantum'
};

const presets: ParticlePreset[] = [
  {
    name: 'Quantum Field',
    description: 'Interconnected quantum particles with energy connections',
    config: {
      ...defaultConfig,
      count: 80,
      colors: ['#00ff64', '#00ff64aa', '#00ff6444'],
      showConnections: true,
      showTrails: true,
      effect: 'quantum'
    }
  },
  {
    name: 'Neural Network',
    description: 'Brain-like neural connections with data flow',
    config: {
      ...defaultConfig,
      count: 60,
      colors: ['#00aaff', '#0066ff', '#ffffff'],
      connectionDistance: 200,
      showConnections: true,
      effect: 'neural'
    }
  },
  {
    name: 'Galaxy Dust',
    description: 'Cosmic particles floating in space',
    config: {
      ...defaultConfig,
      count: 150,
      colors: ['#ffffff', '#ffaa00', '#ff6600', '#aa00ff'],
      gravity: -0.1,
      wind: 0.2,
      showConnections: false,
      showTrails: true,
      effect: 'galaxy'
    }
  },
  {
    name: 'Matrix Rain',
    description: 'Falling digital particles like the Matrix',
    config: {
      ...defaultConfig,
      count: 200,
      colors: ['#00ff00', '#00aa00', '#ffffff'],
      gravity: 0.5,
      shapes: ['square'],
      showConnections: false,
      showTrails: true,
      effect: 'matrix'
    }
  },
  {
    name: 'Fireworks',
    description: 'Explosive particle bursts with trails',
    config: {
      ...defaultConfig,
      count: 120,
      colors: ['#ff0066', '#ff6600', '#ffaa00', '#00aaff'],
      speed: 3,
      life: { min: 1000, max: 3000 },
      showTrails: true,
      shapes: ['star', 'circle'],
      effect: 'fireworks'
    }
  }
];

export function ImmersiveParticleBackground({ 
  className = '',
  showControls = false,
  initialConfig = defaultConfig 
}: {
  className?: string;
  showControls?: boolean;
  initialConfig?: Partial<ParticleConfig>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [config, setConfig] = useState<ParticleConfig>({ ...defaultConfig, ...initialConfig });
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const createParticle = useCallback((id: number, canvas: HTMLCanvasElement): Particle => {
    const shapes = config.shapes.length > 0 ? config.shapes : ['circle'];
    const colors = config.colors.length > 0 ? config.colors : ['#00ff64'];
    
    let x, y, vx, vy;
    
    switch (config.effect) {
      case 'fireworks':
        // Start from center for fireworks effect
        x = canvas.width / 2 + (Math.random() - 0.5) * 100;
        y = canvas.height / 2 + (Math.random() - 0.5) * 100;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * config.speed * 2;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        break;
      case 'matrix':
        // Start from top for matrix rain
        x = Math.random() * canvas.width;
        y = -10;
        vx = (Math.random() - 0.5) * 0.5;
        vy = Math.random() * config.speed + 1;
        break;
      default:
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        vx = (Math.random() - 0.5) * config.speed;
        vy = (Math.random() - 0.5) * config.speed;
    }

    return {
      id,
      x,
      y,
      vx,
      vy,
      size: Math.random() * (config.size.max - config.size.min) + config.size.min,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min,
      life: Math.random() * (config.life.max - config.life.min) + config.life.min,
      maxLife: Math.random() * (config.life.max - config.life.min) + config.life.min,
      shape: shapes[Math.floor(Math.random() * shapes.length)] as Particle['shape'],
      trail: []
    };
  }, [config]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = (particle.life / particle.maxLife) * particle.opacity;
    
    // Draw trail
    if (config.showTrails && particle.trail.length > 0) {
      particle.trail.forEach((point, index) => {
        const trailAlpha = (index / particle.trail.length) * alpha * 0.5;
        ctx.globalAlpha = trailAlpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw particle
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;

    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(particle.x - particle.size, particle.y - particle.size, particle.size * 2, particle.size * 2);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y - particle.size);
        ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
        ctx.lineTo(particle.x + particle.size, particle.y + particle.size);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        drawStar(ctx, particle.x, particle.y, particle.size);
        break;
    }
  }, [config.showTrails]);

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    if (!config.showConnections) return;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const alpha = (1 - distance / config.connectionDistance) * 0.3;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#00ff64';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }, [config.showConnections, config.connectionDistance]);

  const updateParticles = useCallback((canvas: HTMLCanvasElement) => {
    const particles = particlesRef.current;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update trail
      if (config.showTrails) {
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
        if (particle.trail.length > 10) {
          particle.trail.shift();
        }
      }

      // Apply physics
      particle.vx += config.wind;
      particle.vy += config.gravity;

      // Mouse interaction
      if (config.interactionMode !== 'none') {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          const multiplier = config.interactionMode === 'attract' ? 0.01 : -0.01;
          particle.vx += (dx / distance) * force * multiplier;
          particle.vy += (dy / distance) * force * multiplier;
        }
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update life
      particle.life -= 16; // ~60fps

      // Boundary conditions
      if (config.effect === 'matrix') {
        if (particle.y > canvas.height + 10) {
          particles[i] = createParticle(particle.id, canvas);
        }
      } else {
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8;
        
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
      }

      // Remove dead particles
      if (particle.life <= 0) {
        particles[i] = createParticle(particle.id, canvas);
      }
    }
  }, [config, createParticle]);

  const animate = useCallback(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set blend mode
    ctx.globalCompositeOperation = config.blendMode;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update particles
    updateParticles(canvas);

    // Draw connections
    drawConnections(ctx, particlesRef.current);

    // Draw particles
    particlesRef.current.forEach(particle => {
      drawParticle(ctx, particle);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, config.blendMode, updateParticles, drawConnections, drawParticle]);

  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    particlesRef.current = Array.from({ length: config.count }, (_, i) => 
      createParticle(i, canvas)
    );
  }, [config.count, createParticle]);

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    resizeCanvas();
    initializeParticles();
    
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas, initializeParticles]);

  useEffect(() => {
    if (isPlaying) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isPlaying]);

  useEffect(() => {
    initializeParticles();
  }, [config.count, initializeParticles]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }, []);

  const applyPreset = (preset: ParticlePreset) => {
    setConfig(preset.config);
    setSelectedPreset(preset.name);
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
    setSelectedPreset('');
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onMouseMove={handleMouseMove}
        style={{ background: 'transparent' }}
      />
      
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-4 right-4 w-80 max-h-[80vh] overflow-y-auto"
          >
            <Card className="backdrop-blur-lg bg-black/20 border-[#00ff64]/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-[#00ff64]">
                  <Settings className="w-5 h-5" />
                  Particle Playground
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="border-[#00ff64]/50"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetToDefault}
                    className="border-[#00ff64]/50"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="presets">Presets</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="presets" className="space-y-3">
                    {presets.map((preset) => (
                      <div
                        key={preset.name}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPreset === preset.name
                            ? 'border-[#00ff64] bg-[#00ff64]/10'
                            : 'border-gray-600 hover:border-[#00ff64]/50'
                        }`}
                        onClick={() => applyPreset(preset)}
                      >
                        <div className="font-medium text-sm text-[#00ff64]">{preset.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Particle Count: {config.count}
                      </label>
                      <Slider
                        value={[config.count]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, count: value }))}
                        min={10}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Speed: {config.speed.toFixed(1)}
                      </label>
                      <Slider
                        value={[config.speed]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, speed: value }))}
                        min={0.1}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Effect</label>
                      <Select
                        value={config.effect}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, effect: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="float">Float</SelectItem>
                          <SelectItem value="quantum">Quantum</SelectItem>
                          <SelectItem value="neural">Neural</SelectItem>
                          <SelectItem value="galaxy">Galaxy</SelectItem>
                          <SelectItem value="matrix">Matrix</SelectItem>
                          <SelectItem value="fireworks">Fireworks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.showConnections}
                          onChange={(e) => setConfig(prev => ({ ...prev, showConnections: e.target.checked }))}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-300">Show Connections</label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.showTrails}
                          onChange={(e) => setConfig(prev => ({ ...prev, showTrails: e.target.checked }))}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-300">Show Trails</label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Interaction Mode</label>
                      <Select
                        value={config.interactionMode}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, interactionMode: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="attract">Attract</SelectItem>
                          <SelectItem value="repel">Repel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}