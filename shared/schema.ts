import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quantumKnowledgeNodes = pgTable("quantum_knowledge_nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  content: text("content").notNull(),
  context: text("context"),
  confidence: real("confidence").notNull(),
  quantumState: text("quantum_state").notNull(),
  learnedFrom: text("learned_from").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  connections: jsonb("connections").$type<string[]>().notNull(),
  asiEnhancementLevel: real("asi_enhancement_level").notNull(),
  retrievalCount: integer("retrieval_count").notNull().default(0),
  successRate: real("success_rate").notNull().default(1.0),
  quantumSignature: text("quantum_signature").notNull(),
});

export const llmInteractions = pgTable("llm_interactions", {
  id: serial("id").primaryKey(),
  interactionId: text("interaction_id").notNull().unique(),
  query: text("query").notNull(),
  response: text("response").notNull(),
  confidence: real("confidence").notNull(),
  quantumEnhancement: real("quantum_enhancement").notNull(),
  sourceNodes: jsonb("source_nodes").$type<string[]>().notNull(),
  reasoningChain: jsonb("reasoning_chain").$type<string[]>().notNull(),
  computationalCost: real("computational_cost").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  userFeedback: real("user_feedback"),
});

export const quantumLearning = pgTable("quantum_learning", {
  id: serial("id").primaryKey(),
  learningId: text("learning_id").notNull().unique(),
  inputData: text("input_data").notNull(),
  outputData: text("output_data").notNull(),
  learningType: text("learning_type").notNull(),
  successMetrics: jsonb("success_metrics").$type<Record<string, number>>().notNull(),
  quantumImprovement: real("quantum_improvement").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const asiDecisions = pgTable("asi_decisions", {
  id: serial("id").primaryKey(),
  decisionId: text("decision_id").notNull().unique(),
  context: text("context").notNull(),
  decisionData: jsonb("decision_data").$type<Record<string, any>>().notNull(),
  confidenceLevel: real("confidence_level").notNull(),
  executionSuccess: real("execution_success").notNull(),
  costBenefitRatio: real("cost_benefit_ratio").notNull(),
  quantumReasoning: text("quantum_reasoning").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuantumKnowledgeNodeSchema = createInsertSchema(quantumKnowledgeNodes).omit({
  id: true,
});

export const insertLlmInteractionSchema = createInsertSchema(llmInteractions).omit({
  id: true,
});

export const insertQuantumLearningSchema = createInsertSchema(quantumLearning).omit({
  id: true,
});

export const insertAsiDecisionSchema = createInsertSchema(asiDecisions).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuantumKnowledgeNode = typeof quantumKnowledgeNodes.$inferSelect;
export type InsertQuantumKnowledgeNode = z.infer<typeof insertQuantumKnowledgeNodeSchema>;

export type LlmInteraction = typeof llmInteractions.$inferSelect;
export type InsertLlmInteraction = z.infer<typeof insertLlmInteractionSchema>;

export type QuantumLearning = typeof quantumLearning.$inferSelect;
export type InsertQuantumLearning = z.infer<typeof insertQuantumLearningSchema>;

export type AsiDecision = typeof asiDecisions.$inferSelect;
export type InsertAsiDecision = z.infer<typeof insertAsiDecisionSchema>;

// API Response types
export type QuantumQueryResponse = {
  responseText: string;
  confidence: number;
  quantumEnhancement: number;
  sourceNodes: string[];
  reasoningChain: string[];
  computationalCost: number;
  timestamp: string;
};

export type DatabaseStats = {
  quantumNodes: number;
  asiFactor: number;
  successRate: number;
  connections: number;
  queriesPerHour: number;
  avgQueryTime: number;
};

export type ActivityItem = {
  id: string;
  type: 'node_created' | 'connections_enhanced' | 'learning_cycle' | 'query_processed';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconColor: string;
};

export type LearningProgress = {
  knowledgeAbsorption: number;
  patternRecognition: number;
  quantumCoherence: number;
  nextCycle: string;
};
