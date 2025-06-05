import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  level: integer("level").notNull(), // 1=viewer, 2=ops, 3=exec, 4=admin
  dashboardAccess: jsonb("dashboard_access").$type<string[]>().notNull(),
  modulePermissions: jsonb("module_permissions").$type<Record<string, boolean>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  roleId: integer("role_id").references(() => userRoles.id).notNull(),
  fingerprint: text("fingerprint").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const moduleAccessLogs = pgTable("module_access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moduleId: text("module_id").notNull(),
  action: text("action").notNull(),
  success: boolean("success").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

// Relations
export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
  sessions: many(userSessions),
  accessLogs: many(moduleAccessLogs),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const moduleAccessLogsRelations = relations(moduleAccessLogs, ({ one }) => ({
  user: one(users, {
    fields: [moduleAccessLogs.userId],
    references: [users.id],
  }),
}));

// User management schemas
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true });
export const insertNewUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  lastLogin: true 
});
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, lastActivity: true });
export const insertModuleAccessLogSchema = createInsertSchema(moduleAccessLogs).omit({ id: true, timestamp: true });

// User management types
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type NewUser = typeof users.$inferSelect;
export type InsertNewUser = z.infer<typeof insertNewUserSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type ModuleAccessLog = typeof moduleAccessLogs.$inferSelect;
export type InsertModuleAccessLog = z.infer<typeof insertModuleAccessLogSchema>;

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
