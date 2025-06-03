import { 
  users, 
  quantumKnowledgeNodes, 
  llmInteractions,
  quantumLearning,
  asiDecisions,
  type User, 
  type InsertUser,
  type QuantumKnowledgeNode,
  type InsertQuantumKnowledgeNode,
  type LlmInteraction,
  type InsertLlmInteraction,
  type QuantumLearning,
  type InsertQuantumLearning,
  type AsiDecision,
  type InsertAsiDecision,
  type DatabaseStats,
  type ActivityItem,
  type LearningProgress
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Quantum Knowledge Node methods
  getQuantumKnowledgeNode(nodeId: string): Promise<QuantumKnowledgeNode | undefined>;
  getAllQuantumKnowledgeNodes(): Promise<QuantumKnowledgeNode[]>;
  createQuantumKnowledgeNode(node: InsertQuantumKnowledgeNode): Promise<QuantumKnowledgeNode>;
  updateQuantumKnowledgeNode(nodeId: string, updates: Partial<QuantumKnowledgeNode>): Promise<QuantumKnowledgeNode | undefined>;

  // LLM Interaction methods
  getLlmInteraction(interactionId: string): Promise<LlmInteraction | undefined>;
  getAllLlmInteractions(): Promise<LlmInteraction[]>;
  createLlmInteraction(interaction: InsertLlmInteraction): Promise<LlmInteraction>;

  // Quantum Learning methods
  getQuantumLearning(learningId: string): Promise<QuantumLearning | undefined>;
  getAllQuantumLearning(): Promise<QuantumLearning[]>;
  createQuantumLearning(learning: InsertQuantumLearning): Promise<QuantumLearning>;

  // ASI Decision methods
  getAsiDecision(decisionId: string): Promise<AsiDecision | undefined>;
  getAllAsiDecisions(): Promise<AsiDecision[]>;
  createAsiDecision(decision: InsertAsiDecision): Promise<AsiDecision>;

  // Dashboard methods
  getDatabaseStats(): Promise<DatabaseStats>;
  getRecentActivity(): Promise<ActivityItem[]>;
  getLearningProgress(): Promise<LearningProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quantumNodes: Map<string, QuantumKnowledgeNode>;
  private llmInteractions: Map<string, LlmInteraction>;
  private quantumLearning: Map<string, QuantumLearning>;
  private asiDecisions: Map<string, AsiDecision>;
  private activities: ActivityItem[];
  
  currentUserId: number;
  currentNodeId: number;
  currentInteractionId: number;
  currentLearningId: number;
  currentDecisionId: number;

  constructor() {
    this.users = new Map();
    this.quantumNodes = new Map();
    this.llmInteractions = new Map();
    this.quantumLearning = new Map();
    this.asiDecisions = new Map();
    this.activities = [];
    
    this.currentUserId = 1;
    this.currentNodeId = 1;
    this.currentInteractionId = 1;
    this.currentLearningId = 1;
    this.currentDecisionId = 1;

    // Initialize with some sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample quantum knowledge nodes
    const sampleNodes = [
      {
        nodeId: "qnode_fleet_optimization",
        content: "Fleet optimization requires predictive maintenance algorithms and real-time route planning",
        context: "transportation",
        confidence: 0.92,
        quantumState: "entangled",
        learnedFrom: "system_analysis",
        timestamp: new Date(),
        connections: ["qnode_cost_analysis", "qnode_performance"],
        asiEnhancementLevel: 1.847,
        retrievalCount: 23,
        successRate: 0.95,
        quantumSignature: "abc123def456"
      },
      {
        nodeId: "qnode_cost_analysis",
        content: "Cost reduction strategies focus on automated decision making and resource optimization",
        context: "financial",
        confidence: 0.88,
        quantumState: "coherent",
        learnedFrom: "data_analysis",
        timestamp: new Date(),
        connections: ["qnode_fleet_optimization"],
        asiEnhancementLevel: 1.823,
        retrievalCount: 18,
        successRate: 0.91,
        quantumSignature: "def456ghi789"
      }
    ];

    sampleNodes.forEach(node => {
      const fullNode: QuantumKnowledgeNode = {
        id: this.currentNodeId++,
        ...node
      };
      this.quantumNodes.set(node.nodeId, fullNode);
    });

    // Initialize recent activities
    this.activities = [
      {
        id: "activity_1",
        type: "node_created",
        title: "New knowledge node created",
        description: "Fleet optimization: Predictive maintenance algorithms",
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        icon: "plus",
        iconColor: "blue"
      },
      {
        id: "activity_2",
        type: "connections_enhanced",
        title: "Quantum connections enhanced",
        description: "47 new neural pathways established",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        icon: "link",
        iconColor: "green"
      },
      {
        id: "activity_3",
        type: "learning_cycle",
        title: "ASI learning cycle completed",
        description: "Enhancement factor increased to 1.847x",
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        icon: "brain",
        iconColor: "purple"
      },
      {
        id: "activity_4",
        type: "query_processed",
        title: "High-confidence query processed",
        description: "Cost optimization analysis completed",
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        icon: "search",
        iconColor: "cyan"
      }
    ];
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Quantum Knowledge Node methods
  async getQuantumKnowledgeNode(nodeId: string): Promise<QuantumKnowledgeNode | undefined> {
    return this.quantumNodes.get(nodeId);
  }

  async getAllQuantumKnowledgeNodes(): Promise<QuantumKnowledgeNode[]> {
    return Array.from(this.quantumNodes.values());
  }

  async createQuantumKnowledgeNode(node: InsertQuantumKnowledgeNode): Promise<QuantumKnowledgeNode> {
    const id = this.currentNodeId++;
    const fullNode: QuantumKnowledgeNode = { ...node, id };
    this.quantumNodes.set(node.nodeId, fullNode);
    
    // Add activity
    this.addActivity({
      type: "node_created",
      title: "New knowledge node created",
      description: node.content.substring(0, 50) + "...",
      icon: "plus",
      iconColor: "blue"
    });
    
    return fullNode;
  }

  async updateQuantumKnowledgeNode(nodeId: string, updates: Partial<QuantumKnowledgeNode>): Promise<QuantumKnowledgeNode | undefined> {
    const existing = this.quantumNodes.get(nodeId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.quantumNodes.set(nodeId, updated);
    return updated;
  }

  // LLM Interaction methods
  async getLlmInteraction(interactionId: string): Promise<LlmInteraction | undefined> {
    return this.llmInteractions.get(interactionId);
  }

  async getAllLlmInteractions(): Promise<LlmInteraction[]> {
    return Array.from(this.llmInteractions.values());
  }

  async createLlmInteraction(interaction: InsertLlmInteraction): Promise<LlmInteraction> {
    const id = this.currentInteractionId++;
    const fullInteraction: LlmInteraction = { ...interaction, id };
    this.llmInteractions.set(interaction.interactionId, fullInteraction);
    
    // Add activity
    this.addActivity({
      type: "query_processed",
      title: "Query processed",
      description: interaction.query.substring(0, 50) + "...",
      icon: "search",
      iconColor: "cyan"
    });
    
    return fullInteraction;
  }

  // Quantum Learning methods
  async getQuantumLearning(learningId: string): Promise<QuantumLearning | undefined> {
    return this.quantumLearning.get(learningId);
  }

  async getAllQuantumLearning(): Promise<QuantumLearning[]> {
    return Array.from(this.quantumLearning.values());
  }

  async createQuantumLearning(learning: InsertQuantumLearning): Promise<QuantumLearning> {
    const id = this.currentLearningId++;
    const fullLearning: QuantumLearning = { ...learning, id };
    this.quantumLearning.set(learning.learningId, fullLearning);
    
    // Add activity
    this.addActivity({
      type: "learning_cycle",
      title: "Learning cycle completed",
      description: `${learning.learningType} - ${learning.quantumImprovement.toFixed(3)}x improvement`,
      icon: "brain",
      iconColor: "purple"
    });
    
    return fullLearning;
  }

  // ASI Decision methods
  async getAsiDecision(decisionId: string): Promise<AsiDecision | undefined> {
    return this.asiDecisions.get(decisionId);
  }

  async getAllAsiDecisions(): Promise<AsiDecision[]> {
    return Array.from(this.asiDecisions.values());
  }

  async createAsiDecision(decision: InsertAsiDecision): Promise<AsiDecision> {
    const id = this.currentDecisionId++;
    const fullDecision: AsiDecision = { ...decision, id };
    this.asiDecisions.set(decision.decisionId, fullDecision);
    return fullDecision;
  }

  // Dashboard methods
  async getDatabaseStats(): Promise<DatabaseStats> {
    const quantumNodes = this.quantumNodes.size;
    const connections = Array.from(this.quantumNodes.values())
      .reduce((sum, node) => sum + node.connections.length, 0);
    
    const avgSuccessRate = Array.from(this.quantumNodes.values())
      .reduce((sum, node) => sum + node.successRate, 0) / quantumNodes || 0;

    const avgAsiFactor = Array.from(this.quantumNodes.values())
      .reduce((sum, node) => sum + node.asiEnhancementLevel, 0) / quantumNodes || 1.0;

    return {
      quantumNodes,
      asiFactor: avgAsiFactor,
      successRate: avgSuccessRate * 100,
      connections,
      queriesPerHour: Math.floor(Math.random() * 500) + 1500,
      avgQueryTime: Math.random() * 2 + 1
    };
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    return [...this.activities].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }

  async getLearningProgress(): Promise<LearningProgress> {
    const baseProgress = 75;
    const variation = 20;
    
    return {
      knowledgeAbsorption: baseProgress + Math.random() * variation,
      patternRecognition: baseProgress + 5 + Math.random() * variation,
      quantumCoherence: baseProgress - 5 + Math.random() * variation,
      nextCycle: "Optimizing quantum connections"
    };
  }

  private addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>) {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    this.activities.unshift(newActivity);
    
    // Keep only the last 20 activities
    if (this.activities.length > 20) {
      this.activities = this.activities.slice(0, 20);
    }
  }
}

export const storage = new MemStorage();
