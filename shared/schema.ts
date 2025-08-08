import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPlan: varchar("current_plan").$type<"emergency" | "basic" | "premium">(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  sessionsRemaining: integer("sessions_remaining").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat sessions table
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  subject: varchar("subject"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id),
  role: varchar("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Uploaded files table
export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => chatSessions.id),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  isProcessed: boolean("is_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance analytics table
export const performanceAnalytics = pgTable("performance_analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => chatSessions.id),
  subject: varchar("subject").notNull(),
  chapter: varchar("chapter"),
  score: decimal("score", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  weakAreas: text("weak_areas").array(),
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  category: varchar("category").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").$type<"open" | "in_progress" | "resolved" | "closed">().default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  chatSessions: many(chatSessions),
  uploadedFiles: many(uploadedFiles),
  performanceAnalytics: many(performanceAnalytics),
  supportTickets: many(supportTickets),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
  uploadedFiles: many(uploadedFiles),
  performanceAnalytics: many(performanceAnalytics),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const uploadedFilesRelations = relations(uploadedFiles, ({ one }) => ({
  user: one(users, {
    fields: [uploadedFiles.userId],
    references: [users.id],
  }),
  session: one(chatSessions, {
    fields: [uploadedFiles.sessionId],
    references: [chatSessions.id],
  }),
}));

export const performanceAnalyticsRelations = relations(performanceAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [performanceAnalytics.userId],
    references: [users.id],
  }),
  session: one(chatSessions, {
    fields: [performanceAnalytics.sessionId],
    references: [chatSessions.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertChatSession = typeof chatSessions.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;
export type UploadedFile = typeof uploadedFiles.$inferSelect;

export type InsertPerformanceAnalytics = typeof performanceAnalytics.$inferInsert;
export type PerformanceAnalytics = typeof performanceAnalytics.$inferSelect;

export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Insert schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceAnalyticsSchema = createInsertSchema(performanceAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Subscription plans
export const subscriptionPlans = {
  emergency: {
    id: "emergency",
    name: "الخطة الطارئة",
    nameEn: "Emergency Plan",
    price: 20,
    duration: 30,
    sessions: 2,
    features: [
      "بحوث مخصصة",
      "تصميم عروض تقديمية",
      "دعم أولوية"
    ],
    isSpecial: true
  },
  basic: {
    id: "basic",
    name: "الخطة الأساسية",
    nameEn: "Basic Plan",
    price: 35,
    duration: 90,
    sessions: 4,
    features: [
      "دردشة GPT-4",
      "تقارير تحليل الضعف"
    ]
  },
  premium: {
    id: "premium",
    name: "الخطة المميزة",
    nameEn: "Premium Plan",
    price: 60,
    duration: 180,
    sessions: 6,
    features: [
      "جميع مميزات الأساسية",
      "تحليلات متقدمة",
      "رفع ملفات غير محدود"
    ]
  }
} as const;

export type SubscriptionPlan = keyof typeof subscriptionPlans;
