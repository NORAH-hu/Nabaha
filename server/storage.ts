import {
  users,
  chatSessions,
  chatMessages,
  uploadedFiles,
  performanceAnalytics,
  supportTickets,
  type User,
  type UpsertUser,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type UploadedFile,
  type InsertUploadedFile,
  type PerformanceAnalytics,
  type InsertPerformanceAnalytics,
  type SupportTicket,
  type InsertSupportTicket,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;
  updateUserSubscription(id: string, plan: string, expiresAt: Date, sessions: number): Promise<User>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession>;
  
  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getSessionMessages(sessionId: number): Promise<ChatMessage[]>;
  
  // File operations
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFile(id: number): Promise<UploadedFile | undefined>;
  getUserFiles(userId: string): Promise<UploadedFile[]>;
  updateFileProcessStatus(id: number, isProcessed: boolean): Promise<UploadedFile>;
  
  // Performance analytics operations
  createPerformanceAnalytics(analytics: InsertPerformanceAnalytics): Promise<PerformanceAnalytics>;
  getUserPerformanceAnalytics(userId: string): Promise<PerformanceAnalytics[]>;
  getSubjectPerformanceAnalytics(userId: string, subject: string): Promise<PerformanceAnalytics[]>;
  
  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: string): Promise<SupportTicket[]>;
  updateSupportTicketStatus(id: number, status: string): Promise<SupportTicket>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSubscription(id: string, plan: string, expiresAt: Date, sessions: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        currentPlan: plan as any,
        subscriptionExpiresAt: expiresAt,
        sessionsRemaining: sessions,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Chat session operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession> {
    const [session] = await db
      .update(chatSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return session;
  }

  // Chat message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getSessionMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  // File operations
  async createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile> {
    const [newFile] = await db
      .insert(uploadedFiles)
      .values(file)
      .returning();
    return newFile;
  }

  async getUploadedFile(id: number): Promise<UploadedFile | undefined> {
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, id));
    return file;
  }

  async getUserFiles(userId: string): Promise<UploadedFile[]> {
    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId))
      .orderBy(desc(uploadedFiles.createdAt));
  }

  async updateFileProcessStatus(id: number, isProcessed: boolean): Promise<UploadedFile> {
    const [file] = await db
      .update(uploadedFiles)
      .set({ isProcessed })
      .where(eq(uploadedFiles.id, id))
      .returning();
    return file;
  }

  // Performance analytics operations
  async createPerformanceAnalytics(analytics: InsertPerformanceAnalytics): Promise<PerformanceAnalytics> {
    const [newAnalytics] = await db
      .insert(performanceAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async getUserPerformanceAnalytics(userId: string): Promise<PerformanceAnalytics[]> {
    return await db
      .select()
      .from(performanceAnalytics)
      .where(eq(performanceAnalytics.userId, userId))
      .orderBy(desc(performanceAnalytics.createdAt));
  }

  async getSubjectPerformanceAnalytics(userId: string, subject: string): Promise<PerformanceAnalytics[]> {
    return await db
      .select()
      .from(performanceAnalytics)
      .where(and(
        eq(performanceAnalytics.userId, userId),
        eq(performanceAnalytics.subject, subject)
      ))
      .orderBy(desc(performanceAnalytics.createdAt));
  }

  // Support ticket operations
  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return newTicket;
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket;
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async updateSupportTicketStatus(id: number, status: string): Promise<SupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }
}

export const storage = new DatabaseStorage();
