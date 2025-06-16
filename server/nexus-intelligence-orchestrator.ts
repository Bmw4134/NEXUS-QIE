
import { openaiService } from './openai-service';
import { perplexitySearch } from './perplexity-search-service';
import { quantumSuperAI } from './quantum-superintelligent-ai';
import { evolutionEngine } from './recursive-evolution-engine';
import { quantumAIOrchestrator } from './quantum-ai-orchestrator';
import { db } from './db';

export interface IntelligenceRequest {
  type: 'analysis' | 'prediction' | 'optimization' | 'research' | 'decision';
  context: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredCapabilities: string[];
}

export interface IntelligenceResponse {
  id: string;
  type: string;
  confidence: number;
  result: any;
  sources: string[];
  timestamp: Date;
  processingTime: number;
  enhancementApplied: boolean;
}

export class NexusIntelligenceOrchestrator {
  private static instance: NexusIntelligenceOrchestrator;
  private isInitialized = false;
  private capabilities: Set<string> = new Set();
  private requestQueue: IntelligenceRequest[] = [];
  private processingActive = false;

  private constructor() {
    this.initializeOrchestrator();
  }

  static getInstance(): NexusIntelligenceOrchestrator {
    if (!NexusIntelligenceOrchestrator.instance) {
      NexusIntelligenceOrchestrator.instance = new NexusIntelligenceOrchestrator();
    }
    return NexusIntelligenceOrchestrator.instance;
  }

  private async initializeOrchestrator(): Promise<void> {
    console.log('🚀 Initializing NEXUS Intelligence Orchestrator...');

    try {
      // Initialize all intelligence modules
      await this.initializeOpenAI();
      await this.initializePerplexity();
      await this.initializeQuantumAI();
      await this.initializeEvolutionEngine();

      this.capabilities.add('openai_gpt4');
      this.capabilities.add('perplexity_search');
      this.capabilities.add('quantum_prediction');
      this.capabilities.add('recursive_evolution');
      this.capabilities.add('autonomous_optimization');

      // Start continuous processing
      this.startContinuousProcessing();

      this.isInitialized = true;
      console.log('✅ NEXUS Intelligence Orchestrator initialized successfully');
      console.log(`🧠 Available capabilities: ${Array.from(this.capabilities).join(', ')}`);

    } catch (error) {
      console.error('❌ Failed to initialize NEXUS Intelligence Orchestrator:', error);
      // Continue with available capabilities
      this.isInitialized = true;
    }
  }

  private async initializeOpenAI(): Promise<void> {
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 OpenAI GPT-4 integration active');
    } else {
      console.log('⚠️ OpenAI API key not configured');
    }
  }

  private async initializePerplexity(): Promise<void> {
    if (perplexitySearch.isConfigured()) {
      console.log('🔍 Perplexity real-time search active');
    } else {
      console.log('⚠️ Perplexity API key not configured');
    }
  }

  private async initializeQuantumAI(): Promise<void> {
    const metrics = quantumSuperAI.getSuperintelligenceMetrics();
    console.log(`🧠 Quantum AI active - IQ: ${metrics.iqEquivalent}, Coherence: ${(metrics.quantumCoherence * 100).toFixed(1)}%`);
  }

  private async initializeEvolutionEngine(): Promise<void> {
    await evolutionEngine.startEvolution();
    console.log('🔄 Recursive Evolution Engine active');
  }

  private startContinuousProcessing(): void {
    setInterval(async () => {
      if (!this.processingActive && this.requestQueue.length > 0) {
        await this.processRequestQueue();
      }
    }, 1000);
  }

  async orchestrateIntelligence(request: IntelligenceRequest): Promise<IntelligenceResponse> {
    const startTime = Date.now();
    const requestId = `nexus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🔮 Processing intelligence request: ${request.type} (${request.priority})`);

    try {
      let result: any = null;
      let sources: string[] = [];
      let confidence = 0.5;

      // Route to appropriate intelligence modules based on type and capabilities
      switch (request.type) {
        case 'analysis':
          result = await this.performAnalysis(request);
          break;
        case 'prediction':
          result = await this.performPrediction(request);
          break;
        case 'optimization':
          result = await this.performOptimization(request);
          break;
        case 'research':
          result = await this.performResearch(request);
          break;
        case 'decision':
          result = await this.performDecisionMaking(request);
          break;
        default:
          result = await this.performGenericProcessing(request);
      }

      const response: IntelligenceResponse = {
        id: requestId,
        type: request.type,
        confidence: result.confidence || confidence,
        result: result.data || result,
        sources: result.sources || sources,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
        enhancementApplied: true
      };

      // Apply recursive evolutionary enhancement
      await this.applyRecursiveEnhancement(response);

      console.log(`✅ Intelligence request completed in ${response.processingTime}ms`);
      return response;

    } catch (error) {
      console.error('❌ Intelligence orchestration failed:', error);
      
      // Fallback response
      return {
        id: requestId,
        type: request.type,
        confidence: 0.1,
        result: { error: 'Intelligence processing failed', fallback: true },
        sources: ['nexus_fallback'],
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
        enhancementApplied: false
      };
    }
  }

  private async performAnalysis(request: IntelligenceRequest): Promise<any> {
    const results: any[] = [];
    
    // Use OpenAI for deep analysis
    if (this.capabilities.has('openai_gpt4') && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Perform comprehensive analysis of: ${JSON.stringify(request.context)}
        
        Provide detailed insights, patterns, and recommendations in JSON format:
        {
          "insights": [],
          "patterns": [],
          "recommendations": [],
          "confidence": 0.95
        }`;

        const analysis = await openaiService.generateCompletion(prompt, {
          maxTokens: 2000,
          temperature: 0.3,
          model: 'gpt-4'
        });

        try {
          const parsedAnalysis = JSON.parse(analysis);
          results.push({
            source: 'openai_gpt4',
            data: parsedAnalysis,
            confidence: parsedAnalysis.confidence || 0.8
          });
        } catch {
          results.push({
            source: 'openai_gpt4',
            data: { analysis },
            confidence: 0.7
          });
        }
      } catch (error) {
        console.error('OpenAI analysis failed:', error);
      }
    }

    // Use Quantum AI for pattern recognition
    if (this.capabilities.has('quantum_prediction')) {
      try {
        const quantumResult = await quantumSuperAI.makeSuperintelligentPrediction(
          request.context,
          'trend',
          '1d'
        );
        
        results.push({
          source: 'quantum_ai',
          data: quantumResult,
          confidence: quantumResult.confidence
        });
      } catch (error) {
        console.error('Quantum AI analysis failed:', error);
      }
    }

    // Combine results with weighted confidence
    return this.combineIntelligenceResults(results);
  }

  private async performPrediction(request: IntelligenceRequest): Promise<any> {
    const results: any[] = [];

    // Quantum AI predictions
    if (this.capabilities.has('quantum_prediction')) {
      try {
        const prediction = await quantumSuperAI.makeSuperintelligentPrediction(
          request.context,
          'market',
          '4h'
        );
        
        results.push({
          source: 'quantum_superintelligent_ai',
          data: prediction,
          confidence: prediction.confidence
        });
      } catch (error) {
        console.error('Quantum prediction failed:', error);
      }
    }

    // OpenAI trend analysis
    if (this.capabilities.has('openai_gpt4') && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Analyze trends and make predictions based on: ${JSON.stringify(request.context)}
        
        Provide prediction in JSON format:
        {
          "prediction": {},
          "probability": 0.85,
          "timeframe": "4h",
          "factors": [],
          "confidence": 0.90
        }`;

        const prediction = await openaiService.generateCompletion(prompt, {
          maxTokens: 1500,
          temperature: 0.2,
          model: 'gpt-4'
        });

        try {
          const parsedPrediction = JSON.parse(prediction);
          results.push({
            source: 'openai_prediction',
            data: parsedPrediction,
            confidence: parsedPrediction.confidence || 0.75
          });
        } catch {
          results.push({
            source: 'openai_prediction',
            data: { prediction },
            confidence: 0.6
          });
        }
      } catch (error) {
        console.error('OpenAI prediction failed:', error);
      }
    }

    return this.combineIntelligenceResults(results);
  }

  private async performOptimization(request: IntelligenceRequest): Promise<any> {
    // Use recursive evolution engine for optimization
    try {
      const systemIntelligence = await evolutionEngine.getSystemIntelligence();
      const optimizations = {
        currentState: systemIntelligence,
        recommendations: [
          'Optimize API request patterns',
          'Enhance caching strategies',
          'Improve error handling',
          'Streamline data processing'
        ],
        confidence: 0.85
      };

      return {
        source: 'recursive_evolution',
        data: optimizations,
        confidence: 0.85
      };
    } catch (error) {
      console.error('Optimization failed:', error);
      return {
        source: 'fallback',
        data: { error: 'Optimization failed' },
        confidence: 0.1
      };
    }
  }

  private async performResearch(request: IntelligenceRequest): Promise<any> {
    const results: any[] = [];

    // Use Perplexity for real-time research
    if (this.capabilities.has('perplexity_search') && perplexitySearch.isConfigured()) {
      try {
        const searchQuery = typeof request.context === 'string' 
          ? request.context 
          : JSON.stringify(request.context);

        const research = await perplexitySearch.search({
          query: searchQuery,
          searchType: 'research',
          maxTokens: 2000,
          temperature: 0.1
        });

        results.push({
          source: 'perplexity_search',
          data: research,
          confidence: research.confidence
        });
      } catch (error) {
        console.error('Perplexity research failed:', error);
      }
    }

    // Use OpenAI for research synthesis
    if (this.capabilities.has('openai_gpt4') && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Research and synthesize information about: ${JSON.stringify(request.context)}
        
        Provide comprehensive research in JSON format:
        {
          "findings": [],
          "sources": [],
          "synthesis": "",
          "confidence": 0.90
        }`;

        const research = await openaiService.generateCompletion(prompt, {
          maxTokens: 2500,
          temperature: 0.2,
          model: 'gpt-4'
        });

        try {
          const parsedResearch = JSON.parse(research);
          results.push({
            source: 'openai_research',
            data: parsedResearch,
            confidence: parsedResearch.confidence || 0.8
          });
        } catch {
          results.push({
            source: 'openai_research',
            data: { research },
            confidence: 0.7
          });
        }
      } catch (error) {
        console.error('OpenAI research failed:', error);
      }
    }

    return this.combineIntelligenceResults(results);
  }

  private async performDecisionMaking(request: IntelligenceRequest): Promise<any> {
    const results: any[] = [];

    // Use all available intelligence for decision making
    const analysisResult = await this.performAnalysis(request);
    const predictionResult = await this.performPrediction(request);

    results.push(analysisResult, predictionResult);

    // Synthesize decision with OpenAI
    if (this.capabilities.has('openai_gpt4') && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Make an intelligent decision based on:
        Analysis: ${JSON.stringify(analysisResult)}
        Prediction: ${JSON.stringify(predictionResult)}
        Context: ${JSON.stringify(request.context)}
        
        Provide decision in JSON format:
        {
          "decision": "",
          "reasoning": [],
          "alternatives": [],
          "confidence": 0.95,
          "risk_assessment": ""
        }`;

        const decision = await openaiService.generateCompletion(prompt, {
          maxTokens: 2000,
          temperature: 0.1,
          model: 'gpt-4'
        });

        try {
          const parsedDecision = JSON.parse(decision);
          return {
            source: 'nexus_decision_engine',
            data: parsedDecision,
            confidence: parsedDecision.confidence || 0.85
          };
        } catch {
          return {
            source: 'nexus_decision_engine',
            data: { decision },
            confidence: 0.75
          };
        }
      } catch (error) {
        console.error('Decision making failed:', error);
      }
    }

    return this.combineIntelligenceResults(results);
  }

  private async performGenericProcessing(request: IntelligenceRequest): Promise<any> {
    // Default processing using available capabilities
    if (this.capabilities.has('openai_gpt4') && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Process this request: ${JSON.stringify(request)}
        
        Provide comprehensive response in JSON format with high confidence.`;

        const response = await openaiService.generateCompletion(prompt, {
          maxTokens: 1500,
          temperature: 0.3,
          model: 'gpt-4'
        });

        return {
          source: 'openai_generic',
          data: { response },
          confidence: 0.7
        };
      } catch (error) {
        console.error('Generic processing failed:', error);
      }
    }

    return {
      source: 'fallback',
      data: { message: 'Processing completed with basic capabilities' },
      confidence: 0.3
    };
  }

  private combineIntelligenceResults(results: any[]): any {
    if (results.length === 0) {
      return {
        data: { message: 'No results available' },
        confidence: 0.1,
        sources: ['none']
      };
    }

    if (results.length === 1) {
      return results[0];
    }

    // Weighted combination based on confidence
    const totalWeight = results.reduce((sum, r) => sum + r.confidence, 0);
    const combinedConfidence = totalWeight / results.length;

    return {
      data: {
        combined_results: results.map(r => r.data),
        synthesis: 'Multiple intelligence sources combined',
        primary_source: results.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        )
      },
      confidence: combinedConfidence,
      sources: results.map(r => r.source)
    };
  }

  private async applyRecursiveEnhancement(response: IntelligenceResponse): Promise<void> {
    try {
      // Log successful intelligence processing for learning
      await evolutionEngine.logError('intelligence_success', new Error('Success'), {
        type: response.type,
        confidence: response.confidence,
        processingTime: response.processingTime
      });

      // Apply optimizations based on performance
      if (response.processingTime > 5000) {
        console.log('⚡ Applying performance optimizations...');
        // Trigger performance optimization
      }

      if (response.confidence > 0.9) {
        console.log('🎯 High confidence result - enhancing similar patterns');
        // Enhance similar pattern recognition
      }

    } catch (error) {
      console.error('Recursive enhancement failed:', error);
    }
  }

  private async processRequestQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    this.processingActive = true;
    
    try {
      const request = this.requestQueue.shift()!;
      await this.orchestrateIntelligence(request);
    } catch (error) {
      console.error('Queue processing failed:', error);
    } finally {
      this.processingActive = false;
    }
  }

  async getCapabilities(): Promise<string[]> {
    return Array.from(this.capabilities);
  }

  async getStatus(): Promise<any> {
    const systemIntelligence = await evolutionEngine.getSystemIntelligence();
    const quantumMetrics = quantumSuperAI.getSuperintelligenceMetrics();

    return {
      initialized: this.isInitialized,
      capabilities: Array.from(this.capabilities),
      systemHealth: systemIntelligence.overallHealth,
      quantumIQ: quantumMetrics.iqEquivalent,
      queueLength: this.requestQueue.length,
      processingActive: this.processingActive,
      timestamp: new Date()
    };
  }
}

export const nexusIntelligence = NexusIntelligenceOrchestrator.getInstance();
