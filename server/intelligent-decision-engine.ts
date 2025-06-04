import { NexusQuantumDatabase } from "./quantum-database";
import { QuantumMLEngine } from "./quantum-ml-engine";
import { perplexitySearch } from "./perplexity-search-service";

export interface UserIntent {
  query: string;
  context: string;
  requestType: 'feature_request' | 'bug_fix' | 'enhancement' | 'question' | 'configuration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredActions: string[];
  existingResources: string[];
  suggestedApproach: string;
  shouldCreateNewModule: boolean;
  confidence: number;
}

export interface DecisionContext {
  userRequest: string;
  currentSystemState: any;
  availableModules: string[];
  recentInteractions: string[];
  systemCapabilities: string[];
}

export class IntelligentDecisionEngine {
  private quantumDB: NexusQuantumDatabase;
  private mlEngine: QuantumMLEngine;
  private decisionHistory: UserIntent[] = [];
  private systemModules: Set<string> = new Set();
  private learningPatterns: Map<string, number> = new Map();

  constructor(quantumDB: NexusQuantumDatabase, mlEngine: QuantumMLEngine) {
    this.quantumDB = quantumDB;
    this.mlEngine = mlEngine;
    this.initializeSystemModules();
    this.loadLearningPatterns();
  }

  private initializeSystemModules() {
    // Track existing system modules to avoid duplication
    const modules = [
      'quantum-database',
      'market-intelligence-hub',
      'nexus-research-automation',
      'automation-suite',
      'chatgpt-codex-integration',
      'perplexity-search-service',
      'github-brain-integration',
      'quantum-ml-engine'
    ];
    
    modules.forEach(module => this.systemModules.add(module));
  }

  private loadLearningPatterns() {
    // Load historical decision patterns from quantum database
    const stats = this.quantumDB.getStatistics();
    
    // Common anti-patterns to avoid
    this.learningPatterns.set('duplicate_module_creation', 0.9);
    this.learningPatterns.set('unnecessary_complexity', 0.8);
    this.learningPatterns.set('feature_stacking', 0.7);
    this.learningPatterns.set('premature_optimization', 0.6);
  }

  async analyzeUserIntent(userRequest: string, context: DecisionContext): Promise<UserIntent> {
    console.log(`Analyzing user intent: ${userRequest.substring(0, 100)}...`);

    // Use Perplexity for intent understanding if available
    let enhancedAnalysis = '';
    if (perplexitySearch.isConfigured()) {
      try {
        const searchResult = await perplexitySearch.search({
          query: `Analyze this software development request and determine if it requires new modules or can use existing functionality: "${userRequest}"`,
          context: 'software architecture analysis',
          searchType: 'tech'
        });
        enhancedAnalysis = searchResult.response;
      } catch (error) {
        console.log('Perplexity analysis unavailable, using local intelligence');
      }
    }

    // Analyze request type
    const requestType = this.classifyRequestType(userRequest);
    
    // Check existing capabilities
    const existingResources = this.identifyExistingResources(userRequest, context);
    
    // Determine if new module creation is needed
    const shouldCreateNewModule = this.shouldCreateNewModule(userRequest, existingResources);
    
    // Generate intelligent approach
    const suggestedApproach = this.generateApproach(userRequest, existingResources, enhancedAnalysis);
    
    // Calculate confidence
    const confidence = this.calculateDecisionConfidence(userRequest, existingResources);

    const intent: UserIntent = {
      query: userRequest,
      context: context.userRequest,
      requestType,
      priority: this.determinePriority(userRequest),
      requiredActions: this.extractRequiredActions(userRequest, suggestedApproach),
      existingResources,
      suggestedApproach,
      shouldCreateNewModule,
      confidence
    };

    // Store decision for learning
    this.decisionHistory.push(intent);
    this.quantumDB.storeQuantumKnowledge(
      JSON.stringify(intent),
      'Decision Analysis',
      'intelligent_decision_engine'
    );

    return intent;
  }

  private classifyRequestType(request: string): UserIntent['requestType'] {
    const lowercaseRequest = request.toLowerCase();
    
    if (lowercaseRequest.includes('add') || lowercaseRequest.includes('create') || lowercaseRequest.includes('build')) {
      return 'feature_request';
    }
    if (lowercaseRequest.includes('fix') || lowercaseRequest.includes('error') || lowercaseRequest.includes('bug')) {
      return 'bug_fix';
    }
    if (lowercaseRequest.includes('improve') || lowercaseRequest.includes('enhance') || lowercaseRequest.includes('optimize')) {
      return 'enhancement';
    }
    if (lowercaseRequest.includes('configure') || lowercaseRequest.includes('setup') || lowercaseRequest.includes('install')) {
      return 'configuration';
    }
    
    return 'question';
  }

  private identifyExistingResources(request: string, context: DecisionContext): string[] {
    const resources: string[] = [];
    const lowercaseRequest = request.toLowerCase();

    // Check against existing modules
    Array.from(this.systemModules).forEach(module => {
      if (this.isModuleRelevant(module, lowercaseRequest)) {
        resources.push(module);
      }
    });

    // Check available APIs and services
    if (lowercaseRequest.includes('search') || lowercaseRequest.includes('perplexity')) {
      resources.push('perplexity-search-api');
    }
    if (lowercaseRequest.includes('market') || lowercaseRequest.includes('financial')) {
      resources.push('market-intelligence-hub');
    }
    if (lowercaseRequest.includes('automation') || lowercaseRequest.includes('ai')) {
      resources.push('automation-suite');
    }
    if (lowercaseRequest.includes('research') || lowercaseRequest.includes('scraping')) {
      resources.push('nexus-research-automation');
    }

    return resources;
  }

  private isModuleRelevant(module: string, request: string): boolean {
    const moduleKeywords = {
      'quantum-database': ['database', 'storage', 'knowledge', 'quantum'],
      'market-intelligence-hub': ['market', 'financial', 'trading', 'economic'],
      'nexus-research-automation': ['research', 'scraping', 'automation', 'data'],
      'automation-suite': ['automation', 'ai', 'agi', 'asi', 'tasks'],
      'chatgpt-codex-integration': ['chatgpt', 'codex', 'openai', 'code'],
      'perplexity-search-service': ['search', 'perplexity', 'query'],
      'github-brain-integration': ['github', 'repository', 'code', 'brain'],
      'quantum-ml-engine': ['machine learning', 'ml', 'prediction', 'quantum']
    };

    const keywords = moduleKeywords[module] || [];
    return keywords.some(keyword => request.includes(keyword));
  }

  private shouldCreateNewModule(request: string, existingResources: string[]): boolean {
    // Anti-pattern detection
    if (this.detectAntiPatterns(request, existingResources)) {
      return false;
    }

    // Check if existing resources can handle the request
    if (existingResources.length > 0) {
      const coverage = this.calculateFunctionalCoverage(request, existingResources);
      if (coverage > 0.7) {
        return false; // Existing resources can handle 70%+ of the request
      }
    }

    // Only create new module if truly necessary
    const necessityScore = this.calculateModuleNecessity(request, existingResources);
    return necessityScore > 0.8;
  }

  private detectAntiPatterns(request: string, existingResources: string[]): boolean {
    const request_lower = request.toLowerCase();
    
    // Detect duplicate functionality requests
    if (request_lower.includes('another') || request_lower.includes('duplicate')) {
      return true;
    }

    // Detect feature stacking
    if (existingResources.length > 3 && request_lower.includes('add')) {
      return true;
    }

    // Detect unnecessary complexity
    if (request_lower.includes('complex') && existingResources.length > 0) {
      return true;
    }

    return false;
  }

  private calculateFunctionalCoverage(request: string, existingResources: string[]): number {
    if (existingResources.length === 0) return 0;

    const requestTokens = request.toLowerCase().split(/\s+/);
    let coveredTokens = 0;

    requestTokens.forEach(token => {
      existingResources.forEach(resource => {
        if (resource.toLowerCase().includes(token) || token.length < 3) {
          coveredTokens++;
        }
      });
    });

    return Math.min(coveredTokens / requestTokens.length, 1.0);
  }

  private calculateModuleNecessity(request: string, existingResources: string[]): number {
    let necessity = 0.5; // Base necessity

    // Increase necessity for genuinely new functionality
    if (existingResources.length === 0) necessity += 0.3;
    
    // Decrease necessity for incremental improvements
    if (request.toLowerCase().includes('improve') && existingResources.length > 0) {
      necessity -= 0.4;
    }

    // Increase necessity for core system functionality
    if (request.toLowerCase().includes('core') || request.toLowerCase().includes('essential')) {
      necessity += 0.2;
    }

    return Math.max(0, Math.min(necessity, 1.0));
  }

  private generateApproach(request: string, existingResources: string[], enhancedAnalysis: string): string {
    if (existingResources.length > 0) {
      return `Enhance existing systems: ${existingResources.join(', ')}. ${enhancedAnalysis ? 'AI Analysis: ' + enhancedAnalysis.substring(0, 200) : ''}`;
    }

    return `Implement using intelligent integration approach. ${enhancedAnalysis ? 'AI Guidance: ' + enhancedAnalysis.substring(0, 200) : ''}`;
  }

  private extractRequiredActions(request: string, approach: string): string[] {
    const actions: string[] = [];
    const lowercaseRequest = request.toLowerCase();

    if (lowercaseRequest.includes('integrate') || lowercaseRequest.includes('connect')) {
      actions.push('integrate_existing_systems');
    }
    if (lowercaseRequest.includes('configure') || lowercaseRequest.includes('setup')) {
      actions.push('configure_settings');
    }
    if (lowercaseRequest.includes('enhance') || lowercaseRequest.includes('improve')) {
      actions.push('enhance_functionality');
    }
    if (lowercaseRequest.includes('standardize')) {
      actions.push('standardize_implementation');
    }

    return actions.length > 0 ? actions : ['analyze_requirements'];
  }

  private determinePriority(request: string): UserIntent['priority'] {
    const lowercaseRequest = request.toLowerCase();
    
    if (lowercaseRequest.includes('critical') || lowercaseRequest.includes('urgent')) {
      return 'critical';
    }
    if (lowercaseRequest.includes('important') || lowercaseRequest.includes('asap')) {
      return 'high';
    }
    if (lowercaseRequest.includes('minor') || lowercaseRequest.includes('nice to have')) {
      return 'low';
    }
    
    return 'medium';
  }

  private calculateDecisionConfidence(request: string, existingResources: string[]): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for well-defined requests
    if (request.length > 50 && request.includes(' ')) {
      confidence += 0.1;
    }

    // Increase confidence when existing resources are identified
    if (existingResources.length > 0) {
      confidence += 0.15;
    }

    // Decrease confidence for vague requests
    if (request.toLowerCase().includes('somehow') || request.toLowerCase().includes('maybe')) {
      confidence -= 0.2;
    }

    return Math.max(0.3, Math.min(confidence, 1.0));
  }

  async askClarificationQuestion(intent: UserIntent): Promise<string> {
    if (intent.confidence < 0.6) {
      return `I want to make sure I understand correctly. You're asking for ${intent.requestType} related to "${intent.query}". 

I found these existing resources: ${intent.existingResources.join(', ')}

Should I ${intent.shouldCreateNewModule ? 'create new functionality' : 'enhance the existing systems'} to meet your needs?`;
    }

    if (intent.shouldCreateNewModule && intent.existingResources.length > 0) {
      return `I notice you have existing ${intent.existingResources.join(' and ')} that might handle this. Should I enhance those instead of creating something new?`;
    }

    return '';
  }

  getDecisionSummary(intent: UserIntent): string {
    return `Analysis: ${intent.requestType} (${intent.priority} priority, ${(intent.confidence * 100).toFixed(0)}% confidence)
Approach: ${intent.suggestedApproach}
Existing Resources: ${intent.existingResources.length > 0 ? intent.existingResources.join(', ') : 'None identified'}
Create New Module: ${intent.shouldCreateNewModule ? 'Yes' : 'No - enhance existing'}`;
  }

  getDecisionHistory(): UserIntent[] {
    return this.decisionHistory.slice(-10); // Return last 10 decisions
  }

  updateLearningPatterns(intent: UserIntent, outcome: 'success' | 'failure') {
    // Update learning patterns based on decision outcomes
    const patternKey = `${intent.requestType}_${intent.shouldCreateNewModule ? 'new' : 'enhance'}`;
    const currentScore = this.learningPatterns.get(patternKey) || 0.5;
    
    if (outcome === 'success') {
      this.learningPatterns.set(patternKey, Math.min(currentScore + 0.1, 1.0));
    } else {
      this.learningPatterns.set(patternKey, Math.max(currentScore - 0.1, 0.1));
    }
  }
}

export const intelligentDecision = new IntelligentDecisionEngine(
  new NexusQuantumDatabase(),
  new QuantumMLEngine()
);