import {
  users,
  familyAccessLinks,
  smartPlannerEvents,
  smartPlannerTasks,
  wealthPulseAccounts,
  wealthPulseTransactions,
  wealthPulseBudgets,
  quantumInsightsReports,
  quantumInsightsMetrics,
  nexusNotes,
  nexusNoteVersions,
  familySyncLocations,
  familySyncStatus,
  familySyncMessages,
  type User,
  type UpsertUser,
  type FamilyAccessLink,
  type InsertFamilyAccessLink,
  type SmartPlannerEvent,
  type InsertSmartPlannerEvent,
  type SmartPlannerTask,
  type InsertSmartPlannerTask,
  type WealthPulseAccount,
  type InsertWealthPulseAccount,
  type WealthPulseTransaction,
  type InsertWealthPulseTransaction,
  type WealthPulseBudget,
  type InsertWealthPulseBudget,
  type QuantumInsightsReport,
  type QuantumInsightsMetric,
  type NexusNote,
  type InsertNexusNote,
  type NexusNoteVersion,
  type FamilySyncLocation,
  type InsertFamilySyncLocation,
  type FamilySyncStatus,
  type InsertFamilySyncStatus,
  type FamilySyncMessage,
  type InsertFamilySyncMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, like } from "drizzle-orm";
import crypto from "crypto";

export interface IFamilyPlatformStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByAccessToken(token: string): Promise<User | undefined>;
  
  // Family access links
  createFamilyAccessLink(link: InsertFamilyAccessLink): Promise<FamilyAccessLink>;
  getFamilyAccessLinkByToken(token: string): Promise<FamilyAccessLink | undefined>;
  useFamilyAccessLink(token: string, userId: string): Promise<void>;
  getFamilyAccessLinks(): Promise<FamilyAccessLink[]>;
  
  // SmartPlanner
  getSmartPlannerEvents(memberId?: string): Promise<SmartPlannerEvent[]>;
  createSmartPlannerEvent(event: InsertSmartPlannerEvent): Promise<SmartPlannerEvent>;
  updateSmartPlannerEvent(id: string, event: Partial<InsertSmartPlannerEvent>): Promise<SmartPlannerEvent>;
  deleteSmartPlannerEvent(id: string): Promise<void>;
  
  getSmartPlannerTasks(assignedTo?: string): Promise<SmartPlannerTask[]>;
  createSmartPlannerTask(task: InsertSmartPlannerTask): Promise<SmartPlannerTask>;
  updateSmartPlannerTask(id: string, task: Partial<InsertSmartPlannerTask>): Promise<SmartPlannerTask>;
  deleteSmartPlannerTask(id: string): Promise<void>;
  
  // WealthPulse
  getWealthPulseAccounts(ownedBy?: string): Promise<WealthPulseAccount[]>;
  createWealthPulseAccount(account: InsertWealthPulseAccount): Promise<WealthPulseAccount>;
  updateWealthPulseAccount(id: string, account: Partial<InsertWealthPulseAccount>): Promise<WealthPulseAccount>;
  deleteWealthPulseAccount(id: string): Promise<void>;
  
  getWealthPulseTransactions(accountId?: string): Promise<WealthPulseTransaction[]>;
  createWealthPulseTransaction(transaction: InsertWealthPulseTransaction): Promise<WealthPulseTransaction>;
  updateWealthPulseTransaction(id: string, transaction: Partial<InsertWealthPulseTransaction>): Promise<WealthPulseTransaction>;
  deleteWealthPulseTransaction(id: string): Promise<void>;
  
  getWealthPulseBudgets(createdBy?: string): Promise<WealthPulseBudget[]>;
  createWealthPulseBudget(budget: InsertWealthPulseBudget): Promise<WealthPulseBudget>;
  updateWealthPulseBudget(id: string, budget: Partial<InsertWealthPulseBudget>): Promise<WealthPulseBudget>;
  deleteWealthPulseBudget(id: string): Promise<void>;
  
  // QuantumInsights
  getQuantumInsightsReports(generatedFor?: string): Promise<QuantumInsightsReport[]>;
  createQuantumInsightsReport(report: Partial<QuantumInsightsReport>): Promise<QuantumInsightsReport>;
  
  getQuantumInsightsMetrics(memberId?: string): Promise<QuantumInsightsMetric[]>;
  createQuantumInsightsMetric(metric: Partial<QuantumInsightsMetric>): Promise<QuantumInsightsMetric>;
  
  // NexusNotes
  getNexusNotes(createdBy?: string): Promise<NexusNote[]>;
  createNexusNote(note: InsertNexusNote): Promise<NexusNote>;
  updateNexusNote(id: string, note: Partial<InsertNexusNote>): Promise<NexusNote>;
  deleteNexusNote(id: string): Promise<void>;
  
  getNexusNoteVersions(noteId: string): Promise<NexusNoteVersion[]>;
  createNexusNoteVersion(version: Partial<NexusNoteVersion>): Promise<NexusNoteVersion>;
  
  // FamilySync
  getFamilySyncLocations(memberId?: string): Promise<FamilySyncLocation[]>;
  updateFamilySyncLocation(location: InsertFamilySyncLocation): Promise<FamilySyncLocation>;
  
  getFamilySyncStatuses(): Promise<FamilySyncStatus[]>;
  updateFamilySyncStatus(status: InsertFamilySyncStatus): Promise<FamilySyncStatus>;
  
  getFamilySyncMessages(recipientId?: string): Promise<FamilySyncMessage[]>;
  createFamilySyncMessage(message: InsertFamilySyncMessage): Promise<FamilySyncMessage>;
  markMessageAsRead(id: string): Promise<void>;
}

export class DatabaseFamilyPlatformStorage implements IFamilyPlatformStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByAccessToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.accessToken, token));
    return user;
  }

  // Family access links
  async createFamilyAccessLink(linkData: InsertFamilyAccessLink): Promise<FamilyAccessLink> {
    const accessToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const [link] = await db
      .insert(familyAccessLinks)
      .values({
        ...linkData,
        accessToken,
        expiresAt,
      })
      .returning();
    return link;
  }

  async getFamilyAccessLinkByToken(token: string): Promise<FamilyAccessLink | undefined> {
    const [link] = await db
      .select()
      .from(familyAccessLinks)
      .where(and(eq(familyAccessLinks.accessToken, token), eq(familyAccessLinks.isUsed, false)));
    return link;
  }

  async useFamilyAccessLink(token: string, userId: string): Promise<void> {
    await db
      .update(familyAccessLinks)
      .set({ isUsed: true, usedBy: userId })
      .where(eq(familyAccessLinks.accessToken, token));
  }

  async getFamilyAccessLinks(): Promise<FamilyAccessLink[]> {
    return await db.select().from(familyAccessLinks).orderBy(desc(familyAccessLinks.createdAt));
  }

  // SmartPlanner
  async getSmartPlannerEvents(memberId?: string): Promise<SmartPlannerEvent[]> {
    const query = db.select().from(smartPlannerEvents);
    if (memberId) {
      return await query.where(or(
        eq(smartPlannerEvents.createdBy, memberId),
        like(smartPlannerEvents.assignedTo, `%${memberId}%`)
      )).orderBy(smartPlannerEvents.startDate);
    }
    return await query.orderBy(smartPlannerEvents.startDate);
  }

  async createSmartPlannerEvent(eventData: InsertSmartPlannerEvent): Promise<SmartPlannerEvent> {
    const [event] = await db.insert(smartPlannerEvents).values(eventData).returning();
    return event;
  }

  async updateSmartPlannerEvent(id: string, eventData: Partial<InsertSmartPlannerEvent>): Promise<SmartPlannerEvent> {
    const [event] = await db
      .update(smartPlannerEvents)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(smartPlannerEvents.id, id))
      .returning();
    return event;
  }

  async deleteSmartPlannerEvent(id: string): Promise<void> {
    await db.delete(smartPlannerEvents).where(eq(smartPlannerEvents.id, id));
  }

  async getSmartPlannerTasks(assignedTo?: string): Promise<SmartPlannerTask[]> {
    const query = db.select().from(smartPlannerTasks);
    if (assignedTo) {
      return await query.where(eq(smartPlannerTasks.assignedTo, assignedTo)).orderBy(smartPlannerTasks.dueDate);
    }
    return await query.orderBy(smartPlannerTasks.dueDate);
  }

  async createSmartPlannerTask(taskData: InsertSmartPlannerTask): Promise<SmartPlannerTask> {
    const [task] = await db.insert(smartPlannerTasks).values(taskData).returning();
    return task;
  }

  async updateSmartPlannerTask(id: string, taskData: Partial<InsertSmartPlannerTask>): Promise<SmartPlannerTask> {
    const [task] = await db
      .update(smartPlannerTasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(smartPlannerTasks.id, id))
      .returning();
    return task;
  }

  async deleteSmartPlannerTask(id: string): Promise<void> {
    await db.delete(smartPlannerTasks).where(eq(smartPlannerTasks.id, id));
  }

  // WealthPulse
  async getWealthPulseAccounts(ownedBy?: string): Promise<WealthPulseAccount[]> {
    const query = db.select().from(wealthPulseAccounts);
    if (ownedBy) {
      return await query.where(eq(wealthPulseAccounts.ownedBy, ownedBy)).orderBy(wealthPulseAccounts.accountName);
    }
    return await query.orderBy(wealthPulseAccounts.accountName);
  }

  async createWealthPulseAccount(accountData: InsertWealthPulseAccount): Promise<WealthPulseAccount> {
    const [account] = await db.insert(wealthPulseAccounts).values(accountData).returning();
    return account;
  }

  async updateWealthPulseAccount(id: string, accountData: Partial<InsertWealthPulseAccount>): Promise<WealthPulseAccount> {
    const [account] = await db
      .update(wealthPulseAccounts)
      .set({ ...accountData, lastUpdated: new Date() })
      .where(eq(wealthPulseAccounts.id, id))
      .returning();
    return account;
  }

  async deleteWealthPulseAccount(id: string): Promise<void> {
    await db.delete(wealthPulseAccounts).where(eq(wealthPulseAccounts.id, id));
  }

  async getWealthPulseTransactions(accountId?: string): Promise<WealthPulseTransaction[]> {
    const query = db.select().from(wealthPulseTransactions);
    if (accountId) {
      return await query.where(eq(wealthPulseTransactions.accountId, accountId)).orderBy(desc(wealthPulseTransactions.date));
    }
    return await query.orderBy(desc(wealthPulseTransactions.date));
  }

  async createWealthPulseTransaction(transactionData: InsertWealthPulseTransaction): Promise<WealthPulseTransaction> {
    const [transaction] = await db.insert(wealthPulseTransactions).values(transactionData).returning();
    return transaction;
  }

  async updateWealthPulseTransaction(id: string, transactionData: Partial<InsertWealthPulseTransaction>): Promise<WealthPulseTransaction> {
    const [transaction] = await db
      .update(wealthPulseTransactions)
      .set(transactionData)
      .where(eq(wealthPulseTransactions.id, id))
      .returning();
    return transaction;
  }

  async deleteWealthPulseTransaction(id: string): Promise<void> {
    await db.delete(wealthPulseTransactions).where(eq(wealthPulseTransactions.id, id));
  }

  async getWealthPulseBudgets(createdBy?: string): Promise<WealthPulseBudget[]> {
    const query = db.select().from(wealthPulseBudgets);
    if (createdBy) {
      return await query.where(eq(wealthPulseBudgets.createdBy, createdBy)).orderBy(wealthPulseBudgets.name);
    }
    return await query.orderBy(wealthPulseBudgets.name);
  }

  async createWealthPulseBudget(budgetData: InsertWealthPulseBudget): Promise<WealthPulseBudget> {
    const [budget] = await db.insert(wealthPulseBudgets).values(budgetData).returning();
    return budget;
  }

  async updateWealthPulseBudget(id: string, budgetData: Partial<InsertWealthPulseBudget>): Promise<WealthPulseBudget> {
    const [budget] = await db
      .update(wealthPulseBudgets)
      .set(budgetData)
      .where(eq(wealthPulseBudgets.id, id))
      .returning();
    return budget;
  }

  async deleteWealthPulseBudget(id: string): Promise<void> {
    await db.delete(wealthPulseBudgets).where(eq(wealthPulseBudgets.id, id));
  }

  // QuantumInsights
  async getQuantumInsightsReports(generatedFor?: string): Promise<QuantumInsightsReport[]> {
    const query = db.select().from(quantumInsightsReports);
    if (generatedFor) {
      return await query.where(eq(quantumInsightsReports.generatedFor, generatedFor)).orderBy(desc(quantumInsightsReports.generatedAt));
    }
    return await query.orderBy(desc(quantumInsightsReports.generatedAt));
  }

  async createQuantumInsightsReport(reportData: Partial<QuantumInsightsReport>): Promise<QuantumInsightsReport> {
    const [report] = await db.insert(quantumInsightsReports).values(reportData as any).returning();
    return report;
  }

  async getQuantumInsightsMetrics(memberId?: string): Promise<QuantumInsightsMetric[]> {
    const query = db.select().from(quantumInsightsMetrics);
    if (memberId) {
      return await query.where(eq(quantumInsightsMetrics.memberId, memberId)).orderBy(desc(quantumInsightsMetrics.date));
    }
    return await query.orderBy(desc(quantumInsightsMetrics.date));
  }

  async createQuantumInsightsMetric(metricData: Partial<QuantumInsightsMetric>): Promise<QuantumInsightsMetric> {
    const [metric] = await db.insert(quantumInsightsMetrics).values(metricData as any).returning();
    return metric;
  }

  // NexusNotes
  async getNexusNotes(createdBy?: string): Promise<NexusNote[]> {
    const query = db.select().from(nexusNotes);
    if (createdBy) {
      return await query.where(or(
        eq(nexusNotes.createdBy, createdBy),
        and(eq(nexusNotes.isShared, true), like(nexusNotes.sharedWith, `%${createdBy}%`))
      )).orderBy(desc(nexusNotes.updatedAt));
    }
    return await query.orderBy(desc(nexusNotes.updatedAt));
  }

  async createNexusNote(noteData: InsertNexusNote): Promise<NexusNote> {
    const [note] = await db.insert(nexusNotes).values(noteData).returning();
    return note;
  }

  async updateNexusNote(id: string, noteData: Partial<InsertNexusNote>): Promise<NexusNote> {
    const [note] = await db
      .update(nexusNotes)
      .set({ ...noteData, updatedAt: new Date() })
      .where(eq(nexusNotes.id, id))
      .returning();
    return note;
  }

  async deleteNexusNote(id: string): Promise<void> {
    await db.delete(nexusNotes).where(eq(nexusNotes.id, id));
  }

  async getNexusNoteVersions(noteId: string): Promise<NexusNoteVersion[]> {
    return await db
      .select()
      .from(nexusNoteVersions)
      .where(eq(nexusNoteVersions.noteId, noteId))
      .orderBy(desc(nexusNoteVersions.versionNumber));
  }

  async createNexusNoteVersion(versionData: Partial<NexusNoteVersion>): Promise<NexusNoteVersion> {
    const [version] = await db.insert(nexusNoteVersions).values(versionData as any).returning();
    return version;
  }

  // FamilySync
  async getFamilySyncLocations(memberId?: string): Promise<FamilySyncLocation[]> {
    const query = db.select().from(familySyncLocations);
    if (memberId) {
      return await query.where(eq(familySyncLocations.memberId, memberId)).orderBy(desc(familySyncLocations.lastUpdated));
    }
    return await query.orderBy(desc(familySyncLocations.lastUpdated));
  }

  async updateFamilySyncLocation(locationData: InsertFamilySyncLocation): Promise<FamilySyncLocation> {
    const [location] = await db
      .insert(familySyncLocations)
      .values({ ...locationData, lastUpdated: new Date() })
      .onConflictDoUpdate({
        target: familySyncLocations.memberId,
        set: { ...locationData, lastUpdated: new Date() },
      })
      .returning();
    return location;
  }

  async getFamilySyncStatuses(): Promise<FamilySyncStatus[]> {
    return await db.select().from(familySyncStatus).orderBy(desc(familySyncStatus.lastSeen));
  }

  async updateFamilySyncStatus(statusData: InsertFamilySyncStatus): Promise<FamilySyncStatus> {
    const [status] = await db
      .insert(familySyncStatus)
      .values({ ...statusData, lastSeen: new Date(), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: familySyncStatus.memberId,
        set: { ...statusData, lastSeen: new Date(), updatedAt: new Date() },
      })
      .returning();
    return status;
  }

  async getFamilySyncMessages(recipientId?: string): Promise<FamilySyncMessage[]> {
    if (recipientId) {
      return await db.select().from(familySyncMessages)
        .where(eq(familySyncMessages.recipientId, recipientId))
        .orderBy(desc(familySyncMessages.sentAt));
    }
    return await db.select().from(familySyncMessages).orderBy(desc(familySyncMessages.sentAt));
  }

  async createFamilySyncMessage(messageData: InsertFamilySyncMessage): Promise<FamilySyncMessage> {
    const [message] = await db.insert(familySyncMessages).values(messageData).returning();
    return message;
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db
      .update(familySyncMessages)
      .set({ isRead: true })
      .where(eq(familySyncMessages.id, id));
  }
}

export const familyPlatformStorage = new DatabaseFamilyPlatformStorage();