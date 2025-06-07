import type { Express } from "express";
import { familyPlatformStorage } from "./family-platform-storage";
import {
  insertFamilyAccessLinkSchema,
  insertSmartPlannerEventSchema,
  insertSmartPlannerTaskSchema,
  insertWealthPulseAccountSchema,
  insertWealthPulseTransactionSchema,
  insertWealthPulseBudgetSchema,
  insertNexusNoteSchema,
  insertFamilySyncLocationSchema,
  insertFamilySyncStatusSchema,
  insertFamilySyncMessageSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import crypto from "crypto";

// Family members allowed access
const FAMILY_MEMBERS = ["John", "Dion", "Christian", "Christina", "Tina", "Carrie", "Courtney"];
const ADMIN_USER = "Watson";

// Middleware for authentication and role checking
const authenticateUser = async (req: any, res: any, next: any) => {
  const accessToken = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  
  if (!accessToken) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const user = await familyPlatformStorage.getUserByAccessToken(accessToken);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive access token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export function registerFamilyPlatformRoutes(app: Express) {
  // Health check
  app.get("/api/family/health", (req, res) => {
    res.json({ 
      status: "ok", 
      platform: "UNIFIED_FAMILY_PLATFORM",
      modules: ["SmartPlanner", "WealthPulse", "QuantumInsights", "NexusNotes", "FamilySync"],
      timestamp: new Date().toISOString()
    });
  });

  // Generate family access links (Admin only)
  app.post("/api/family/access-links", async (req, res) => {
    try {
      const { memberName } = req.body;
      
      if (!FAMILY_MEMBERS.includes(memberName)) {
        return res.status(400).json({ error: "Invalid family member name" });
      }

      const accessLink = await familyPlatformStorage.createFamilyAccessLink({ memberName });
      
      res.json({
        success: true,
        memberName,
        accessToken: accessLink.accessToken,
        accessUrl: `${req.protocol}://${req.get('host')}/join/${accessLink.accessToken}`,
        expiresAt: accessLink.expiresAt
      });
    } catch (error) {
      console.error("Error creating access link:", error);
      res.status(500).json({ error: "Failed to create access link" });
    }
  });

  // Join family using access link
  app.post("/api/family/join/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { firstName, lastName, email } = req.body;

      const accessLink = await familyPlatformStorage.getFamilyAccessLinkByToken(token);
      if (!accessLink || accessLink.isUsed || new Date() > accessLink.expiresAt) {
        return res.status(400).json({ error: "Invalid or expired access link" });
      }

      // Create user with access token
      const userAccessToken = crypto.randomBytes(32).toString('hex');
      const user = await familyPlatformStorage.upsertUser({
        id: crypto.randomUUID(),
        firstName,
        lastName,
        email,
        role: "family_member",
        accessToken: userAccessToken,
        isActive: true
      });

      // Mark access link as used
      await familyPlatformStorage.useFamilyAccessLink(token, user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken: userAccessToken
      });
    } catch (error) {
      console.error("Error joining family:", error);
      res.status(500).json({ error: "Failed to join family" });
    }
  });

  // Get user profile
  app.get("/api/family/profile", authenticateUser, async (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        lastLogin: req.user.lastLogin
      }
    });
  });

  // SmartPlanner Routes
  app.get("/api/family/smart-planner/events", authenticateUser, async (req: any, res) => {
    try {
      const events = await familyPlatformStorage.getSmartPlannerEvents(req.user.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/family/smart-planner/events", authenticateUser, async (req: any, res) => {
    try {
      const eventData = insertSmartPlannerEventSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const event = await familyPlatformStorage.createSmartPlannerEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid event data", details: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.get("/api/family/smart-planner/tasks", authenticateUser, async (req: any, res) => {
    try {
      const tasks = await familyPlatformStorage.getSmartPlannerTasks(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/family/smart-planner/tasks", authenticateUser, async (req: any, res) => {
    try {
      const taskData = insertSmartPlannerTaskSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const task = await familyPlatformStorage.createSmartPlannerTask(taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // WealthPulse Routes
  app.get("/api/family/wealth-pulse/accounts", authenticateUser, async (req: any, res) => {
    try {
      const accounts = await familyPlatformStorage.getWealthPulseAccounts(req.user.id);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.post("/api/family/wealth-pulse/accounts", authenticateUser, async (req: any, res) => {
    try {
      const accountData = insertWealthPulseAccountSchema.parse({
        ...req.body,
        ownedBy: req.user.id
      });
      const account = await familyPlatformStorage.createWealthPulseAccount(accountData);
      res.json(account);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid account data", details: error.errors });
      }
      console.error("Error creating account:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.get("/api/family/wealth-pulse/transactions", authenticateUser, async (req: any, res) => {
    try {
      const { accountId } = req.query;
      const transactions = await familyPlatformStorage.getWealthPulseTransactions(accountId as string);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/family/wealth-pulse/transactions", authenticateUser, async (req: any, res) => {
    try {
      const transactionData = insertWealthPulseTransactionSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const transaction = await familyPlatformStorage.createWealthPulseTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.get("/api/family/wealth-pulse/budgets", authenticateUser, async (req: any, res) => {
    try {
      const budgets = await familyPlatformStorage.getWealthPulseBudgets(req.user.id);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/family/wealth-pulse/budgets", authenticateUser, async (req: any, res) => {
    try {
      const budgetData = insertWealthPulseBudgetSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const budget = await familyPlatformStorage.createWealthPulseBudget(budgetData);
      res.json(budget);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid budget data", details: error.errors });
      }
      console.error("Error creating budget:", error);
      res.status(500).json({ error: "Failed to create budget" });
    }
  });

  // QuantumInsights Routes
  app.get("/api/family/quantum-insights/reports", authenticateUser, async (req: any, res) => {
    try {
      const reports = await familyPlatformStorage.getQuantumInsightsReports(req.user.id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/family/quantum-insights/metrics", authenticateUser, async (req: any, res) => {
    try {
      const metrics = await familyPlatformStorage.getQuantumInsightsMetrics(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // NexusNotes Routes
  app.get("/api/family/nexus-notes", authenticateUser, async (req: any, res) => {
    try {
      const notes = await familyPlatformStorage.getNexusNotes(req.user.id);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/family/nexus-notes", authenticateUser, async (req: any, res) => {
    try {
      const noteData = insertNexusNoteSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const note = await familyPlatformStorage.createNexusNote(noteData);
      res.json(note);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid note data", details: error.errors });
      }
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // FamilySync Routes
  app.get("/api/family/sync/locations", authenticateUser, async (req: any, res) => {
    try {
      const locations = await familyPlatformStorage.getFamilySyncLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.post("/api/family/sync/location", authenticateUser, async (req: any, res) => {
    try {
      const locationData = insertFamilySyncLocationSchema.parse({
        ...req.body,
        memberId: req.user.id
      });
      const location = await familyPlatformStorage.updateFamilySyncLocation(locationData);
      res.json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid location data", details: error.errors });
      }
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  app.get("/api/family/sync/statuses", authenticateUser, async (req: any, res) => {
    try {
      const statuses = await familyPlatformStorage.getFamilySyncStatuses();
      res.json(statuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      res.status(500).json({ error: "Failed to fetch statuses" });
    }
  });

  app.post("/api/family/sync/status", authenticateUser, async (req: any, res) => {
    try {
      const statusData = insertFamilySyncStatusSchema.parse({
        ...req.body,
        memberId: req.user.id
      });
      const status = await familyPlatformStorage.updateFamilySyncStatus(statusData);
      res.json(status);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid status data", details: error.errors });
      }
      console.error("Error updating status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  app.get("/api/family/sync/messages", authenticateUser, async (req: any, res) => {
    try {
      const messages = await familyPlatformStorage.getFamilySyncMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/family/sync/messages", authenticateUser, async (req: any, res) => {
    try {
      const messageData = insertFamilySyncMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      const message = await familyPlatformStorage.createFamilySyncMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Admin Routes (Watson only)
  app.get("/api/family/admin/access-links", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const accessLinks = await familyPlatformStorage.getFamilyAccessLinks();
      res.json(accessLinks);
    } catch (error) {
      console.error("Error fetching access links:", error);
      res.status(500).json({ error: "Failed to fetch access links" });
    }
  });

  app.post("/api/family/admin/generate-all-links", authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const results = [];
      for (const memberName of FAMILY_MEMBERS) {
        const accessLink = await familyPlatformStorage.createFamilyAccessLink({ memberName });
        results.push({
          memberName,
          accessToken: accessLink.accessToken,
          accessUrl: `${req.protocol}://${req.get('host')}/join/${accessLink.accessToken}`,
          expiresAt: accessLink.expiresAt
        });
      }
      res.json({ success: true, accessLinks: results });
    } catch (error) {
      console.error("Error generating access links:", error);
      res.status(500).json({ error: "Failed to generate access links" });
    }
  });
}