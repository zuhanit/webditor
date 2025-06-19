# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Webditor is a StarCraft Remastered usemap editor built as a full-stack web application. It functions as both an editor and game engine for creating and managing StarCraft maps through a modern web interface.

## Development Commands

### Setup and Installation
```bash
# Install root dependencies
pnpm install

# Install frontend dependencies  
cd frontend && pnpm install

# Install backend dependencies (uses uv - ultra-fast Python package manager)
cd backend && uv sync
```

### Development
```bash
# Start both frontend and backend concurrently (recommended)
pnpm run dev

# Start individual services
pnpm run next-dev      # Frontend only (Next.js on port 3000)
pnpm run fastapi-dev   # Backend only (FastAPI on port 8000)
```

### Build and Production
```bash
# Build frontend for production
pnpm run build

# Start production frontend
pnpm run start

# Process StarCraft raw data assets
pnpm run build-rawdata

# Generate TypeScript types from backend schemas
pnpm run schema
```

### Code Quality and Testing
```bash
# Frontend linting
cd frontend && pnpm run lint

# Frontend testing (Vitest with Storybook integration)
cd frontend && pnpm test

# Storybook development
cd frontend && pnpm run storybook

# Backend linting (uses ruff - configured in pyproject.toml)
cd backend && ruff check

# Type checking
cd frontend && tsc --noEmit
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 + React 19 RC, TailwindCSS, Zustand state management
- **Backend**: FastAPI (Python), Firebase (Auth/Database/Storage), custom StarCraft engine
- **Development**: TypeScript, uv (Python), pnpm (Node.js), concurrently

### Directory Structure
```
webditor/
├── frontend/          # Next.js React application
│   ├── app/          # Next.js App Router pages and layouts
│   ├── components/   # React components organized by purpose
│   │   ├── layout/   # Layout components (sidebars, viewport)
│   │   ├── ui/       # Reusable UI components
│   │   └── core/     # Business logic components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities and API clients
│   ├── store/        # Zustand state management stores
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Helper functions
├── backend/          # FastAPI Python backend
│   └── app/
│       ├── api/v1/   # API routes and endpoints
│       ├── core/     # Core utilities (logging, Firebase)
│       ├── models/   # Pydantic data models
│       └── services/ # Business logic and StarCraft processing
├── wengine/          # Custom StarCraft game engine package
├── preprocess/       # StarCraft asset preprocessing tools
└── scripts/          # Build and development scripts
```

### State Management (Frontend)
Uses Zustand with Immer for immutable updates:
- `assetExplorerStore` - Asset browser and file management
- `mapStore` - Map data and editing operations 
- `entityStore` - Game entity management
- `modalStore` - UI modal state management

Each store follows the pattern of using Immer for complex state mutations while maintaining immutability.

### API Architecture (Backend)
- RESTful API organized under `/api/v1/`
- Modular FastAPI routers by domain (maps, users, tilesets)
- Pydantic models for request/response validation
- Firebase integration for authentication and data persistence
- Custom StarCraft file format processing via `wengine` and `eudplib`

### Component Patterns (Frontend)
- Layout components use resizable panels with `re-resizable`
- Drag & drop functionality via `@dnd-kit/core`
- UI components follow shadcn/ui patterns with custom Catppuccin theming
- Complex components separated by layout/ui/core concerns

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration allows `@typescript-eslint/no-explicit-any: "off"` for StarCraft data flexibility
- TailwindCSS for styling with custom color palette
- Python code follows ruff linting with 2-space indentation

### State Management Patterns
```typescript
// Zustand store with Immer example
const useMapStore = create<MapState>()(
  immer((set) => ({
    map: null,
    updateMap: (updater) => set((state) => {
      // Immer allows direct mutation syntax
      updater(state.map);
    }),
  }))
);
```

### API Integration
- Frontend uses Axios for HTTP requests
- Backend uses Firebase Admin SDK for authentication
- Type-safe API calls with generated TypeScript types from Pydantic models

### File Processing
- StarCraft CHK/SCX files processed via custom `wengine` package
- Asset preprocessing generates optimized terrain and sprite data
- Real-time map rendering in the browser viewport

## Testing Strategy

### Frontend Testing
- Vitest configured with browser testing using Playwright
- Storybook integration for component testing
- Setup file: `.storybook/vitest.setup.ts`

### Development Workflow
1. Run `pnpm run dev` to start both services
2. Frontend available at http://localhost:3000
3. Backend API at http://localhost:8000
4. Use Storybook for component development
5. Generate types after backend schema changes with `pnpm run schema`

## Firebase Configuration

The application requires Firebase setup for:
- Authentication (Email, Google, GitHub providers)
- Firestore database for user data and projects
- Storage for map file uploads
- Security rules for data protection

Configure environment variables for Firebase credentials in both frontend and backend.

## StarCraft Integration

### Map File Formats
- Supports CHK (StarCraft map) and SCX (StarCraft expansion map) formats
- Custom parsing via `wengine` package built on `eudplib`
- Real-time conversion between binary formats and JSON for web editing

### Asset Processing
- Terrain tilesets extracted from StarCraft data files
- Unit sprites and animations preprocessed for web display
- Trigger system supports raw trigger data processing

Use `pnpm run build-rawdata` to regenerate processed StarCraft assets when needed.