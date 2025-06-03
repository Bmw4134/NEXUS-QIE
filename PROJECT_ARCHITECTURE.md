# NEXUS Quantum Intelligence Platform - Project Architecture

## Overview
A full-stack TypeScript web application for managing quantum AI knowledge nodes with real-time learning visualization, built on Replit with PostgreSQL database integration.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and bundling
- **Wouter** for client-side routing
- **TanStack Query v5** for data fetching and caching
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Neon Database** (PostgreSQL hosting)
- **WebSocket** for real-time updates
- **Passport.js** for authentication (if needed)
- **Node-cron** for scheduled tasks

### Development Tools
- **TSX** for TypeScript execution
- **Drizzle Kit** for database migrations
- **ESBuild** for fast compilation
- **Tailwind Typography** for content styling

## Project Structure

```
project-root/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   └── dashboard/     # Dashboard-specific components
│   │   ├── pages/             # Route components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configurations
│   │   └── main.tsx           # React app entry point
│   └── index.html             # HTML template
├── server/                     # Backend Express application
│   ├── db.ts                  # Database connection setup
│   ├── storage.ts             # Data access layer (IStorage interface)
│   ├── routes.ts              # API route definitions
│   ├── index.ts               # Express server entry point
│   ├── vite.ts                # Vite development server integration
│   ├── quantum-database.ts    # Quantum AI logic
│   ├── quantum-ml-engine.ts   # Machine learning engine
│   └── autonomous-intelligence.ts # Web scraping and intelligence
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Drizzle database schema and types
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── drizzle.config.ts          # Database configuration
└── tsconfig.json              # TypeScript configuration
```

## Database Schema

### Core Tables
1. **users** - User authentication
2. **quantum_knowledge_nodes** - AI knowledge storage
3. **llm_interactions** - Query/response logging
4. **quantum_learning** - Learning progress tracking
5. **asi_decisions** - AI decision logging

### Key Features
- JSONB columns for flexible data storage
- Real-time timestamps for all operations
- Confidence scoring for AI predictions
- Quantum state tracking for knowledge nodes

## API Architecture

### Storage Interface Pattern
```typescript
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quantum Knowledge Node methods
  getQuantumKnowledgeNode(nodeId: string): Promise<QuantumKnowledgeNode | undefined>;
  getAllQuantumKnowledgeNodes(): Promise<QuantumKnowledgeNode[]>;
  createQuantumKnowledgeNode(node: InsertQuantumKnowledgeNode): Promise<QuantumKnowledgeNode>;
  
  // Dashboard methods
  getDatabaseStats(): Promise<DatabaseStats>;
  getRecentActivity(): Promise<ActivityItem[]>;
  getLearningProgress(): Promise<LearningProgress>;
}
```

### Database vs Memory Storage
- **DatabaseStorage**: PostgreSQL implementation using Drizzle ORM
- **MemStorage**: In-memory implementation for development/testing
- Both implement the same IStorage interface for consistency

## Frontend Architecture

### Component Structure
```
Dashboard/
├── Sidebar - Navigation and menu
├── StatsOverview - Key metrics display
├── KnowledgeGraph - Node visualization
├── QuantumQueryPanel - AI interaction interface
├── PerformanceAnalytics - Charts and metrics
├── LearningProgress - Progress indicators
└── RecentActivity - Activity feed
```

### Data Flow
1. **TanStack Query** manages all API calls and caching
2. **WebSocket** provides real-time updates
3. **React Hook Form** handles form validation with Zod schemas
4. **Wouter** manages client-side routing

### Styling System
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theme management (light/dark mode)
- **Shadcn/ui** for consistent component design
- **Framer Motion** for smooth animations

## Development Workflow

### Getting Started
```bash
npm install                    # Install dependencies
npm run db:push               # Deploy database schema
npm run dev                   # Start development server
```

### Database Operations
```bash
npm run db:push               # Push schema changes to database
npm run db:studio             # Open Drizzle Studio (database GUI)
npm run db:generate           # Generate migration files
```

### Environment Variables
```
DATABASE_URL=postgresql://...  # Neon database connection
PGHOST=...                    # Database host
PGPORT=...                    # Database port
PGUSER=...                    # Database user
PGPASSWORD=...                # Database password
PGDATABASE=...                # Database name
```

## Key Design Patterns

### Type-Safe Database Operations
- Drizzle ORM provides full TypeScript safety
- Zod schemas for runtime validation
- Shared types between frontend and backend

### Real-Time Updates
- WebSocket integration for live data
- Query invalidation for cache management
- Optimistic updates for better UX

### Error Handling
- Centralized error boundaries
- Toast notifications for user feedback
- Graceful fallbacks for failed operations

### Performance Optimizations
- Query caching with TanStack Query
- Lazy loading for dashboard components
- Efficient WebSocket message handling

## Reusable Architecture Benefits

### For Other Dashboard Projects
1. **Modular Component System** - Easy to extract and reuse UI components
2. **Type-Safe API Layer** - IStorage interface pattern for any data source
3. **Real-Time Infrastructure** - WebSocket setup ready for live updates
4. **Authentication Ready** - Passport.js integration prepared
5. **Database Agnostic** - Easy to switch between storage implementations
6. **Modern React Patterns** - Hooks, Query, and Form handling best practices

### Copy-Paste Ready Components
- Complete Shadcn/ui setup with dark mode
- Dashboard layout with responsive sidebar
- Data visualization with Recharts
- Form handling with validation
- WebSocket real-time updates
- Database integration patterns

This architecture provides a solid foundation for any dashboard application requiring real-time data, user authentication, and modern React patterns.