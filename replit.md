# Educational AI Platform

## Overview

This is a full-stack educational AI platform designed to help Arabic-speaking students with their academic studies. The platform features an intelligent chat interface powered by OpenAI, file upload capabilities, performance tracking, and a subscription-based business model. The application combines modern web technologies with AI to create an interactive learning experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Shadcn/UI component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Architecture**: Modern functional components with custom hooks

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Handling**: Multer for file uploads with size and type validation

### AI Integration
- **Provider**: OpenAI GPT-4o for chat responses and content analysis
- **Features**: Educational chat assistance, content summarization, performance analysis, and Arabic language support
- **Content Processing**: PDF analysis and translation capabilities

## Key Components

### Database Schema
- **Users**: Core user profiles with subscription and authentication data
- **Chat Sessions**: Organized conversation threads by subject/topic
- **Chat Messages**: Individual messages with metadata and timestamps
- **Uploaded Files**: File management with processing status tracking
- **Performance Analytics**: Student progress tracking and weakness analysis
- **Support Tickets**: Customer service and issue tracking
- **Sessions**: Secure session storage for authentication

### Authentication System
- **Replit Auth Integration**: OAuth2/OpenID Connect flow
- **Session Security**: HTTP-only cookies with secure transmission
- **User Management**: Automatic user creation and profile updates
- **Authorization**: Route-level access control

### Subscription Management
- **Stripe Integration**: Payment processing and subscription management
- **Tiered Plans**: Emergency, Basic, and Premium subscription levels
- **Usage Tracking**: Session limits and feature access control
- **Billing**: Automated recurring payments and plan upgrades

### File Processing System
- **Upload Handling**: PDF and Word document support
- **Content Analysis**: AI-powered document summarization and translation
- **Storage**: Server-side file storage with metadata tracking
- **Security**: File type validation and size limits

### AI Assistant Features
- **Educational Chat**: Subject-specific academic assistance in Arabic
- **Performance Analysis**: Weakness identification and learning recommendations
- **Content Generation**: Assessment questions and study materials
- **Multilingual Support**: Arabic-English translation capabilities

## Data Flow

1. **User Authentication**: Replit OAuth → Session Creation → User Profile Setup
2. **Chat Interaction**: User Input → AI Processing → Response Generation → Database Storage
3. **File Upload**: File Selection → Validation → Storage → AI Analysis → Content Extraction
4. **Performance Tracking**: User Activity → Analytics Processing → Progress Calculation → Recommendation Generation
5. **Subscription Flow**: Plan Selection → Stripe Checkout → Payment Processing → Access Level Update

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL (serverless PostgreSQL)
- **AI Services**: OpenAI API for GPT-4o model access
- **Authentication**: Replit Auth service
- **Payments**: Stripe for subscription management
- **File Storage**: Local server storage (could be extended to cloud storage)

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern icon library
- **React Hook Form**: Form management with validation

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast JavaScript bundling for production
- **Zod**: Runtime type validation and schema definition

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with HMR for frontend
- **TypeScript Compilation**: Real-time type checking
- **Database**: Development database with auto-provisioning
- **Environment Variables**: Local configuration for API keys and secrets

### Production Build
- **Frontend**: Vite build with optimized bundles and asset compression
- **Backend**: ESBuild compilation to single Node.js file
- **Database Migrations**: Automated schema updates via Drizzle
- **Environment Configuration**: Production environment variables for all services

### Infrastructure Requirements
- **Node.js Runtime**: ES module support required
- **PostgreSQL Database**: Replit-managed or external database service
- **File System**: Persistent storage for uploaded files
- **External APIs**: OpenAI API access and Stripe webhook endpoints

The architecture emphasizes performance, scalability, and maintainability while providing a rich educational experience for Arabic-speaking students. The modular design allows for easy feature additions and service integrations.