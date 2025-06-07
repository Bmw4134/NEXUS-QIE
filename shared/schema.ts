import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  boolean,
  integer,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with family member access control
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("family_member"), // "admin" | "family_member"
  isActive: boolean("is_active").notNull().default(true),
  accessToken: varchar("access_token"), // Generated access link token
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family access links for secure member onboarding
export const familyAccessLinks = pgTable("family_access_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberName: varchar("member_name").notNull(),
  accessToken: varchar("access_token").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  usedBy: varchar("used_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SmartPlanner module - family events and task planning
export const smartPlannerEvents = pgTable("smart_planner_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  priority: varchar("priority").notNull().default("medium"), // "low" | "medium" | "high"
  category: varchar("category").notNull(), // "family" | "work" | "personal" | "health"
  assignedTo: varchar("assigned_to").array(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: jsonb("recurring_pattern"), // stores recurring rule
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SmartPlanner tasks and todos
export const smartPlannerTasks = pgTable("smart_planner_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("pending"), // "pending" | "in_progress" | "completed"
  priority: varchar("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  assignedTo: varchar("assigned_to").notNull(),
  category: varchar("category").notNull(),
  tags: text("tags").array(),
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WealthPulse module - family financial management
export const wealthPulseAccounts = pgTable("wealth_pulse_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountName: varchar("account_name").notNull(),
  accountType: varchar("account_type").notNull(), // "checking" | "savings" | "investment" | "credit"
  institution: varchar("institution").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  ownedBy: varchar("owned_by").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wealthPulseTransactions = pgTable("wealth_pulse_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  subcategory: varchar("subcategory"),
  transactionType: varchar("transaction_type").notNull(), // "income" | "expense" | "transfer"
  date: date("date").notNull(),
  tags: text("tags").array(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wealthPulseBudgets = pgTable("wealth_pulse_budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  budgetAmount: decimal("budget_amount", { precision: 12, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  period: varchar("period").notNull(), // "monthly" | "weekly" | "yearly"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// QuantumInsights module - AI-powered family analytics
export const quantumInsightsReports = pgTable("quantum_insights_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportType: varchar("report_type").notNull(), // "financial" | "schedule" | "health" | "productivity"
  title: varchar("title").notNull(),
  insights: jsonb("insights").notNull(), // AI-generated insights
  dataPoints: jsonb("data_points").notNull(), // source data used
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  recommendations: jsonb("recommendations").notNull(),
  generatedFor: varchar("generated_for").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const quantumInsightsMetrics = pgTable("quantum_insights_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricType: varchar("metric_type").notNull(),
  metricName: varchar("metric_name").notNull(),
  value: decimal("value", { precision: 12, scale: 4 }).notNull(),
  unit: varchar("unit"),
  targetValue: decimal("target_value", { precision: 12, scale: 4 }),
  memberId: varchar("member_id").notNull(),
  date: date("date").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// NexusNotes module - family knowledge management
export const nexusNotes = pgTable("nexus_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // "family" | "recipes" | "important" | "memories"
  tags: text("tags").array(),
  isShared: boolean("is_shared").notNull().default(true),
  sharedWith: varchar("shared_with").array(),
  isPinned: boolean("is_pinned").notNull().default(false),
  attachments: jsonb("attachments"), // file references
  aiSummary: text("ai_summary"), // AI-generated summary
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nexusNoteVersions = pgTable("nexus_note_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteId: uuid("note_id").notNull(),
  content: text("content").notNull(),
  versionNumber: integer("version_number").notNull(),
  changeDescription: text("change_description"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// FamilySync module - real-time family coordination
export const familySyncLocations = pgTable("family_sync_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: varchar("member_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  address: text("address"),
  isHomeLocation: boolean("is_home_location").notNull().default(false),
  sharingEnabled: boolean("sharing_enabled").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const familySyncStatus = pgTable("family_sync_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: varchar("member_id").notNull(),
  status: varchar("status").notNull(), // "available" | "busy" | "away" | "do_not_disturb"
  customMessage: text("custom_message"),
  autoStatus: boolean("auto_status").notNull().default(false), // AI-determined status
  lastSeen: timestamp("last_seen").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const familySyncMessages = pgTable("family_sync_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id"), // null for family-wide messages
  message: text("message").notNull(),
  messageType: varchar("message_type").notNull().default("text"), // "text" | "location" | "status" | "urgent"
  isUrgent: boolean("is_urgent").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata"), // additional message data
  sentAt: timestamp("sent_at").defaultNow(),
});

// Insert schemas for form validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilyAccessLinkSchema = createInsertSchema(familyAccessLinks).omit({
  id: true,
  createdAt: true,
});

export const insertSmartPlannerEventSchema = createInsertSchema(smartPlannerEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmartPlannerTaskSchema = createInsertSchema(smartPlannerTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWealthPulseAccountSchema = createInsertSchema(wealthPulseAccounts).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertWealthPulseTransactionSchema = createInsertSchema(wealthPulseTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertWealthPulseBudgetSchema = createInsertSchema(wealthPulseBudgets).omit({
  id: true,
  createdAt: true,
});

export const insertNexusNoteSchema = createInsertSchema(nexusNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilySyncLocationSchema = createInsertSchema(familySyncLocations).omit({
  id: true,
  lastUpdated: true,
});

export const insertFamilySyncStatusSchema = createInsertSchema(familySyncStatus).omit({
  id: true,
  lastSeen: true,
  updatedAt: true,
});

export const insertFamilySyncMessageSchema = createInsertSchema(familySyncMessages).omit({
  id: true,
  sentAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FamilyAccessLink = typeof familyAccessLinks.$inferSelect;
export type InsertFamilyAccessLink = z.infer<typeof insertFamilyAccessLinkSchema>;

export type SmartPlannerEvent = typeof smartPlannerEvents.$inferSelect;
export type InsertSmartPlannerEvent = z.infer<typeof insertSmartPlannerEventSchema>;

export type SmartPlannerTask = typeof smartPlannerTasks.$inferSelect;
export type InsertSmartPlannerTask = z.infer<typeof insertSmartPlannerTaskSchema>;

export type WealthPulseAccount = typeof wealthPulseAccounts.$inferSelect;
export type InsertWealthPulseAccount = z.infer<typeof insertWealthPulseAccountSchema>;

export type WealthPulseTransaction = typeof wealthPulseTransactions.$inferSelect;
export type InsertWealthPulseTransaction = z.infer<typeof insertWealthPulseTransactionSchema>;

export type WealthPulseBudget = typeof wealthPulseBudgets.$inferSelect;
export type InsertWealthPulseBudget = z.infer<typeof insertWealthPulseBudgetSchema>;

export type QuantumInsightsReport = typeof quantumInsightsReports.$inferSelect;
export type QuantumInsightsMetric = typeof quantumInsightsMetrics.$inferSelect;

export type NexusNote = typeof nexusNotes.$inferSelect;
export type InsertNexusNote = z.infer<typeof insertNexusNoteSchema>;

export type NexusNoteVersion = typeof nexusNoteVersions.$inferSelect;

export type FamilySyncLocation = typeof familySyncLocations.$inferSelect;
export type InsertFamilySyncLocation = z.infer<typeof insertFamilySyncLocationSchema>;

export type FamilySyncStatus = typeof familySyncStatus.$inferSelect;
export type InsertFamilySyncStatus = z.infer<typeof insertFamilySyncStatusSchema>;

export type FamilySyncMessage = typeof familySyncMessages.$inferSelect;
export type InsertFamilySyncMessage = z.infer<typeof insertFamilySyncMessageSchema>;