# Inventory Management System

## Overview

This is a React-based inventory management application with OCR (Optical Character Recognition) capabilities. The system allows users to capture product images using their device camera, extract product numbers via OCR, and manage inventory items with packaging units and quantities. The application features a modern UI built with shadcn/ui components and uses a PostgreSQL database with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Camera Integration**: Native Web APIs with custom camera management
- **OCR Processing**: Tesseract.js for optical character recognition

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Processing**: JSON and URL-encoded body parsing
- **Development**: Hot reload with Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Fallback Storage**: In-memory storage implementation for development

### Database Schema
```typescript
// Inventory Items
- id: serial (primary key)
- productNumber: text (required)
- packagingUnit: text (required)
- quantity: integer (required)
- expirationDate: text (optional)
- createdAt: timestamp (auto-generated)

// Packaging Units
- id: serial (primary key)
- name: text (required, unique)
- createdAt: timestamp (auto-generated)
```

## Key Components

### Camera System
- **Camera Manager**: Handles device camera access and stream management
- **Camera Capture Component**: Provides camera interface with capture functionality
- **Image Preview Component**: Allows image review and region selection for OCR
- **Error Handling**: Comprehensive camera permission and device compatibility checks

### OCR Integration
- **Tesseract.js Worker**: Background OCR processing with progress tracking
- **Image Preprocessing**: Optimizes images for better OCR accuracy
- **Text Extraction**: Focuses on numeric character recognition for product numbers
- **Results Cleanup**: Post-processes OCR output to extract clean product numbers

### Inventory Management
- **CRUD Operations**: Full create, read, update, delete for inventory items
- **Packaging Units**: Configurable packaging unit types (카톤, 중포, 낱개)
- **Data Validation**: Zod schemas for request/response validation
- **Real-time Updates**: TanStack Query for optimistic updates and cache management

### User Interface
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Dark Theme**: Custom dark color scheme optimized for warehouse environments
- **Component Library**: Consistent UI components from shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **Toast Notifications**: User feedback for actions and errors

## Data Flow

1. **Image Capture**: User captures product image using device camera
2. **OCR Processing**: Image is processed by Tesseract.js to extract product number
3. **Data Entry**: User reviews OCR result and enters additional details (packaging, quantity, expiration)
4. **API Request**: Form data is validated and sent to backend via REST API
5. **Database Storage**: Backend validates and stores data in PostgreSQL
6. **Cache Update**: Frontend updates local cache and displays success feedback
7. **List Management**: Users can view, export, and manage inventory items

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **tesseract.js**: OCR text recognition from images
- **wouter**: Lightweight routing library
- **zod**: Runtime type validation and parsing
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation utilities

### Backend Dependencies
- **express**: Web application framework
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **connect-pg-simple**: PostgreSQL session store (for future sessions)
- **tsx**: TypeScript execution for development

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development features

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR (Hot Module Replacement)
- **Concurrent Processes**: Frontend and backend run simultaneously
- **Database**: Configured for PostgreSQL with environment variable
- **Error Handling**: Runtime error overlays for development debugging

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection

### Configuration Management
- **Environment Detection**: `NODE_ENV` for development/production modes
- **Database URL**: Environment variable for PostgreSQL connection string
- **TypeScript Paths**: Configured aliases for clean import statements
- **Build Scripts**: Separate scripts for development, building, and production

### Replit Integration
- **Development Banner**: Automatic banner for Replit environment detection
- **Cartographer Plugin**: Enhanced development experience on Replit
- **Error Modal Plugin**: Runtime error display for development

The application is designed to be easily deployable on platforms like Replit, Vercel, or traditional Node.js hosting environments, with proper environment variable configuration for the PostgreSQL database connection.