# 4ever Rooted

## Overview

4ever Rooted is a free developer learning platform. The application provides curated free resources and structured learning roadmaps with progress tracking. The platform features a dark/neon aesthetic with interactive UI elements including cursor trails, glow effects, and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with custom neon theme colors (blue #00f3ff, purple #bc13fe, dark background #0a0a0a — standardized across all pages)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions, hover effects, and cursor trail effects
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled via tsx for development, esbuild for production builds
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Authentication**: Clerk (JWT-based via `@clerk/express` middleware)
- **Session Management**: None (stateless JWT verification via Clerk)

### Auth Architecture (Clerk)
- **Frontend**: `@clerk/clerk-react` — `ClerkProvider` wraps the app in `main.tsx`
- **Bridge**: `client/src/lib/ClerkBridge.tsx` reads Clerk hooks and provides user state via React context
- **Context**: `client/src/lib/user-context.tsx` — `UserContext` provides `{ user, isLoading, signOut }` throughout the app
- **Hook**: `client/src/hooks/use-user.ts` — reads from `UserContext` (safe whether Clerk is configured or not)
- **Backend**: `@clerk/express` `clerkMiddleware()` validates JWTs; `getAuth(req).userId` used everywhere
- **Admin**: Set `CLERK_ADMIN_USER_IDS` env var (comma-separated Clerk user IDs). Also supports `publicMetadata.isAdmin = true` set via Clerk dashboard.
- **Required env vars**:
  - `VITE_CLERK_PUBLISHABLE_KEY` (frontend, starts with `pk_test_...`)
  - `CLERK_SECRET_KEY` (backend, starts with `sk_test_...`)
  - `CLERK_ADMIN_USER_IDS` (optional, comma-separated Clerk user IDs for admin access)

### Data Storage
- **Database**: Turso (LibSQL) — cloud SQLite
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Connection**: `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` in `.env`
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**:
  - `resources`: Curated learning resources with categories/tags/votes
  - `resource_votes`: Per-user upvotes on resources (prevents double-voting)
  - `roadmaps` and `roadmap_steps`: Learning paths with ordered steps
  - `user_progress`: Tracks completed roadmap steps per user (keyed by Clerk `userId`)
  - `path_progress`: Tracks completed learning path phases per user (userId + pathId + phaseIndex); created at startup via `runMigrations()`
  - `notifications`: In-app notifications per user (type: approved | rejected)
  - `users` / `sessions`: Legacy tables — no longer actively used after Clerk migration

### API Routes
- `GET/POST /api/resources` — list/submit resources
- `POST /api/resources/:id/vote` — toggle upvote (auth required)
- `GET /api/resources/:id/vote` — check vote status
- `GET /api/admin/resources/pending` — pending submissions (admin)
- `PATCH /api/admin/resources/:id/approve` — approve + notify submitter (admin)
- `DELETE /api/admin/resources/:id` — delete + notify submitter (admin)
- `GET /api/admin/resources/all` — all approved resources (admin)
- `PATCH /api/admin/resources/:id` — edit resource (admin)
- `POST /api/admin/resources/bulk-action` — bulk approve/delete (admin)
- `GET/POST /api/admin/roadmaps` — list/create roadmaps (admin)
- `PATCH/DELETE /api/admin/roadmaps/:id` — edit/delete roadmap (admin)
- `POST /api/admin/roadmaps/:id/steps` — add step (admin)
- `PATCH /api/admin/roadmap-steps/:id` — edit step (admin)
- `DELETE /api/admin/roadmap-steps/:id` — delete step (admin)
- `GET /api/roadmaps` — list all roadmaps
- `GET /api/roadmaps/:id` — roadmap with steps
- `GET/POST /api/progress` — get/toggle user roadmap-step progress (auth)
- `GET /api/path-progress` — get path phase progress for user (returns `{}` for guests)
- `POST /api/path-progress` — toggle a path phase complete/incomplete (auth required)
- `GET /api/notifications` — user notifications (auth)
- `PATCH /api/notifications/:id/read` — mark read (auth)
- `PATCH /api/notifications/read-all` — mark all read (auth)
- `GET /api/profile` — submitted resources + roadmap progress (auth)
- `GET /api/changelog` — recent resources and roadmaps (public)
- `GET /api/search?q=...` — global full-text search (public)
- `GET /api/stats` — resource and roadmap counts (public)
- `GET /api/user/me` — current user info

### Pages
- `/` — Home with hero, stats, featured roadmaps
- `/resources` — Full resource library with sidebar (desktop sticky, mobile drawer)
- `/roadmaps` — All roadmaps grid
- `/roadmaps/:id` — Roadmap detail with step-by-step progress
- `/paths` — Curated learning paths
- `/about` — About page
- `/admin` — Admin panel (Pending, All Resources, Roadmaps tabs)
- `/search` — Global search across resources + roadmaps
- `/profile` — User profile (submitted resources + roadmap progress)
- `/changelog` — Recently added resources and roadmaps
- `/auth` or `/login` — Auth page (Clerk)
- `*` — Polished 404 page

### Features
- **Resources**: Dynamic resource library across 10 categories with subcategories, tags, voting (thumbs up), search, mobile drawer sidebar, 30-per-page pagination on single-category views
- **Roadmaps**: Full roadmaps with step progress tracking, toasts on complete/incomplete; supports 12 icon types (brain, shield, layers, globe, database, terminal, code, cpu, server, cloud, zap, star)
- **Admin Panel**: Review pending submissions, bulk approve/reject, edit resources, create/edit/delete roadmaps with step builder
- **Search**: Global debounced search across resources and roadmaps with live stats from `/api/stats`
- **Notifications**: In-app bell with unread count; notified when submission is approved or rejected
- **Profile**: View submitted resources (with status), roadmap progress bars
- **Changelog**: What's New page showing recently added content
- **Open Graph**: Full OG/Twitter meta tags in index.html; lean Google Fonts (Inter + JetBrains Mono only)
- **Progress toasts**: Toast notification on roadmap step complete/incomplete
- **Per-page document titles**: Every page updates `document.title` for correct browser tab labels
- **About feedback form**: Wired up with toast confirmation + loading state
- **Security**: Rate limiting, Zod validation, CORS, security headers, 50kb body limit; tags validated as string or array union

### Shared Code
- The `shared/` directory contains code used by both frontend and backend
- `shared/schema.ts`: Drizzle database schemas and Zod validation
- `shared/routes.ts`: API route definitions with type-safe contracts

### Build Process
- Development: Vite dev server with HMR, Express backend via tsx
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: `npm run db:push` uses drizzle-kit to sync schema

## Key NPM Packages
- `@clerk/clerk-react` / `@clerk/express`: Authentication
- `@libsql/client` + `drizzle-orm` / `drizzle-kit`: Database ORM and Turso connection
- `framer-motion`: Animations
- `@tanstack/react-query`: Data fetching and caching
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: Utility-first CSS
