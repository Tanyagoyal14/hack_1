# Learning Adventure Platform

## Overview

This is an adaptive educational platform that creates personalized learning experiences for K-5 students using magical themes and gamification. The application transforms traditional subjects into engaging magical adventures while adapting to students' emotional states, learning styles, and accessibility needs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monolithic Full-Stack Architecture
The application uses a modern full-stack TypeScript architecture with:
- **Frontend**: React + Vite with TypeScript
- **Backend**: Express.js with TypeScript + Replit Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Authentication**: Replit OpenID Connect integration

### Development Environment
- **Node.js** runtime with ESM modules
- **tsx** for TypeScript execution
- **Vite** for development server and build tooling
- **Replit-specific** optimizations and plugins

## Key Components

### 1. Frontend Architecture
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Styling System**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for API state, React hooks for local state
- **Accessibility**: Built-in TTS support, font size adjustment, high contrast mode
- **Responsive Design**: Mobile-first approach with adaptive layouts

### 2. Backend API Structure
- **RESTful APIs** for user management, profiles, progress tracking
- **Express middleware** for logging, error handling, JSON parsing
- **Type-safe** request/response handling with Zod validation
- **Session management** with PostgreSQL session store

### 3. Database Schema Design (PostgreSQL)
- **Users table**: Replit Auth integration with user profiles
- **Sessions table**: PostgreSQL session storage for Replit Auth
- **Student profiles**: Personalization data (mood, learning style, accessibility needs)
- **Subjects**: Magical theme mapping (Math → Potions, Reading → Spells, etc.)
- **Progress tracking**: Per-subject completion and performance metrics
- **Survey responses**: Mood and preference capture
- **Rewards system**: Gamification with badges and achievements

**Database Technology**: PostgreSQL with Drizzle ORM and Neon serverless driver

### 4. Personalization Engine
- **Mood analysis**: Real-time emotional state tracking
- **Learning style adaptation**: Visual, auditory, kinesthetic content delivery
- **Accessibility features**: TTS, font scaling, high contrast themes
- **Content recommendation**: AI-driven personalized learning paths

## Data Flow

### 1. User Onboarding
Survey → Mood Analysis → Learning Style Detection → Profile Creation → Dashboard

### 2. Learning Session
Dashboard → Subject Selection → Adaptive Content → Progress Tracking → Rewards

### 3. Real-time Adaptation
Mood Updates → Content Adjustment → Accessibility Adaptation → Progress Sync

## External Dependencies

### Core Framework Dependencies
- **React 18** with hooks and concurrent features
- **Express.js** for server framework
- **Drizzle ORM** with PostgreSQL dialect
- **TanStack Query** for server state management

### UI and Styling
- **Radix UI** primitives for accessible components
- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- **class-variance-authority** for component variants

### Database and State
- **@neondatabase/serverless** for PostgreSQL operations
- **Drizzle ORM** with PostgreSQL dialect
- **Drizzle Zod** for schema validation

### Accessibility and Enhancement
- **Web Speech API** for text-to-speech
- **date-fns** for date manipulation
- **wouter** for lightweight routing

## Deployment Strategy

### Development Mode
- **Vite dev server** with HMR for frontend
- **tsx** for backend TypeScript execution
- **Concurrent development** with API and frontend serving

### Production Build
- **Vite build** for optimized frontend bundle
- **esbuild** for backend bundling with ESM output
- **Static file serving** through Express
- **Environment-based configuration**

### Database Management
- **Drizzle push** for direct schema deployment
- **Environment variable** configuration for database connection
- **PostgreSQL** with Neon serverless architecture
- **Session storage** in PostgreSQL for authentication

### Replit Optimizations
- **Runtime error overlay** for development
- **Cartographer plugin** for enhanced debugging
- **Banner integration** for development environment detection

## Recent Changes

**Authentication System Implementation (January 2025)**
- ✅ Completed PostgreSQL database migration from SQLite
- ✅ Implemented Replit Auth with OpenID Connect integration
- ✅ Set up session management with PostgreSQL store
- ✅ Created authentication infrastructure (server routes, middleware, client hooks)
- ✅ Built Landing and Home pages with authentication routing
- ✅ Updated database schema to support Replit user model
- ✅ Configured database with default subjects and rewards
- ✅ Implemented DatabaseStorage class replacing in-memory storage
- 🔄 **Current Status**: Waiting for SESSION_SECRET environment variable to complete setup

**Database Setup Complete**
- Users, student profiles, subjects, progress tracking, and rewards tables created
- Default subjects added: Math (Potions), Reading (Spells), Science (Nature Magic), Social Studies (World Adventures)
- Default rewards system configured with XP, badges, and unlockables

The architecture prioritizes accessibility, personalization, and educational engagement while maintaining clean separation of concerns and type safety throughout the stack.