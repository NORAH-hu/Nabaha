import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  generateChatResponse,
  generateAssessmentQuestions,
  analyzePerformance,
  generateSummary,
  analyzePDFContent,
  translateContent,
} from "./openai";
import {
  insertChatSessionSchema,
  insertChatMessageSchema,
  insertSupportTicketSchema,
  subscriptionPlans,
  type SubscriptionPlan,
} from "@shared/schema";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";

// Stripe setup
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// File upload setup
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملفات PDF أو Word فقط.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated without throwing error
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      if (!planId || !subscriptionPlans[planId as SubscriptionPlan]) {
        return res.status(400).json({ message: "خطة اشتراك غير صالحة" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const plan = subscriptionPlans[planId as SubscriptionPlan];
      
      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status === 'active') {
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
        }
      }

      if (!user.email) {
        return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId, '');
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'sar',
            recurring: { interval: 'month' },
            product: plan.name,
            unit_amount: plan.price * 100, // Convert to halalas
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with subscription info
      await storage.updateUserStripeInfo(userId, customerId, subscription.id);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration);
      await storage.updateUserSubscription(userId, planId, expiresAt, plan.sessions);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: "فشل في إنشاء الاشتراك: " + error.message });
    }
  });

  // Chat session routes
  app.post('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.sessionsRemaining || user.sessionsRemaining <= 0) {
        return res.status(403).json({ message: "لا توجد جلسات متبقية. يرجى تجديد الاشتراك." });
      }

      const sessionData = insertChatSessionSchema.parse({
        ...req.body,
        userId,
      });

      const session = await storage.createChatSession(sessionData);
      
      // Decrement sessions remaining
      await storage.updateUserSubscription(
        userId, 
        user.currentPlan!, 
        user.subscriptionExpiresAt!, 
        user.sessionsRemaining - 1
      );

      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "فشل في إنشاء جلسة المحادثة" });
    }
  });

  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "فشل في جلب جلسات المحادثة" });
    }
  });

  app.get('/api/chat/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getChatSession(sessionId);
      
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "جلسة المحادثة غير موجودة" });
      }

      const messages = await storage.getSessionMessages(sessionId);
      res.json({ session, messages });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "فشل في جلب جلسة المحادثة" });
    }
  });

  // Chat message routes
  app.post('/api/chat/sessions/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content, role } = req.body;

      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "جلسة المحادثة غير موجودة" });
      }

      // Create user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        role: 'user',
        content,
      });

      // Generate AI response
      const aiResponse = await generateChatResponse(
        content, 
        "", // TODO: Add context from previous messages
        session.subject || undefined
      );

      // Create AI message
      const aiMessage = await storage.createChatMessage({
        sessionId,
        role: 'assistant',
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "فشل في إرسال الرسالة" });
    }
  });

  // File upload routes
  app.post('/api/files/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const userId = req.user.claims.sub;
      const { sessionId } = req.body;

      const file = await storage.createUploadedFile({
        userId,
        sessionId: sessionId ? parseInt(sessionId) : null,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      // Process PDF content (simplified - in production you'd use a proper PDF parser)
      if (req.file.mimetype === 'application/pdf') {
        try {
          // This is a placeholder - implement proper PDF text extraction
          const fileContent = await fs.readFile(req.file.path, 'utf-8');
          const analysis = await analyzePDFContent(fileContent, req.file.originalname);
          
          await storage.updateFileProcessStatus(file.id, true);
          
          res.json({ 
            file, 
            analysis,
            message: "تم رفع الملف وتحليله بنجاح" 
          });
        } catch (error) {
          console.error("PDF processing error:", error);
          res.json({ 
            file, 
            message: "تم رفع الملف ولكن فشل في تحليله" 
          });
        }
      } else {
        res.json({ file, message: "تم رفع الملف بنجاح" });
      }
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "فشل في رفع الملف" });
    }
  });

  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getUserFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "فشل في جلب الملفات" });
    }
  });

  // Translation route
  app.post('/api/translate', isAuthenticated, async (req: any, res) => {
    try {
      const { content, targetLanguage = 'ar' } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "المحتوى مطلوب للترجمة" });
      }

      const translation = await translateContent(content, targetLanguage);
      res.json({ translation });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "فشل في الترجمة" });
    }
  });

  // Assessment routes
  app.post('/api/assessment/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { subject, chapter, difficulty = 'medium', count = 5 } = req.body;
      
      if (!subject) {
        return res.status(400).json({ message: "الموضوع مطلوب" });
      }

      const questions = await generateAssessmentQuestions(subject, chapter, difficulty, count);
      res.json({ questions });
    } catch (error) {
      console.error("Assessment generation error:", error);
      res.status(500).json({ message: "فشل في توليد الأسئلة التقييمية" });
    }
  });

  app.post('/api/assessment/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, chapter, answers, sessionId } = req.body;
      
      if (!subject || !answers) {
        return res.status(400).json({ message: "الموضوع والإجابات مطلوبة" });
      }

      const analysis = await analyzePerformance(subject, answers, chapter);
      
      // Store performance analytics
      await storage.createPerformanceAnalytics({
        userId,
        sessionId: sessionId ? parseInt(sessionId) : null,
        subject: analysis.subject,
        chapter: analysis.chapter,
        score: analysis.score.toString(),
        totalQuestions: analysis.totalQuestions,
        correctAnswers: analysis.correctAnswers,
        weakAreas: analysis.weakAreas,
        recommendations: analysis.recommendations,
      });

      res.json(analysis);
    } catch (error) {
      console.error("Performance analysis error:", error);
      res.status(500).json({ message: "فشل في تحليل الأداء" });
    }
  });

  // Summary generation route
  app.post('/api/summary/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { content, focusAreas, summaryType = 'general' } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "المحتوى مطلوب لإنشاء الملخص" });
      }

      const summary = await generateSummary({
        content,
        focusAreas,
        summaryType,
      });

      res.json({ summary });
    } catch (error) {
      console.error("Summary generation error:", error);
      res.status(500).json({ message: "فشل في إنشاء الملخص" });
    }
  });

  // Performance analytics routes
  app.get('/api/analytics/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject } = req.query;
      
      let analytics;
      if (subject) {
        analytics = await storage.getSubjectPerformanceAnalytics(userId, subject as string);
      } else {
        analytics = await storage.getUserPerformanceAnalytics(userId);
      }
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      res.status(500).json({ message: "فشل في جلب تحليلات الأداء" });
    }
  });

  // Support ticket routes
  app.post('/api/support/tickets', async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        status: "open", // Ensure status is set to a valid value
      });
      const ticket = await storage.createSupportTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "فشل في إرسال طلب الدعم" });
    }
  });

  app.get('/api/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tickets = await storage.getUserSupportTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "فشل في جلب طلبات الدعم" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
