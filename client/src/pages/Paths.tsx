import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Server, Layers, Smartphone, Cloud, Brain,
  Shield, Database, ChevronDown, Clock, BarChart2,
  CheckCircle2, ExternalLink, ArrowRight, BookOpen, Star,
  Lock, CheckSquare, Square, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";

// ── Types ──────────────────────────────────────────────────────────────────
interface Resource { label: string; url: string }
interface Phase {
  phase: number;
  title: string;
  duration: string;
  items: string[];
  resources: Resource[];
}
interface LearningPath {
  id: string;
  title: string;
  tagline: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  glow: string;
  border: string;
  difficulty: "Beginner-friendly" | "Intermediate" | "Advanced";
  duration: string;
  skills: string[];
  phases: Phase[];
}

// ── DB-backed Progress Hook (localStorage fallback for guests) ─────────────
function usePathProgress() {
  const STORAGE_KEY = "4er_path_progress";
  const { user } = useUser();
  const queryClient = useQueryClient();

  // ── localStorage helpers ────────────────────────────────────────────────
  const readLocal = (): Record<string, number[]> => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };
  const saveLocal = (next: Record<string, number[]>) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  // ── Local state for guests ──────────────────────────────────────────────
  const [localProgress, setLocalProgress] = useState<Record<string, number[]>>(readLocal);

  // ── DB state for signed-in users ────────────────────────────────────────
  const { data: dbProgress } = useQuery<Record<string, number[]>>({
    queryKey: ["/api/path-progress"],
    queryFn: async () => {
      const res = await fetch("/api/path-progress", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // Optimistic overlay for instant UI feedback when signed in
  const [optimistic, setOptimistic] = useState<Record<string, number[]> | null>(null);
  const prevDbProgress = useRef<Record<string, number[]> | undefined>(undefined);
  useEffect(() => {
    if (dbProgress !== prevDbProgress.current) {
      prevDbProgress.current = dbProgress;
      setOptimistic(null);
    }
  }, [dbProgress]);

  // Which progress object to use
  const progress: Record<string, number[]> = user
    ? (optimistic ?? dbProgress ?? {})
    : localProgress;

  // ── Derived callbacks ───────────────────────────────────────────────────
  const isPhaseComplete = useCallback(
    (pathId: string, phaseIdx: number) => (progress[pathId] ?? []).includes(phaseIdx),
    [progress]
  );

  const isPhaseUnlocked = useCallback(
    (pathId: string, phaseIdx: number) => {
      if (phaseIdx === 0) return true;
      return (progress[pathId] ?? []).includes(phaseIdx - 1);
    },
    [progress]
  );

  const togglePhase = useCallback((pathId: string, phaseIdx: number) => {
    if (user) {
      // Compute next state (cascade-remove on uncheck)
      const base = optimistic ?? dbProgress ?? {};
      const current = base[pathId] ?? [];
      const isCurrentlyDone = current.includes(phaseIdx);
      const next = isCurrentlyDone
        ? current.filter(i => i < phaseIdx)
        : [...current, phaseIdx];
      const updated = { ...base, [pathId]: next };

      // Apply optimistically
      setOptimistic(updated);

      // Persist to DB — on any phase that changed (cascade may affect several)
      const phasesToSet = isCurrentlyDone
        ? current.filter(i => i >= phaseIdx)   // these were removed
        : [phaseIdx];                            // only this one added

      const ops = phasesToSet.map(pi =>
        fetch("/api/path-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ pathId, phaseIndex: pi, completed: !isCurrentlyDone }),
        })
      );
      Promise.all(ops).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/path-progress"] });
      });
    } else {
      setLocalProgress(prev => {
        const current = prev[pathId] ?? [];
        const next = current.includes(phaseIdx)
          ? current.filter(i => i < phaseIdx)
          : [...current, phaseIdx];
        const updated = { ...prev, [pathId]: next };
        saveLocal(updated);
        return updated;
      });
    }
  }, [user, optimistic, dbProgress, queryClient]);

  const pathStats = useCallback((pathId: string, totalPhases: number) => {
    const completed = (progress[pathId] ?? []).length;
    return { completed, total: totalPhases, pct: totalPhases > 0 ? Math.round(completed / totalPhases * 100) : 0 };
  }, [progress]);

  return { isPhaseComplete, isPhaseUnlocked, togglePhase, pathStats };
}

// ── Path Data ─────────────────────────────────────────────────────────────
const PATHS: LearningPath[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. FRONTEND DEVELOPER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "frontend",
    title: "Frontend Developer",
    tagline: "Build beautiful, performant UIs for the web",
    description:
      "Master HTML, CSS, JavaScript, and modern frameworks like React to build the interfaces that users see and interact with every day. A structured path from zero to job-ready frontend engineer.",
    Icon: Monitor,
    color: "#00f3ff",
    glow: "rgba(0,243,255,0.15)",
    border: "rgba(0,243,255,0.3)",
    difficulty: "Beginner-friendly",
    duration: "6–12 months",
    skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "REST APIs", "Testing"],
    phases: [
      {
        phase: 1,
        title: "Web Foundations",
        duration: "4–6 weeks",
        items: [
          "HTML5 semantic elements — header, nav, main, article, section, aside, footer",
          "HTML forms — all input types, fieldset, label, required/pattern validation",
          "HTML media — responsive images with srcset/sizes, lazy loading, picture element",
          "HTML accessibility — ARIA roles, alt text, tabindex, skip links, screen reader testing",
          "The CSS Box Model — content, padding, border, margin, box-sizing (content-box vs border-box)",
          "CSS Selectors & Specificity — all selector types, specificity scoring, the cascade, !important",
          "CSS Flexbox — flex-direction, justify-content, align-items, flex-grow/shrink/basis, gap",
          "CSS Grid — grid-template-columns/rows, fr units, auto-fill, minmax(), named grid areas",
          "CSS Custom Properties — design tokens with --variables, calc(), env(), cascade inheritance",
          "CSS Transitions & Animations — @keyframes, transition timing functions, will-change",
          "Responsive Design — mobile-first approach, @media breakpoints, clamp(), container queries",
          "CSS Preprocessors — Sass/SCSS variables, nesting, mixins, partials, @use vs @import",
          "Web fonts & Typography — Google Fonts, @font-face, font-display, variable fonts, modular scale",
          "SVG basics — inline SVG, viewBox, path, using Heroicons/Lucide icon libraries",
          "HTTP & HTTPS — methods (GET/POST/PUT/DELETE), status codes, headers, CORS, cookies",
          "Browser DevTools — Elements panel, Console, Network tab, Performance, Lighthouse audits",
          "Git & GitHub — commit, branch, merge, pull requests, rebase, GitHub Flow",
          "Terminal CLI — ls, cd, mkdir, touch, cat, chmod, zsh plugins, SSH key setup",
          "Browser storage — localStorage, sessionStorage, cookies, IndexedDB overview",
          "Domain, DNS & hosting basics — A records, CNAME, how a website goes live",
          "Web performance basics — render-blocking resources, image optimization, lazy loading",
          "Web accessibility — WCAG 2.1 AA guidelines, color contrast ratios, keyboard navigation",
        ],
        resources: [
          { label: "MDN Web Docs (HTML/CSS)", url: "https://developer.mozilla.org/en-US/docs/Learn" },
          { label: "CSS-Tricks — Flexbox & Grid guides", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
          { label: "The Odin Project (free full curriculum)", url: "https://www.theodinproject.com" },
        ],
      },
      {
        phase: 2,
        title: "JavaScript Mastery",
        duration: "6–8 weeks",
        items: [
          "Variables — let/const/var, hoisting, temporal dead zone, block scope vs function scope",
          "Data types — primitives vs objects, type coercion, typeof, instanceof, loose vs strict equality",
          "Functions — declarations, expressions, arrow functions, default params, rest/spread",
          "Closures — lexical scope, scope chain, IIFE, practical closure use cases",
          "Arrays — all array methods: map, filter, reduce, find, some, every, flat, flatMap, at()",
          "Objects — destructuring, shorthand, computed keys, Object.keys/values/entries/fromEntries",
          "Prototypes & Classes — prototype chain, class syntax, inheritance, private fields (#)",
          "The Event Loop — call stack, task queue, microtask queue, requestAnimationFrame",
          "Promises — creating, chaining (.then/.catch/.finally), Promise.all/race/allSettled/any",
          "Async/Await — try/catch error handling, parallel async with Promise.all, async iteration",
          "DOM Manipulation — querySelector, createElement, appendChild, innerHTML vs textContent",
          "Events — addEventListener, event bubbling/capturing, delegation, preventDefault, CustomEvent",
          "Fetch API — making HTTP requests, parsing JSON, error handling, AbortController",
          "ES Modules — import/export (named and default), dynamic import() for code splitting",
          "ES2022+ features — optional chaining (?.), nullish coalescing (??), Array.at(), structuredClone()",
          "Regular expressions — literal patterns, special chars, groups, lookaheads, replace with regex",
          "Error handling — Error types, try/catch/finally, custom Error classes, error boundaries",
          "Web APIs — Intersection Observer, MutationObserver, ResizeObserver, Web Workers intro",
          "Local Storage API — getItem/setItem/removeItem, JSON serialization, storage events",
          "WebSockets — ws:// protocol, real-time bi-directional communication basics",
          "JavaScript performance — debounce, throttle, memoization, avoiding memory leaks",
          "Browser debugging — breakpoints, watch expressions, call stack inspection in DevTools",
        ],
        resources: [
          { label: "javascript.info (best free JS resource)", url: "https://javascript.info" },
          { label: "Eloquent JavaScript (free book)", url: "https://eloquentjavascript.net" },
          { label: "You Don't Know JS (free GitHub series)", url: "https://github.com/getify/You-Dont-Know-JS" },
        ],
      },
      {
        phase: 3,
        title: "React & Modern Ecosystem",
        duration: "6–8 weeks",
        items: [
          "React fundamentals — JSX, components, props, children, conditional rendering, key prop",
          "useState — local state, immutability (never mutate state directly), functional updates",
          "useEffect — dependency array, cleanup functions, avoiding infinite loops, data fetching pattern",
          "useRef — DOM references, mutable values that don't cause re-renders",
          "useContext — React context API, provider/consumer pattern, when to use vs global state",
          "useMemo & useCallback — memoization for performance, when they actually help",
          "useReducer — complex state logic, action-based updates, dispatch pattern",
          "Custom hooks — extracting reusable logic, naming convention (use*), composition",
          "React 18 features — useId, useTransition, useDeferredValue, Suspense for data fetching",
          "Controlled vs uncontrolled forms — controlled inputs, React Hook Form, Zod validation",
          "React Router v6 — createBrowserRouter, nested routes, useParams, useSearchParams, NavLink",
          "TanStack Query — useQuery, useMutation, query invalidation, optimistic updates, stale time",
          "Zustand — global client state, slices pattern, devtools, persist middleware",
          "Component patterns — compound components, render props, HOC, composition vs inheritance",
          "React performance — React.memo, lazy/Suspense for code splitting, virtualization (react-window)",
          "Styling in React — Tailwind CSS utility-first approach, clsx/cn, component variants (CVA)",
          "UI component libraries — shadcn/ui (copy-paste), Radix UI primitives, Headless UI",
          "Error boundaries — class components, react-error-boundary library, error recovery",
          "Storybook — component documentation, stories, args, addon-a11y, MDX stories",
          "Testing React — Vitest + React Testing Library, userEvent, screen queries, MSW for API mocking",
          "Next.js App Router — Server Components, Client Components, Server Actions, layouts, metadata",
          "Next.js deployment — Vercel, image optimization (next/image), font optimization (next/font)",
        ],
        resources: [
          { label: "React Official Docs (react.dev)", url: "https://react.dev" },
          { label: "TanStack Query Docs", url: "https://tanstack.com/query/latest" },
          { label: "Next.js Official Docs", url: "https://nextjs.org/docs" },
        ],
      },
      {
        phase: 4,
        title: "TypeScript & Tooling",
        duration: "4–5 weeks",
        items: [
          "TypeScript basics — primitive types, union (|), intersection (&), type vs interface",
          "TypeScript with React — FC type, event types (ChangeEvent, MouseEvent), children type",
          "Literal types — string literals, const assertions (as const), discriminated unions",
          "Generics — generic functions, generic interfaces, generic components, constraints (extends)",
          "Utility types — Partial, Required, Pick, Omit, Record, Readonly, ReturnType, Parameters",
          "Mapped types — [K in keyof T], conditional types (T extends U ? X : Y), infer keyword",
          "Template literal types — string manipulation at the type level",
          "Declaration files (.d.ts) — augmenting existing modules, ambient declarations",
          "Strict mode — noImplicitAny, strictNullChecks, strictFunctionTypes, exactOptionalPropertyTypes",
          "TypeScript project setup — tsconfig.json path aliases (@/*), target, lib, moduleResolution",
          "Vite build tool — dev server, HMR, build optimization, rollup plugins, env variables",
          "ESLint — airbnb/typescript-eslint config, custom rules, eslint.config.js (flat config)",
          "Prettier — formatOnSave, .prettierrc, integrating with ESLint via eslint-plugin-prettier",
          "Husky & lint-staged — pre-commit hooks, running lint+format+typecheck before commit",
          "Conventional Commits — commit message format (feat/fix/chore/docs), commitlint",
          "Bundle analysis — rollup-plugin-visualizer, identifying and eliminating large dependencies",
          "Path aliases — @ imports, configuring in tsconfig + vite config, avoiding relative hell",
          "Vitest — unit testing framework, test/describe/expect API, coverage reporting",
          "Playwright — E2E tests, Page Object Model, auto-waiting, screenshot testing, CI integration",
          "Turborepo — monorepo tool, build caching, pipeline configuration for multi-package repos",
          "pnpm workspaces — workspace: protocol, shared configs, dependency deduplication",
          "GitHub Actions CI — lint → typecheck → test → build pipeline, caching node_modules",
        ],
        resources: [
          { label: "TypeScript Handbook (official)", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
          { label: "Total TypeScript — Matt Pocock (free)", url: "https://www.totaltypescript.com" },
          { label: "TypeScript Exercises (interactive)", url: "https://typescript-exercises.github.io" },
        ],
      },
      {
        phase: 5,
        title: "Advanced Patterns & Performance",
        duration: "4–5 weeks",
        items: [
          "Core Web Vitals — LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), INP (Interaction to Next Paint)",
          "Image optimization — WebP/AVIF formats, responsive images, lazy loading, blurhash placeholders",
          "Code splitting — React.lazy, dynamic import(), route-based splitting, component-level splitting",
          "Rendering strategies — CSR, SSR, SSG, ISR — when to use each in Next.js",
          "Service Workers & PWA — offline support, Background Sync, Web App Manifest, install prompt",
          "Web Components — custom elements, shadow DOM, HTML templates (light DOM vs shadow DOM)",
          "Canvas API — 2D drawing context, animations, particle systems, chart libraries (Chart.js)",
          "WebGL intro — Three.js for 3D in the browser, react-three-fiber for React integration",
          "Internationalization (i18n) — react-i18next, ICU message format, locale-aware number/date formatting",
          "React Native Intro — sharing business logic between web and mobile, Expo Router",
          "Micro-frontends — Module Federation with Webpack/Vite, independent deployment strategies",
          "GraphQL with Apollo Client — useQuery, useMutation, cache management, code generation",
          "Real-time UI — WebSocket with native API, Server-Sent Events (SSE), React Query refetchInterval",
          "Design Systems in code — design tokens, Storybook documentation, component API design",
          "Security in frontend — XSS prevention (sanitize-html, DOMPurify), CSP headers, CSRF tokens",
          "A11y testing — axe-core, Lighthouse a11y audit, keyboard navigation testing, VoiceOver/NVDA",
          "Real User Monitoring (RUM) — web-vitals library, Sentry Performance, Datadog RUM",
          "Feature flags — LaunchDarkly, Unleash, or simple localStorage flags for gradual rollouts",
          "Micro-animations & Motion — Framer Motion, GSAP, CSS View Transitions API",
          "Docker for frontend — Dockerizing React+Nginx, multi-stage builds, environment injection",
          "Open source contribution — finding good first issues, submitting PRs, code review etiquette",
          "Frontend system design — URL shortener frontend, infinite scroll, autocomplete, drag-and-drop",
        ],
        resources: [
          { label: "web.dev — Performance", url: "https://web.dev/performance/" },
          { label: "Framer Motion Docs", url: "https://www.framer.com/motion/" },
          { label: "Patterns.dev — JS & React Patterns", url: "https://www.patterns.dev" },
        ],
      },
      {
        phase: 6,
        title: "Career & Projects",
        duration: "Ongoing",
        items: [
          "Build a portfolio site — custom domain, responsive, fast, showcases 3–5 real projects",
          "Portfolio projects — a SaaS MVP, a full-stack app, an open-source contribution",
          "GitHub profile — pinned repos, README profile, green contribution graph, OSS activity",
          "Technical writing — blog posts, dev.to articles, tweet threads explaining concepts",
          "Frontend interview prep — LeetCode easy/medium (arrays, strings, trees), system design",
          "Frontend system design interviews — News feed, Instagram stories, autocomplete, upload widget",
          "Behavioral interview — STAR format, handling conflict, project impact stories",
          "Job applications — ATS-optimized resume, tailored cover letters, cold outreach on LinkedIn",
          "Salary negotiation — research Levels.fyi, competing offers, never be the first to name a number",
          "Freelancing — Upwork, Toptal, direct client outreach, fixed-price vs hourly trade-offs",
          "Following the ecosystem — @dan_abramov, @nicknisi, @swyx, React Summit, JSWorld conferences",
          "Mentorship — pair programming, code review feedback, answering Stack Overflow, teaching",
        ],
        resources: [
          { label: "Frontend Interview Handbook", url: "https://www.frontendinterviewhandbook.com" },
          { label: "Levels.fyi — Salary Research", url: "https://www.levels.fyi" },
          { label: "The Primeagen (YouTube — fundamentals)", url: "https://www.youtube.com/@ThePrimeagen" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. BACKEND DEVELOPER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "backend",
    title: "Backend Developer",
    tagline: "Power apps with robust APIs, databases, and server logic",
    description:
      "Build the server-side systems that make applications work — REST and GraphQL APIs, databases, authentication, caching, and the infrastructure that keeps services reliable at scale.",
    Icon: Server,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    border: "rgba(168,85,247,0.3)",
    difficulty: "Intermediate",
    duration: "8–14 months",
    skills: ["Node.js", "PostgreSQL", "Redis", "REST", "GraphQL", "Docker", "Auth", "Testing", "SQL", "Caching"],
    phases: [
      {
        phase: 1,
        title: "Programming Foundation",
        duration: "4–6 weeks",
        items: [
          "Node.js core — event loop, libuv, single-threaded model, child processes, cluster module",
          "ES Modules vs CommonJS — import/export vs require(), interop, package.json type field",
          "Node.js built-ins — fs, path, os, crypto, url, stream (readable, writable, transform, duplex)",
          "npm/pnpm ecosystem — package.json, semver versioning, peer dependencies, lock files",
          "Async patterns — callbacks → Promises → async/await, EventEmitter, async iteration",
          "TypeScript for Node.js — types for request/response, strict mode, ts-node-dev, tsx",
          "HTTP from scratch — http.createServer, handling request body, streaming responses",
          "Environment configuration — dotenv, process.env, config validation with Zod",
          "Error handling — error-first callbacks, unhandledRejection, uncaughtException, proper propagation",
          "Express.js — routing, middleware, router.use(), express.json(), error middleware (4-args)",
          "Express patterns — controllers, services, repositories, dependency injection",
          "Input validation — Zod schemas, sanitizing user input, whitelist vs blacklist approach",
          "Logging — structured logging with pino or winston, log levels, correlation IDs",
          "Rate limiting — express-rate-limit, redis-based distributed rate limiting",
          "Compression & security — helmet.js, cors, compression middleware, HTTPS redirect",
          "API versioning — URL prefix (/api/v1), header-based versioning, deprecation strategies",
          "REST design — resource naming, idempotency, pagination (cursor vs offset), HATEOAS",
          "OpenAPI / Swagger — documenting APIs with Zod-to-OpenAPI or swagger-jsdoc, Swagger UI",
          "HTTP clients — axios, got, native fetch in Node 18+, retry logic, timeout handling",
          "Process management — PM2 for production (cluster mode, logs, health monitoring)",
          "Monorepo tools — pnpm workspaces, Turborepo for caching build artifacts",
          "Git workflow for backend — trunk-based development, feature branches, conventional commits",
        ],
        resources: [
          { label: "Node.js Official Docs", url: "https://nodejs.org/docs/latest/api/" },
          { label: "Node.js Best Practices (GitHub)", url: "https://github.com/goldbergyoni/nodebestpractices" },
          { label: "Express.js Guide", url: "https://expressjs.com/en/guide/routing.html" },
        ],
      },
      {
        phase: 2,
        title: "Databases & SQL",
        duration: "5–6 weeks",
        items: [
          "SQL fundamentals — SELECT, WHERE, ORDER BY, GROUP BY, HAVING, LIMIT, OFFSET",
          "All JOIN types — INNER, LEFT, RIGHT, FULL OUTER, SELF, CROSS, and when to use each",
          "Aggregates — COUNT, SUM, AVG, MIN, MAX, COUNT(DISTINCT), FILTER clause",
          "Subqueries & CTEs — correlated subqueries, WITH clause, recursive CTEs for hierarchies",
          "Window functions — ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, PARTITION BY, OVER",
          "PostgreSQL features — JSONB columns, array types, full-text search, extensions (uuid-ossp, pgcrypto)",
          "EXPLAIN ANALYZE — reading query plans, seq scan vs index scan, nested loop vs hash join",
          "Indexes — B-tree (default), partial indexes, composite indexes, covering indexes, index-only scans",
          "Database normalization — 1NF, 2NF, 3NF, BCNF — eliminating data redundancy",
          "ACID properties — Atomicity, Consistency, Isolation, Durability — what they mean in practice",
          "Transaction isolation levels — Read Uncommitted, Read Committed, Repeatable Read, Serializable",
          "Schema migrations — managing schema evolution with Drizzle ORM migrate or Flyway",
          "ORMs — Drizzle ORM (type-safe, lightweight), Prisma (schema-first), TypeORM comparison",
          "Connection pooling — PgBouncer, HikariCP, Drizzle pool config, max connections",
          "Database seeding — populating test data, faker.js, deterministic seeds for reproducibility",
          "NoSQL overview — MongoDB documents, DynamoDB key-value, Cassandra wide-column, use cases",
          "Redis data structures — strings, lists, sets, sorted sets, hashes, streams",
          "Redis patterns — cache-aside, session store, pub/sub, distributed locks (Redlock), rate limiting",
          "Full-text search — PostgreSQL tsvector/tsquery vs Elasticsearch/Meilisearch trade-offs",
          "Database security — SQL injection prevention, parameterized queries, least-privilege DB user",
          "Backup strategies — pg_dump, continuous archiving (WAL shipping), point-in-time recovery",
          "Scaling databases — read replicas, vertical vs horizontal scaling, database sharding intro",
        ],
        resources: [
          { label: "SQLBolt — Interactive SQL", url: "https://sqlbolt.com" },
          { label: "Use The Index, Luke! (free book)", url: "https://use-the-index-luke.com" },
          { label: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com" },
        ],
      },
      {
        phase: 3,
        title: "APIs & Authentication",
        duration: "4–5 weeks",
        items: [
          "RESTful API design — HTTP verbs semantics, status codes (201 vs 200, 422 vs 400), PATCH vs PUT",
          "RFC 7807 Problem Details — standardized error response format for APIs",
          "GraphQL basics — schema SDL, queries, mutations, subscriptions, resolver pattern",
          "Apollo Server — typeDefs, resolvers, context, DataLoader for N+1 problem, formatError",
          "gRPC intro — Protocol Buffers, service definition, streaming, when to use over REST",
          "Authentication overview — sessions vs JWT vs API keys, OAuth 2.0 flows, OIDC",
          "JWT deep dive — header.payload.signature, signing algorithms (HS256 vs RS256), expiry, refresh tokens",
          "Password security — PBKDF2, bcrypt, argon2id, salting, pepper, timing-safe comparison",
          "OAuth 2.0 — authorization code flow with PKCE, client credentials, refresh token rotation",
          "Clerk, Auth0, Supabase Auth — when to use managed auth vs rolling your own",
          "Role-based access control (RBAC) — users, roles, permissions, resource-based authorization",
          "API keys — generation (crypto.randomBytes), hashing for storage, rate limiting per key",
          "CORS configuration — Access-Control-Allow-Origin, credentials, preflight OPTIONS requests",
          "CSRF protection — SameSite=Strict/Lax cookies, CSRF tokens, double-submit cookie pattern",
          "Webhooks — receiving, validating signatures (Stripe webhook pattern), idempotency keys",
          "File uploads — multipart/form-data, Multer middleware, S3 direct upload with presigned URLs",
          "Streaming responses — Server-Sent Events for AI streaming, chunked transfer encoding",
          "API testing — REST Client (VS Code), httpie, Postman collections, automated API tests with Supertest",
          "Contract testing — Pact.io for consumer-driven contract tests between services",
          "Idempotency — idempotency keys for payment APIs, PUT vs POST semantics, retry safety",
          "API security — OWASP API Security Top 10, mass assignment prevention, object-level auth",
          "API rate limiting strategies — token bucket, leaky bucket, sliding window with Redis",
        ],
        resources: [
          { label: "Swagger (OpenAPI) Docs", url: "https://swagger.io/docs/" },
          { label: "jwt.io — JWT Debugger", url: "https://jwt.io" },
          { label: "OWASP API Security Top 10", url: "https://owasp.org/www-project-api-security/" },
        ],
      },
      {
        phase: 4,
        title: "Infrastructure & DevOps",
        duration: "4–5 weeks",
        items: [
          "Docker fundamentals — Dockerfile, layers, multi-stage builds, .dockerignore",
          "Docker Compose — services, volumes, networks, depends_on with healthcheck, profiles",
          "Linux essentials — process management, systemd, cron, file permissions, SSH, curl/wget",
          "Nginx as reverse proxy — location blocks, proxy_pass, upstream, SSL termination, gzip",
          "Environment management — separate dev/staging/prod configs, 12-Factor App principles",
          "Health check endpoints — /health (liveness), /ready (readiness), Kubernetes-compatible responses",
          "CI/CD with GitHub Actions — lint → test → build → push Docker image → deploy workflow",
          "Container registries — Docker Hub, GitHub Container Registry (GHCR), AWS ECR",
          "Deploy to Railway, Render, or Fly.io — zero-config deployment, preview environments",
          "AWS essentials — EC2, S3, RDS, IAM roles, VPC, Security Groups, Route53",
          "S3 for file storage — bucket policies, presigned URLs, CloudFront CDN distribution",
          "Managed databases — Neon (serverless Postgres), Supabase, PlanetScale, Turso (SQLite/libSQL)",
          "Secrets management — environment variables, HashiCorp Vault, AWS Secrets Manager",
          "Infrastructure as Code — Terraform basics: providers, resources, variables, state backend",
          "Observability — structured logs (pino → Loki), metrics (Prometheus), traces (OpenTelemetry)",
          "Error monitoring — Sentry SDK, source maps for stack traces, alerting on error spikes",
          "Uptime monitoring — Better Uptime, UptimeRobot, status pages",
          "Database backups — automated pg_dump to S3, testing restores, point-in-time recovery",
          "Zero-downtime deployments — rolling deployments, blue-green, canary release strategy",
          "Load testing — k6 for HTTP load tests, Autocannon for Node.js throughput testing",
          "Cost optimization — right-sizing instances, spot instances, reserved capacity planning",
          "Security hardening — non-root containers, read-only filesystems, network policies",
        ],
        resources: [
          { label: "Docker Official Get Started", url: "https://docs.docker.com/get-started/" },
          { label: "Railway.app Docs", url: "https://docs.railway.app" },
          { label: "AWS Free Tier", url: "https://aws.amazon.com/free/" },
        ],
      },
      {
        phase: 5,
        title: "Scale & Architecture",
        duration: "5–6 weeks",
        items: [
          "Caching architecture — L1 in-process (LRU-cache), L2 Redis, L3 CDN — choosing layers",
          "Cache invalidation — TTL-based, event-driven (cache tags), CQRS write-through",
          "Message queues — BullMQ (Redis-backed) for job queues, Kafka for event streaming, RabbitMQ",
          "Background jobs — scheduled tasks, retries with backoff, dead-letter queues, job monitoring",
          "Microservices vs monolith — bounded contexts, team topology, strangler fig migration pattern",
          "gRPC & Protocol Buffers — typed service contracts, streaming, code generation",
          "Event-driven architecture — domain events, outbox pattern for reliable publishing",
          "CQRS — separate read/write models, projections, eventual consistency trade-offs",
          "Event sourcing — event log as source of truth, replaying events, snapshotting",
          "Saga pattern — distributed transactions, choreography vs orchestration sagas",
          "API Gateway — Kong, AWS API Gateway, rate limiting, auth at the edge, request routing",
          "Service discovery — Consul, Kubernetes DNS, client-side vs server-side load balancing",
          "Distributed tracing — OpenTelemetry SDK, trace context propagation, Jaeger/Tempo",
          "Circuit breaker — Resilience4j, Polly, Cockatiel for preventing cascade failures",
          "Database sharding — horizontal partitioning strategies, consistent hashing, shard keys",
          "Read replicas & CQRS — offloading analytical queries, replication lag considerations",
          "Serverless architecture — AWS Lambda, Cloudflare Workers, edge computing trade-offs",
          "Multi-tenancy patterns — database per tenant, schema per tenant, row-level tenant isolation",
          "Backend for Frontend (BFF) — per-client API orchestration layer",
          "WebSockets at scale — Socket.io with Redis adapter, sticky sessions, pubsub scaling",
          "System design practice — design a URL shortener, Twitter feed, distributed cache, Dropbox",
          "Technical leadership — RFC process, ADRs, architecture reviews, mentoring junior devs",
        ],
        resources: [
          { label: "Designing Data-Intensive Applications (Kleppmann)", url: "https://dataintensive.net" },
          { label: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
          { label: "BullMQ Documentation", url: "https://docs.bullmq.io" },
        ],
      },
      {
        phase: 6,
        title: "Career & Open Source",
        duration: "Ongoing",
        items: [
          "Build a portfolio API project — public GitHub repo, README, OpenAPI docs, live demo",
          "Contribute to OSS — express, fastify, drizzle, or any library you use daily",
          "Technical blog — writing about architecture decisions, lessons learned, problem solving",
          "Backend interview prep — LeetCode arrays/trees/graphs, SQL window functions practice",
          "System design interviews — 45-min design sessions: YouTube, WhatsApp, rate limiter, notification system",
          "Salary research — Levels.fyi, Glassdoor, Twitter/X #devjobs, negotiation tactics",
          "ATS-optimized resume — measurable impact (reduced latency 40%, scaled to 1M users)",
          "Following thought leaders — @kelseyhightower, @mjackson, @thdxr, ThePrimeagen",
          "Backend communities — r/node, Hacker News, #backend-engineering on Discord servers",
        ],
        resources: [
          { label: "Backend Interview Handbook", url: "https://www.techinterviewhandbook.org" },
          { label: "Levels.fyi", url: "https://www.levels.fyi" },
          { label: "Hacker News — Who is Hiring (monthly)", url: "https://news.ycombinator.com" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. FULL-STACK DEVELOPER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "fullstack",
    title: "Full-Stack Developer",
    tagline: "Build complete web products from database to UI",
    description:
      "Combine frontend and backend skills to ship complete web applications solo or as a generalist team member. Master the entire delivery pipeline from schema design to CI/CD.",
    Icon: Layers,
    color: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.3)",
    difficulty: "Intermediate",
    duration: "10–16 months",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "REST APIs", "Auth", "CI/CD", "Cloud"],
    phases: [
      {
        phase: 1,
        title: "Foundations — HTML, CSS & JS",
        duration: "5–7 weeks",
        items: [
          "HTML5 semantic markup — forms, media, tables, accessibility attributes",
          "CSS Box Model, Flexbox, Grid — the three layout systems every dev must master",
          "Responsive design — mobile-first, media queries, clamp(), container queries",
          "CSS custom properties & animations — design tokens, transitions, @keyframes",
          "JavaScript fundamentals — variables, functions, arrays, objects, control flow",
          "Closures, scope, and the prototype chain — how JS really works",
          "Async JavaScript — Promises, async/await, the Event Loop, fetch API",
          "ES6+ features — destructuring, spread, optional chaining, nullish coalescing",
          "TypeScript basics — static typing, interfaces, type inference, generics",
          "Git & GitHub — commit hygiene, branching strategy, pull requests, code review",
          "Terminal & shell scripting — navigation, file manipulation, shell variables",
          "Package managers — npm vs pnpm vs yarn, lock files, workspace setup",
          "HTTP protocol — methods, status codes, headers, CORS, cookies, sessions",
          "Browser DevTools — debugging JS, inspecting network, profiling performance",
          "Web accessibility — semantic HTML, ARIA, keyboard navigation, screen readers",
          "Regular expressions — search/replace, form validation, string parsing",
          "Domain & DNS basics — how a URL resolves to a server IP",
          "Command-line tools — curl, jq, httpie, vim basics for server work",
          "Markdown — README files, documentation, GitHub wiki, project docs",
          "Problem solving — breaking down problems, pseudocode, rubber duck debugging",
        ],
        resources: [
          { label: "The Odin Project (free full-stack curriculum)", url: "https://www.theodinproject.com" },
          { label: "javascript.info", url: "https://javascript.info" },
          { label: "MDN Web Docs", url: "https://developer.mozilla.org" },
        ],
      },
      {
        phase: 2,
        title: "React Frontend & TypeScript",
        duration: "5–7 weeks",
        items: [
          "React functional components — JSX, props, children, conditional rendering",
          "State management — useState, useReducer, lifting state, state colocation",
          "Side effects — useEffect, cleanup, dependency array, async in effects",
          "React Router v6 — nested routes, params, search params, protected routes",
          "TanStack Query — data fetching, caching, background sync, mutations, optimistic UI",
          "Zustand — global state, actions, devtools, slices, selector optimization",
          "React Hook Form — register, watch, setValue, errors, Zod integration",
          "Tailwind CSS — utility-first classes, responsive prefixes, dark mode, variants",
          "shadcn/ui — copy-paste components, theming, Radix UI primitives",
          "Framer Motion — layout animations, AnimatePresence, viewport triggers",
          "TypeScript with React — component props typing, event types, generic components",
          "Code splitting — React.lazy, Suspense, route-based chunk splitting",
          "Environment variables — Vite env handling, .env files, public vs private vars",
          "API layer — typed API client with Zod validation, error handling wrapper",
          "Authentication UI — login/register forms, JWT storage, protected route HOC",
          "File uploads UI — drag-and-drop, progress indicator, preview, cancellation",
          "Infinite scroll & pagination — TanStack Query useInfiniteQuery",
          "Dark mode — CSS custom properties strategy, next-themes, system preference detection",
          "Accessibility audit — axe DevTools, Lighthouse a11y, keyboard tab testing",
          "i18n basics — react-i18next, language switcher, plural forms, date/number formatting",
        ],
        resources: [
          { label: "React Official Docs", url: "https://react.dev" },
          { label: "TanStack Query Docs", url: "https://tanstack.com/query/latest" },
          { label: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs" },
        ],
      },
      {
        phase: 3,
        title: "Node.js Backend & Databases",
        duration: "6–7 weeks",
        items: [
          "Node.js + Express — REST API setup, routing, middleware pipeline, error handling",
          "Input validation — Zod on server-side, request body/params/query validation",
          "PostgreSQL with Drizzle ORM — schema definition, queries, relations, migrations",
          "SQL fundamentals — SELECT, JOINs, aggregates, CTEs, window functions",
          "Database design — normalization, foreign keys, indexes, constraints",
          "Redis for caching — cache-aside pattern, TTL, session storage, rate limiting",
          "Authentication — JWT access/refresh tokens, bcrypt password hashing, middleware guards",
          "OAuth 2.0 integration — Google/GitHub sign-in with Clerk or Auth0",
          "RBAC — role field on users table, permission checks in middleware",
          "File uploads — Multer middleware, S3 presigned URLs, serving files securely",
          "Email sending — Resend or Nodemailer, transactional emails, email templates",
          "Background jobs — BullMQ (Redis), job definitions, retries, dead-letter queue",
          "WebSockets — Socket.io for real-time features (chat, notifications, live updates)",
          "API versioning & documentation — OpenAPI with Zod-to-OpenAPI, Swagger UI",
          "Database migrations — Drizzle migrate, migration history, rollback strategy",
          "Seeding & test data — faker.js, deterministic seeds, separate test DB",
          "Logging & monitoring — pino structured logs, request ID correlation",
          "Rate limiting — express-rate-limit with Redis store for distributed APIs",
          "Health checks — /health endpoint with DB ping, /metrics for Prometheus",
          "Error classification — operational vs programmer errors, proper HTTP status codes",
        ],
        resources: [
          { label: "Drizzle ORM Docs", url: "https://orm.drizzle.team" },
          { label: "Express.js Guide", url: "https://expressjs.com/en/guide/routing.html" },
          { label: "BullMQ Docs", url: "https://docs.bullmq.io" },
        ],
      },
      {
        phase: 4,
        title: "Auth, Testing & Quality",
        duration: "3–4 weeks",
        items: [
          "Auth architecture — session cookies vs JWTs vs opaque tokens — when to use what",
          "Token security — short-lived access tokens (15min), refresh tokens in httpOnly cookies",
          "Refresh token rotation — silent refresh, revocation on logout, token families",
          "Clerk integration — webhook sync, organization features, RBAC with custom claims",
          "OAuth scopes — reading/writing user data, incremental authorization",
          "Unit testing — Vitest, describe/it/expect, mocking modules (vi.mock)",
          "Integration testing — Supertest for API routes, real DB with test transactions",
          "Component testing — React Testing Library, userEvent, screen queries",
          "E2E testing — Playwright, page object model, CI integration, visual regression",
          "Test coverage — v8 coverage (Vitest), coverage thresholds in CI",
          "Testcontainers — real PostgreSQL and Redis in integration tests",
          "Test data factories — factory-boy pattern, Zod-based fake generators",
          "Contract testing — API contract verification between frontend and backend",
          "Code review — reviewing for correctness, performance, security, readability",
          "Pair programming — driver/navigator, knowledge sharing, mob programming",
          "Type safety across the stack — tRPC or Zod inference from API to React",
          "tRPC — type-safe API without code gen, procedure definitions, batching",
          "OpenAPI code gen — generating typed TS client from OpenAPI spec (orval/hey-api)",
          "Error monitoring — Sentry with source maps, user context, breadcrumbs",
          "Pre-commit hooks — Husky + lint-staged for automated quality gates",
        ],
        resources: [
          { label: "Vitest Documentation", url: "https://vitest.dev" },
          { label: "Playwright Documentation", url: "https://playwright.dev" },
          { label: "tRPC Documentation", url: "https://trpc.io" },
        ],
      },
      {
        phase: 5,
        title: "Deployment, DevOps & Launch",
        duration: "3–4 weeks",
        items: [
          "Docker — Dockerfile, multi-stage builds, Docker Compose for local dev stack",
          "Deploy frontend — Vercel or Netlify with preview deployments and branch deploys",
          "Deploy backend — Railway, Fly.io, or Render with health checks and zero-downtime",
          "Managed databases — Neon, Supabase, or PlanetScale for hosted PostgreSQL",
          "Managed Redis — Upstash (serverless, HTTP Redis API), Redis Cloud",
          "Environment secrets — GitHub Secrets, Doppler, or runtime injection patterns",
          "CI/CD pipelines — GitHub Actions: lint → typecheck → test → build → deploy",
          "Database migrations in production — zero-downtime strategies (backward-compatible changes)",
          "Custom domains — DNS configuration, HTTPS with Let's Encrypt / Caddy",
          "Error monitoring — Sentry for production error tracking and alerts, release tracking",
          "Analytics — PostHog or Plausible for privacy-friendly usage insights, funnels",
          "Feature flags — gradual rollouts with Unleash or self-hosted flags in DB",
          "Logging & observability — structured logs, request tracing, Grafana dashboards",
          "Backup strategy — automated database backups, testing restores quarterly",
          "Performance monitoring — core web vitals, API p95 latency, alert on regression",
          "Uptime monitoring — BetterUptime, status page for users",
          "Content delivery — CloudFront or Cloudflare CDN for static assets",
          "Cost optimization — right-sizing, spot instances, billing alerts",
          "Launch checklist — security headers, SEO meta tags, OG images, robots.txt",
          "Build 2–3 complete shipped projects with real users and a custom domain",
        ],
        resources: [
          { label: "Railway.app Docs", url: "https://docs.railway.app" },
          { label: "Supabase Docs", url: "https://supabase.com/docs" },
          { label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. DEVOPS / CLOUD ENGINEER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "devops",
    title: "DevOps / Cloud Engineer",
    tagline: "Automate, scale, and ship infrastructure as code",
    description:
      "Learn to build CI/CD pipelines, manage cloud infrastructure, containerize applications, and keep production systems reliable at scale. The path from developer to platform engineer.",
    Icon: Cloud,
    color: "#f97316",
    glow: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.3)",
    difficulty: "Intermediate",
    duration: "9–15 months",
    skills: ["Linux", "Docker", "Kubernetes", "Terraform", "AWS/GCP", "CI/CD", "Monitoring", "Ansible", "Networking"],
    phases: [
      {
        phase: 1,
        title: "Linux & Networking",
        duration: "4–5 weeks",
        items: [
          "Linux filesystem hierarchy — /etc (config), /var (variable data), /usr (user programs), /proc, /sys",
          "User management — useradd, usermod, groups, sudo configuration, /etc/sudoers, passwd",
          "File permissions — chmod (octal + symbolic), chown, chgrp, umask, SUID, SGID, sticky bit",
          "Shell scripting — bash variables, conditionals, loops (for/while/until), functions, arrays, trap signals",
          "Process management — ps, top, htop, kill (-9/-15), nice/renice, systemd (start/stop/enable/status)",
          "systemd unit files — [Unit], [Service], [Install] sections, user vs system services, journalctl logs",
          "Networking fundamentals — OSI 7 layers, TCP/IP stack, IP addressing, CIDR /24 /16 /8 notation",
          "Subnetting — calculating network/broadcast addresses, usable hosts, VLSM practice",
          "DNS — record types (A, AAAA, CNAME, MX, TXT, SOA, NS), resolution chain, TTL, DNS caching",
          "SSH mastery — key-based auth, ~/.ssh/config, ProxyJump, tunneling (local/remote), SSH agent forwarding",
          "Firewall — ufw (simple), iptables (chains: INPUT/OUTPUT/FORWARD), nftables, security groups in cloud",
          "Network debugging — curl with -v, dig +trace, nslookup, netstat, ss, tcpdump, ping, traceroute",
          "Package managers — apt (Debian/Ubuntu), yum/dnf (RHEL/Fedora), snap, compiling from source",
          "File operations at scale — find, grep -r, sed, awk, xargs, sort, uniq — text processing pipelines",
          "Cron & scheduled tasks — crontab syntax, /etc/cron.d/, at command, anacron for servers",
          "Performance tools — iostat, vmstat, free, iotop, lsof, strace for debugging system calls",
          "Log management — journalctl, logrotate, /var/log/, tail -f, grep patterns in logs",
          "Security hardening — fail2ban, SSH port change, sshd_config hardening, auditd",
          "File transfer — scp, rsync (--delete, --checksum, --exclude, -avz), sftp",
          "Linux containers intro — namespaces (PID, network, mount, user, IPC, UTS) and cgroups",
          "Regular expressions — grep -E, sed patterns, awk field processing, character classes",
          "Text editors — vim (modes, navigation, search/replace :s/old/new/g, macros) or nano basics",
        ],
        resources: [
          { label: "Linux Command Line (free book)", url: "https://linuxcommand.org/tlcl.php" },
          { label: "OverTheWire — Bandit (wargame)", url: "https://overthewire.org/wargames/bandit/" },
          { label: "TryHackMe — Linux Fundamentals", url: "https://tryhackme.com/room/linuxfundamentalspart1" },
        ],
      },
      {
        phase: 2,
        title: "Containers with Docker",
        duration: "3–4 weeks",
        items: [
          "Docker architecture — daemon (dockerd), CLI client, containerd, runc, OCI image spec",
          "Image layers and union filesystem — overlay2 storage driver, layer caching mechanics",
          "Writing Dockerfiles — FROM, RUN, COPY, ADD, WORKDIR, EXPOSE, ENTRYPOINT vs CMD difference",
          "Multi-stage builds — builder stage for compilation, minimal production image, scratch base",
          "Layer caching optimization — order instructions from least to most frequently changed",
          "Image security — non-root USER, Trivy scanning, distroless and Alpine base images",
          "Docker networking — bridge (default), host, overlay, macvlan drivers, --network flags",
          "Named volumes vs bind mounts — data persistence, backup strategies, tmpfs for secrets",
          "Docker Compose — services, networks, volumes, depends_on, healthcheck, env_file, profiles",
          "Compose override files — docker-compose.override.yml for local dev customization",
          "Environment management — --env-file, secrets in compose (bind mount), runtime injection",
          "Docker BuildKit — build secrets, SSH mounts, --mount=type=cache, parallel stages",
          "Publishing images — Docker Hub, GHCR (GitHub Container Registry), AWS ECR, GCR",
          "Image tagging strategy — semantic versioning, git SHA tags, latest anti-patterns",
          "Podman as rootless Docker alternative — drop-in compatibility, systemd integration",
          "Container runtime security — seccomp profiles, AppArmor, read-only rootfs, cap_drop",
          "Resource limits — --memory, --cpus, --pids-limit in Docker and Compose",
          "Docker debugging — exec -it bash, logs --follow, inspect, diff, events, stats",
          "Registry mirrors — setting up a local pull-through cache with Harbor",
          "BuildX and multi-platform builds — building ARM64 images on x86 for Apple Silicon",
          "Docker in CI — GitHub Actions with docker/build-push-action, layer caching in CI",
          "Production patterns — health checks in Dockerfile, graceful shutdown handling (SIGTERM)",
        ],
        resources: [
          { label: "Docker Official Get Started", url: "https://docs.docker.com/get-started/" },
          { label: "Play with Docker (free lab)", url: "https://labs.play-with-docker.com" },
          { label: "Docker Deep Dive — Nigel Poulton", url: "https://leanpub.com/dockerdeepdive" },
        ],
      },
      {
        phase: 3,
        title: "Kubernetes",
        duration: "5–6 weeks",
        items: [
          "K8s architecture — control plane (API server, etcd, scheduler, controller manager) vs worker nodes",
          "Worker components — kubelet (node agent), kube-proxy (iptables/IPVS), container runtime (containerd)",
          "Pods — smallest deployable unit, multi-container pods (sidecar/ambassador/adapter patterns)",
          "Deployments — desired state, ReplicaSet management, rolling updates, pause/resume",
          "StatefulSets — stable network IDs, ordered scaling, persistent volume claims per pod",
          "DaemonSets — one pod per node (logging agents, monitoring exporters, CNI plugins)",
          "Services — ClusterIP (internal), NodePort, LoadBalancer, ExternalName, Endpoints",
          "Ingress & Ingress Controllers — nginx ingress, path/host-based routing, TLS termination",
          "ConfigMaps — decoupling config from images, env injection, volume mounts",
          "Secrets — base64 encoding (not encryption!), external-secrets-operator for vault integration",
          "Namespaces — logical isolation, resource quotas (CPU/memory), LimitRanges, RBAC scope",
          "kubectl mastery — apply, get -o yaml, describe, logs --previous, exec, port-forward, debug",
          "Resource requests & limits — CPU throttling vs memory OOM kill difference",
          "Horizontal Pod Autoscaler — CPU/memory metrics, custom metrics (KEDA), scale-to-zero",
          "Vertical Pod Autoscaler — right-sizing containers based on historical usage",
          "Helm charts — templates, values.yaml, release lifecycle, Artifact Hub packages, hooks",
          "Helm best practices — named templates, _helpers.tpl, default values, schema validation",
          "RBAC — ServiceAccounts, Roles vs ClusterRoles, RoleBindings, principle of least privilege",
          "Network Policies — pod ingress/egress rules, Calico/Cilium for enforcement",
          "PersistentVolumes & StorageClasses — dynamic provisioning, access modes, volume expansion",
          "Local clusters — kind (K8s in Docker), minikube, k3s for development and CI testing",
          "K8s troubleshooting — CrashLoopBackOff, ImagePullBackOff, Pending state, OOMKilled diagnosis",
        ],
        resources: [
          { label: "Kubernetes Official Docs", url: "https://kubernetes.io/docs/home/" },
          { label: "KillerCoda — Interactive K8s Labs", url: "https://killercoda.com/kubernetes" },
          { label: "Kubernetes The Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way" },
        ],
      },
      {
        phase: 4,
        title: "Cloud & Infrastructure as Code",
        duration: "5–6 weeks",
        items: [
          "AWS core services — EC2, S3, RDS, VPC, IAM, Route53, CloudFront, SQS, SNS, Lambda",
          "IAM mastery — users, groups, roles, policies (identity vs resource), permission boundaries, STS",
          "VPC design — subnets (public/private), route tables, NAT Gateway, VPC peering, Transit Gateway",
          "Terraform fundamentals — providers, resources, data sources, variables, outputs, locals",
          "Terraform state — remote backend (S3 + DynamoDB locking), state locking, import existing resources",
          "Terraform modules — reusable infrastructure components, module registry, semantic versioning",
          "Terraform workflow — plan, apply, destroy, workspace environments (dev/staging/prod)",
          "Terragrunt — DRY Terraform configurations, remote_state dependency management",
          "Ansible — inventory (ini/yaml/dynamic), playbooks, tasks, roles, handlers, Vault for secrets",
          "Ansible best practices — idempotent tasks, tags, when conditions, block/rescue/always",
          "Serverless — AWS Lambda (runtime, cold starts, layers, SnapStart), API Gateway integration",
          "Step Functions — state machines, map state, choice state, error handling with retry/catch",
          "Managed Kubernetes — EKS, GKE, AKS — cluster provisioning, managed node groups, add-ons",
          "Cost optimization — Reserved Instances, Savings Plans, Spot Instances, Compute Optimizer",
          "Multi-region architecture — Route53 latency routing, active-active vs active-passive failover",
          "Pulumi — IaC in TypeScript/Python/Go, stack references, automation API",
          "AWS CDK — TypeScript constructs, L1/L2/L3 constructs, CDK Pipelines for self-mutation",
          "Compliance as Code — AWS Config rules, Security Hub, GuardDuty, CloudTrail audit logs",
          "Service Control Policies — AWS Organizations, guardrails across multiple accounts",
          "Tagging strategy — cost allocation tags, mandatory tags enforcement, tag policies",
          "Disaster Recovery — RPO vs RTO, backup strategies, chaos engineering (AWS FIS)",
          "FinOps basics — cost visibility, rightsizing, budgets and anomaly detection alerts",
        ],
        resources: [
          { label: "AWS Free Tier", url: "https://aws.amazon.com/free/" },
          { label: "Terraform Get Started", url: "https://developer.hashicorp.com/terraform/tutorials" },
          { label: "Cloud Guru (courses)", url: "https://acloudguru.com" },
        ],
      },
      {
        phase: 5,
        title: "CI/CD & Observability",
        duration: "4–5 weeks",
        items: [
          "GitHub Actions — workflow triggers (push, PR, schedule, workflow_dispatch), jobs, steps",
          "Actions matrix builds — test across multiple OS, Node versions, parallel job execution",
          "Actions caching — cache action for node_modules, Docker layer cache, pip cache",
          "Reusable workflows — caller/callee pattern, inputs/outputs/secrets, DRY pipelines",
          "GitOps with ArgoCD — Application CRD, sync policies (auto/manual), health checks",
          "Flux CD — Kustomization, HelmRelease, source controller, image automation",
          "Deployment strategies — rolling (K8s default), blue-green (Argo Rollouts), canary",
          "Prometheus — metrics scraping, instrumentation (Counter, Gauge, Histogram, Summary), PromQL",
          "Grafana — dashboards, panel types, data source config, templating with variables",
          "Alertmanager — routing trees, grouping, inhibition, silence, PagerDuty/OpsGenie integration",
          "Loki — log aggregation, LogQL queries (label matchers, line filters), Grafana integration",
          "Distributed tracing — OpenTelemetry SDK, trace context propagation, Jaeger / Grafana Tempo",
          "OpenTelemetry Collector — receivers, processors, exporters, batching, sampling",
          "SRE principles — SLIs (what to measure), SLOs (targets), SLAs (contractual), error budgets",
          "Toil reduction — automating repetitive manual work, runbook automation",
          "Incident management — on-call rotations, severity levels, war room communication",
          "Post-mortems — blameless culture, timeline reconstruction, action items with owners",
          "Chaos engineering — Chaos Monkey, LitmusChaos, defining steady state, gamedays",
          "Security scanning in CI — Trivy for images, SAST with Semgrep, DAST with OWASP ZAP",
          "Dependency updates — Dependabot, Renovate Bot, automated PR merging strategy",
          "Release management — semantic versioning, changelogs with git-cliff, tagging strategy",
          "Platform engineering — Internal Developer Platform (IDP), Backstage for service catalog",
        ],
        resources: [
          { label: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
          { label: "Prometheus Docs", url: "https://prometheus.io/docs/introduction/overview/" },
          { label: "Grafana Tutorials", url: "https://grafana.com/tutorials/" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. MOBILE DEVELOPER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "mobile",
    title: "Mobile Developer",
    tagline: "Build native-quality apps for iOS & Android",
    description:
      "Use React Native and Expo to ship cross-platform mobile apps with native performance, accessing device APIs like camera, GPS, and push notifications — and submit to both app stores.",
    Icon: Smartphone,
    color: "#facc15",
    glow: "rgba(250,204,21,0.15)",
    border: "rgba(250,204,21,0.3)",
    difficulty: "Intermediate",
    duration: "8–12 months",
    skills: ["React Native", "Expo", "TypeScript", "Navigation", "Animations", "Native APIs", "App Store", "Zustand"],
    phases: [
      {
        phase: 1,
        title: "React & JS Foundations",
        duration: "4–6 weeks",
        items: [
          "JavaScript — closures, prototypes, async/await, event loop, generators",
          "TypeScript — interfaces, generics, discriminated unions, strict mode, type narrowing",
          "React fundamentals — JSX, components, props, state, hooks",
          "useState and useEffect — the two most important hooks, cleanup functions",
          "useContext, useRef, useMemo, useCallback — when each actually helps",
          "Custom hooks — extract and reuse component logic, naming conventions",
          "React patterns — composition, render props, compound components, headless components",
          "TanStack Query — data fetching, caching, background sync, mutations, offline support",
          "Zustand — simple global state management without Redux boilerplate",
          "Forms — React Hook Form + Zod for validation (works on both web and mobile)",
          "Node.js basics — running scripts, npm/pnpm package management, package.json",
          "Git workflow — branching, conventional commits, PR workflow for app development",
          "TypeScript generics — generic hooks, generic API clients, utility types",
          "Error handling patterns — try/catch in async, error boundaries, toast notifications",
          "Performance concepts — when to memoize, avoiding unnecessary re-renders, profiling",
          "REST API integration — fetch/axios, JSON parsing, error states, loading states",
          "Authentication flows — JWT handling, token refresh, auth state management",
          "Testing React components — React Testing Library, userEvent, screen queries",
        ],
        resources: [
          { label: "React Official Docs", url: "https://react.dev" },
          { label: "Total TypeScript", url: "https://www.totaltypescript.com" },
        ],
      },
      {
        phase: 2,
        title: "React Native & Expo",
        duration: "5–6 weeks",
        items: [
          "React Native mental model — bridge vs JSI, Metro bundler, Hermes JS engine",
          "Expo managed vs bare workflow — trade-offs and when to eject to bare",
          "Core components — View, Text, Image, TextInput, ScrollView, FlatList, SectionList",
          "SafeAreaView, KeyboardAvoidingView, Modal, RefreshControl, ActivityIndicator",
          "StyleSheet API — RN flexbox (column-first default), platform-specific shadow props",
          "NativeWind — Tailwind CSS syntax for React Native, className support, theming",
          "Platform-specific code — Platform.OS, Platform.select(), .ios.tsx and .android.tsx files",
          "Expo Go — rapid iteration on device without building (QR code scan)",
          "EAS CLI — eas build, eas submit, eas update commands and eas.json configuration",
          "Expo SDK — expo-camera, expo-location, expo-notifications, expo-image-picker, expo-av",
          "Debugging — React DevTools standalone, Flipper, Expo dev tools, LogBox config",
          "AsyncStorage and MMKV — persisting data to device storage, synchronous vs async",
          "expo-secure-store — hardware-backed secure credential storage for tokens",
          "expo-image — better image component, blur hash, priority loading, caching strategy",
          "Environment variables in Expo — app.config.ts, EAS Secrets, process.env.EXPO_PUBLIC_",
          "TypeScript in RN — defining navigation param types, component prop types",
          "Dimensions API — responsive layouts based on screen size, useWindowDimensions hook",
          "Accessibility in RN — accessibilityLabel, accessibilityRole, accessibilityHint, testID",
          "Local notifications — expo-notifications for scheduled reminders and in-app alerts",
          "Deep linking configuration — scheme, universal links setup for both platforms",
        ],
        resources: [
          { label: "React Native Docs", url: "https://reactnative.dev/docs/getting-started" },
          { label: "Expo Docs", url: "https://docs.expo.dev" },
          { label: "William Candillon — YouTube", url: "https://www.youtube.com/@wcandillon" },
        ],
      },
      {
        phase: 3,
        title: "Navigation & State",
        duration: "3–4 weeks",
        items: [
          "Expo Router v3 — file-based routing, app/ directory convention, typed routes",
          "Stack navigator — push, pop, modal presentation, custom headers, back gesture",
          "Tab navigator — bottom tabs, badge counts, custom tab bar, lazy loading tabs",
          "Drawer navigation — sidebar menus, gesture-driven, custom drawer content",
          "Deep linking — universal links (iOS), Android App Links, custom URL schemes",
          "Authentication flow — conditional navigation, protected routes, redirect after login",
          "Nested navigators — stack inside tab, modal over tab, preserving state on tab switch",
          "Navigation params — typed route params, passing complex objects, query params",
          "Zustand for global state — createStore, selectors, immer middleware, devtools",
          "Redux Toolkit for complex apps — slices, RTK Query, thunks, entity adapters",
          "AsyncStorage — simple key-value persistence, JSON serialization, migration strategy",
          "SecureStore — hardware-backed secure credential storage for sensitive data",
          "MMKV — fastest React Native storage, synchronous reads, encryption support",
          "TanStack Query — server state, background sync, offline support, persistence",
          "NetInfo — handle online/offline state, connection type detection, retry on reconnect",
          "State persistence — zustand persist middleware, rehydration on app launch",
          "Context vs Zustand — when React context is sufficient vs when you need a store",
          "Linking API — openURL, canOpenURL, scheme handling for third-party apps",
        ],
        resources: [
          { label: "Expo Router Docs", url: "https://expo.github.io/router/docs/" },
          { label: "Zustand Docs", url: "https://zustand-demo.pmnd.rs" },
        ],
      },
      {
        phase: 4,
        title: "Animations & Performance",
        duration: "3–4 weeks",
        items: [
          "React Native Animated API — basic animations, interpolation, sequence, parallel",
          "Reanimated 3 — worklets running on UI thread for true 60/120fps animations",
          "useSharedValue and useAnimatedStyle — declarative animation bindings",
          "withTiming, withSpring, withRepeat, withSequence, withDelay animation helpers",
          "useAnimatedScrollHandler — animated values driven by scroll position",
          "Gesture Handler v2 — GestureDetector API, Gesture.Pan, Gesture.Pinch, composing",
          "Swipeable rows — react-native-swipeable or gesture handler for list actions",
          "Moti — declarative animations built on Reanimated, animate/exit props",
          "React Native Skia — GPU-accelerated 2D graphics, custom drawing, shaders",
          "Lottie — JSON animation files from Adobe After Effects, looping, speed control",
          "FlashList — performant FlatList replacement by Shopify, recycled cells",
          "FlatList optimization — getItemLayout, keyExtractor, removeClippedSubviews, windowSize",
          "React.memo and useMemo — preventing unnecessary re-renders in lists",
          "Image optimization — expo-image blurhash placeholders, progressive loading",
          "JavaScript thread profiling — Flipper + Hermes for identifying bottlenecks",
          "Hermes performance — enabling Hermes, bytecode precompilation benefits",
          "Memory management — avoiding memory leaks, cleanup in useEffect, image caching",
          "Hermes debugger — Chrome DevTools connected to Hermes for JS debugging",
        ],
        resources: [
          { label: "React Native Reanimated Docs", url: "https://docs.swmansion.com/react-native-reanimated/" },
          { label: "Moti Docs", url: "https://moti.fyi" },
          { label: "React Native Gesture Handler", url: "https://docs.swmansion.com/react-native-gesture-handler/" },
        ],
      },
      {
        phase: 5,
        title: "Shipping to App Stores",
        duration: "3–4 weeks",
        items: [
          "EAS Build — managed cloud builds for iOS and Android, build profiles",
          "iOS code signing — certificates, provisioning profiles, App Store Connect setup",
          "Android code signing — keystore generation, upload key, signing configs",
          "EAS Submit — automated App Store and Google Play submission, credentials management",
          "OTA updates — EAS Update for instant JS bundle pushes without App Store review",
          "App versioning — buildNumber (iOS), versionCode (Android), semantic versioning",
          "App Store Optimization (ASO) — keywords, screenshots, app preview video, ratings",
          "Push notifications — Expo Notifications with FCM (Android) and APNs (iOS)",
          "In-app purchases — react-native-purchases (RevenueCat), subscription management",
          "Crash reporting — Sentry for React Native with symbolication of native crashes",
          "Analytics — PostHog or Firebase Analytics, custom events, user properties",
          "App review guidelines — App Store and Play Store policies, common rejection reasons",
          "TestFlight & internal testing — inviting testers, feedback collection, crash logs",
          "Release management — phased rollouts, monitoring crash-free sessions after release",
          "CI/CD for mobile — GitHub Actions with EAS Build trigger on main branch push",
          "fastlane — automating certificates, screenshots, build and upload in CI",
          "Privacy manifest (iOS 17+) — required API declarations for App Store submission",
          "Privacy nutrition labels — declaring data collection practices accurately",
        ],
        resources: [
          { label: "EAS Build Docs", url: "https://docs.expo.dev/build/introduction/" },
          { label: "EAS Submit Docs", url: "https://docs.expo.dev/submit/introduction/" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. AI / ML ENGINEER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ai-ml",
    title: "AI / ML Engineer",
    tagline: "Build intelligent systems with machine learning",
    description:
      "Go from Python fundamentals to training neural networks, fine-tuning LLMs, and deploying ML models in production. The hottest engineering path of the decade.",
    Icon: Brain,
    color: "#ec4899",
    glow: "rgba(236,72,153,0.15)",
    border: "rgba(236,72,153,0.3)",
    difficulty: "Advanced",
    duration: "12–18 months",
    skills: ["Python", "NumPy", "Pandas", "PyTorch", "Scikit-learn", "LLMs", "RAG", "FastAPI", "MLOps", "Statistics"],
    phases: [
      {
        phase: 1,
        title: "Python & Math Foundations",
        duration: "5–7 weeks",
        items: [
          "Python OOP — classes, inheritance, dunder methods (__repr__, __len__, __iter__)",
          "Python comprehensions — list, dict, set, generator expressions",
          "Decorators — @property, @staticmethod, @classmethod, custom decorators, functools.wraps",
          "Context managers — with statement, __enter__/__exit__, contextlib.contextmanager",
          "Type hints — annotate functions with types, mypy for static checking, TypeVar",
          "Virtual environments — venv, conda, pyenv, poetry — dependency isolation",
          "NumPy — ndarray, dtype, shape, broadcasting rules, vectorized operations",
          "NumPy linear algebra — dot product, matrix multiply (@), inverse, determinant, SVD, eigenvalues",
          "Pandas — DataFrame creation, loc/iloc indexing, groupby/agg, merge/join, handling NaN",
          "Pandas performance — vectorized operations, avoid apply() loops, categorical dtype",
          "Matplotlib — line plots, scatter plots, histograms, subplots, figure/axes API",
          "Seaborn — heatmaps, pairplots, violin plots, FacetGrid, statistical plots",
          "Jupyter Lab — notebook workflow, %%timeit, %matplotlib inline, ipywidgets",
          "Linear algebra — vectors (dot product, magnitude, angle), matrices (multiply, transpose, rank)",
          "Calculus — derivatives, partial derivatives, chain rule, Jacobian, gradient",
          "Probability — probability axioms, conditional probability, Bayes' theorem",
          "Probability distributions — Normal, Bernoulli, Binomial, Poisson, Exponential",
          "Statistics — mean, median, variance, standard deviation, covariance, correlation",
          "Hypothesis testing — null hypothesis, p-value, t-test, chi-square, Type I/II errors",
          "Central Limit Theorem — sampling distributions, confidence intervals, bootstrapping",
          "Information theory — entropy, KL divergence, mutual information, cross-entropy loss",
          "Optimization — gradient descent, learning rate, saddle points, convexity",
        ],
        resources: [
          { label: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python" },
          { label: "NumPy Quickstart Tutorial", url: "https://numpy.org/doc/stable/user/quickstart.html" },
          { label: "3Blue1Brown — Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
        ],
      },
      {
        phase: 2,
        title: "Classical Machine Learning",
        duration: "6–8 weeks",
        items: [
          "Supervised learning — regression (predicting continuous) vs classification (predicting category)",
          "Linear regression — OLS, gradient descent, regularization (Ridge/Lasso/ElasticNet)",
          "Logistic regression — sigmoid, decision boundary, multi-class (OvR, softmax)",
          "Support Vector Machines — margin maximization, kernel trick (RBF, polynomial), C parameter",
          "k-Nearest Neighbors — distance metrics, curse of dimensionality, choosing k",
          "Decision trees — information gain, Gini impurity, max_depth, pruning, feature importance",
          "Random forests — bagging, feature subsampling, OOB error, feature importance voting",
          "Gradient boosting — XGBoost, LightGBM, CatBoost — sequential tree building, shrinkage",
          "Unsupervised learning — k-means (elbow method, silhouette score), hierarchical clustering",
          "DBSCAN — density-based clustering, epsilon/min_samples, handling noise points",
          "Dimensionality reduction — PCA (variance explained, cumulative explained variance), t-SNE, UMAP",
          "Train/val/test split — stratified split, data leakage prevention, temporal split",
          "K-fold cross-validation — StratifiedKFold, GroupKFold, TimeSeriesSplit",
          "Evaluation metrics — accuracy, precision, recall, F1, AUC-ROC, PR-AUC, confusion matrix",
          "Regression metrics — RMSE, MAE, MAPE, R², adjusted R²",
          "Scikit-learn pipelines — Pipeline, ColumnTransformer, StandardScaler, OneHotEncoder",
          "Hyperparameter tuning — GridSearchCV, RandomizedSearchCV, Optuna (Bayesian optimization)",
          "Feature engineering — polynomial features, log transform, binning, target encoding, embeddings",
          "Handling imbalanced data — SMOTE oversampling, class_weight='balanced', threshold tuning",
          "Bias-variance tradeoff — underfitting vs overfitting, learning curves, validation curves",
          "SHAP values — SHAP summary plot, waterfall plot, feature importance vs SHAP",
          "Model persistence — joblib.dump/load, MLflow artifact logging, ONNX export",
        ],
        resources: [
          { label: "Hands-On ML with Scikit-Learn (book)", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/" },
          { label: "Google ML Crash Course (free)", url: "https://developers.google.com/machine-learning/crash-course" },
          { label: "Kaggle — Learn", url: "https://www.kaggle.com/learn" },
        ],
      },
      {
        phase: 3,
        title: "Deep Learning & Neural Networks",
        duration: "7–9 weeks",
        items: [
          "Neural network fundamentals — perceptrons, activation functions (ReLU, sigmoid, tanh, GELU)",
          "Backpropagation — chain rule in computation graphs, vanishing/exploding gradients",
          "PyTorch tensors — creation, operations, autograd, .grad, requires_grad, detach()",
          "nn.Module — defining layers, forward(), parameters(), named_parameters()",
          "DataLoader & Dataset — custom __getitem__, collate_fn, num_workers, pin_memory",
          "Training loop — forward, criterion, backward, optimizer.step(), scheduler.step()",
          "GPU acceleration — .to(device), CUDA availability check, DataParallel, DistributedDataParallel",
          "Batch normalization — normalizing activations, gamma/beta learnable params, train vs eval mode",
          "Dropout — stochastic regularization, p parameter, mc_dropout for uncertainty estimation",
          "Weight initialization — Xavier/He/Kaiming uniform/normal, avoiding symmetry breaking",
          "Optimizers — SGD with momentum, Adam (adaptive LR), AdamW (decoupled weight decay)",
          "Learning rate schedules — warmup, cosine annealing, ReduceLROnPlateau, OneCycleLR",
          "CNN architectures — convolution (kernel, stride, padding, dilation), pooling, AlexNet, ResNet",
          "Skip connections — ResNet residual blocks, DenseNet dense connections",
          "Transfer learning — freeze backbone, unfreeze + fine-tune, discriminative learning rates",
          "Attention mechanism — scaled dot-product attention, multi-head attention, key/query/value",
          "Transformer encoder — positional encoding, feed-forward sublayer, pre-norm vs post-norm",
          "RNNs & LSTMs — sequence modeling, hidden state, cell state, gating mechanisms",
          "Weights & Biases — wandb.init(), log metrics, log images, artifact versioning",
          "Model checkpointing — saving best epoch, resuming training, torch.save state_dict",
          "Mixed precision training — torch.cuda.amp, GradScaler, fp16/bf16 benefits",
          "Distributed training — DDP, torchrun, gradient synchronization, multi-GPU strategies",
        ],
        resources: [
          { label: "fast.ai — Practical Deep Learning (free)", url: "https://course.fast.ai" },
          { label: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/" },
          { label: "Andrej Karpathy — Neural Networks: Zero to Hero", url: "https://karpathy.ai/zero-to-hero.html" },
        ],
      },
      {
        phase: 4,
        title: "LLMs & Generative AI",
        duration: "5–6 weeks",
        items: [
          "Transformer architecture — self-attention, positional encoding, encoder-only vs decoder-only",
          "Tokenization — BPE, WordPiece, SentencePiece, tiktoken, token counting importance",
          "BERT family — masked language modeling, sentence embeddings, fine-tuning for classification",
          "GPT family — autoregressive text generation, temperature, top-k, top-p (nucleus) sampling",
          "Prompt engineering — system prompts, zero-shot, few-shot, chain-of-thought, ReAct",
          "Fine-tuning LLMs — when to fine-tune vs prompting, full fine-tuning trade-offs",
          "LoRA — low-rank adaptation matrices, rank r and alpha hyperparameters, target modules",
          "QLoRA — 4-bit quantized base model + LoRA adapter, memory efficiency",
          "HuggingFace Transformers — AutoModel, AutoTokenizer, Trainer API, pipelines",
          "Retrieval-Augmented Generation (RAG) — chunking strategies, embedding models, vector search",
          "Vector databases — Pinecone, Weaviate, Chroma, pgvector — ANN search with HNSW",
          "LangChain — chains, agents, tools, memory types, LCEL (expression language)",
          "LlamaIndex — document loaders, index types, query engines, response synthesis",
          "Function calling / tool use — structured output, parallel tool calls, tool schemas",
          "Evaluation — RAGAS (faithfulness, relevance, recall), G-Eval, human eval design",
          "Multimodal models — GPT-4V, Claude 3, Gemini — image + text reasoning",
          "HuggingFace Hub — model cards, Spaces for demos, Inference API, dataset hub",
          "Quantization — GPTQ, AWQ, llama.cpp for local inference on CPU/GPU",
        ],
        resources: [
          { label: "HuggingFace NLP Course (free)", url: "https://huggingface.co/learn/nlp-course" },
          { label: "LangChain Docs", url: "https://python.langchain.com/docs/get_started/introduction" },
          { label: "Andrej Karpathy — makemore series", url: "https://github.com/karpathy/makemore" },
        ],
      },
      {
        phase: 5,
        title: "MLOps & Production",
        duration: "4–5 weeks",
        items: [
          "Model serving — FastAPI inference endpoint with async handlers, batching requests",
          "TorchServe — model archive (.mar), management API, inference API, multi-model serving",
          "BentoML — Runner, Service, bentofile.yaml, cloud deployment to BentoCloud",
          "Triton Inference Server — NVIDIA, model ensemble, dynamic batching, concurrent execution",
          "Containerizing ML — Docker with CUDA base images, multi-stage builds, GPU access",
          "MLflow Tracking — log params/metrics/artifacts, UI, experiment comparison, model registry",
          "Weights & Biases — runs, sweeps (hyperparameter optimization), artifacts, reports",
          "DVC — versioning datasets and model artifacts with Git, remote storage (S3/GCS)",
          "DVC pipelines — dvc.yaml stages, dvc repro, cache management",
          "Feature stores — Feast for training/serving consistency, point-in-time correctness",
          "Pipeline orchestration — Airflow DAGs, Prefect flows, Metaflow for ML workflows",
          "Model monitoring — Evidently AI (data drift, model performance), Arize, Fiddler",
          "A/B testing ML models — shadow deployment, traffic splitting, statistical significance",
          "Canary deployments for models — gradual rollout, rollback triggers based on metrics",
          "Kubeflow Pipelines — K8s-native ML workflows, containerized components, artifacts",
          "SageMaker — Training Jobs, Processing Jobs, Model Registry, endpoints, Batch Transform",
          "Vertex AI — Training, Pipelines, Model Registry, Prediction endpoints, Feature Store",
          "Cost optimization for ML — spot instances for training, serverless inference, auto-scaling",
          "Model cards & transparency — documentation of training data, eval results, limitations",
          "Bias & fairness — Fairlearn, demographic parity, equalized odds, counterfactual fairness",
        ],
        resources: [
          { label: "Weights & Biases — MLOps Course (free)", url: "https://www.wandb.courses" },
          { label: "MLflow Docs", url: "https://mlflow.org/docs/latest/index.html" },
          { label: "Full Stack Deep Learning", url: "https://fullstackdeeplearning.com" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. CYBERSECURITY ENGINEER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cybersecurity",
    title: "Cybersecurity Engineer",
    tagline: "Protect systems, find vulnerabilities, defend networks",
    description:
      "Learn ethical hacking, penetration testing, secure coding, and defensive security practices. Protect systems, earn certifications, and build a career in one of tech's highest-demand fields.",
    Icon: Shield,
    color: "#ef4444",
    glow: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.3)",
    difficulty: "Advanced",
    duration: "12–18 months",
    skills: ["Networking", "Linux", "Python", "Pentesting", "CTF", "OWASP", "Wireshark", "Metasploit", "Cryptography"],
    phases: [
      {
        phase: 1,
        title: "Networking & OS Fundamentals",
        duration: "5–6 weeks",
        items: [
          "OSI model — all 7 layers, protocols at each layer, where attacks target each layer",
          "TCP/IP — IP addressing (IPv4/IPv6), subnetting, CIDR, TCP 3-way handshake, UDP",
          "Core protocols — DNS, DHCP, HTTP/S, FTP, SMTP/IMAP, ARP, ICMP — vulnerabilities in each",
          "TLS/SSL — TLS 1.2 vs 1.3, certificate chain, PKI, common TLS misconfigurations",
          "Wireshark — live packet capture, display filters (tcp.port, http.request), following TCP streams",
          "Linux CLI — navigation, permissions (rwx), processes, cron, systemd, /var/log/ analysis",
          "Windows security — Active Directory, domain controllers, Group Policy, NTLM vs Kerberos",
          "PowerShell for security — Get-Process, Invoke-WebRequest, script execution policies",
          "Virtualization setup — VirtualBox/VMware, creating isolated lab networks, snapshots",
          "Kali Linux setup — installing and updating tools, configuring proxychains, VPN for anonymity",
          "Python scripting — socket programming, automate reconnaissance, parse Nmap XML output",
          "Bash scripting — write recon scripts, automate port scanning, process output with awk/sed",
          "Network architecture — DMZ, segmentation, firewall zones, NAT, VLAN security",
          "Wireless networks — WPA2/WPA3, SSID enumeration, deauth attacks concept, evil twin",
          "VPN concepts — site-to-site, client-to-site, OpenVPN, WireGuard, split tunneling risks",
          "Netcat — the Swiss army knife: port scanning, file transfer, reverse shells, banner grabbing",
          "Packet crafting — Scapy for Python-based packet manipulation and custom protocol testing",
          "IPv6 security — SLAAC, link-local addresses, RA spoofing, dual-stack vulnerabilities",
        ],
        resources: [
          { label: "TryHackMe — Pre-Security Path (free)", url: "https://tryhackme.com/path/outline/presecurity" },
          { label: "Professor Messer — CompTIA Network+", url: "https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/" },
          { label: "OverTheWire — Bandit", url: "https://overthewire.org/wargames/bandit/" },
        ],
      },
      {
        phase: 2,
        title: "Ethical Hacking Foundations",
        duration: "5–6 weeks",
        items: [
          "Penetration testing methodology — PTES, OWASP Testing Guide phases overview",
          "Reconnaissance phases — passive (OSINT) vs active (network scanning) trade-offs",
          "Passive recon — WHOIS, Google dorks (filetype:pdf site:target.com), Shodan, theHarvester",
          "OSINT frameworks — Maltego, Recon-ng, SpiderFoot, LinkedIn for target enumeration",
          "Active scanning — Nmap SYN scan (-sS), version detection (-sV), OS detection (-O), NSE scripts",
          "Nmap timing templates (-T0 to -T5), evading firewalls (-f fragmentation, --mtu)",
          "Service enumeration — banner grabbing, version fingerprinting, nikto for web servers",
          "Vulnerability assessment — searching CVEs in NVD, Exploit-DB, SearchSploit",
          "CVSS scoring — Base, Temporal, Environmental score components, severity levels",
          "OWASP Top 10 — understand all 10 categories conceptually before exploiting",
          "Metasploit Framework — msfconsole, search, use, options, run/exploit, sessions",
          "Metasploit payloads — staged vs stageless, meterpreter, shell payloads, encoders",
          "Password attacks — Hydra for online brute force, wordlists (rockyou), crunch",
          "Hash cracking — hashcat modes, John the Ripper, rainbow tables, GPU acceleration",
          "Privilege escalation — SUID binaries, sudo -l misconfigurations, writable cron jobs",
          "Post-exploitation — maintaining access, pivoting, lateral movement concepts",
          "Report writing — executive summary, technical findings, CVSS, remediation steps, PoC",
          "Legal and ethical framework — signed scope, rules of engagement, get-out-of-jail letter",
        ],
        resources: [
          { label: "TryHackMe — Jr. Pentester Path", url: "https://tryhackme.com/path/outline/jrpenetrationtester" },
          { label: "Hack The Box — Starting Point", url: "https://www.hackthebox.com/starting-point" },
          { label: "OWASP WebGoat (practice app)", url: "https://owasp.org/www-project-webgoat/" },
        ],
      },
      {
        phase: 3,
        title: "Web Application Security",
        duration: "4–5 weeks",
        items: [
          "SQL injection — error-based, blind boolean/time-based, UNION-based, out-of-band, sqlmap",
          "Second-order SQLi — stored and later executed, bypassing WAF with encoding",
          "Cross-site scripting (XSS) — reflected, stored, DOM-based, mutation XSS, Content Security Policy bypass",
          "CSRF — state-changing requests, SameSite=None risks, CSRF token bypass techniques",
          "SSRF — probing internal services, AWS metadata endpoint (169.254.169.254), SSRF to RCE",
          "IDOR — insecure direct object references, mass assignment, horizontal vs vertical privilege escalation",
          "Authentication flaws — JWT alg:none, weak secrets (HS256 brute force), session fixation",
          "OAuth 2.0 vulnerabilities — open redirect in redirect_uri, CSRF on OAuth flow, token leakage",
          "XXE injection — XML entity expansion, SSRF via XXE, DoS with billion laughs attack",
          "Template injection (SSTI) — Jinja2, Twig, Freemarker, Pebble — RCE via {{ 7*7 }}",
          "Deserialization — Java/PHP/Python deserialization gadget chains, ysoserial, pickle exploit",
          "Business logic flaws — race conditions (thread race for balance), negative values, workflow bypass",
          "Path traversal — ../../../../etc/passwd, URL-encoding bypass, null byte injection",
          "Command injection — ; && || ` $() patterns, time-based blind, out-of-band with DNS",
          "Burp Suite mastery — Proxy, Repeater, Intruder (sniper/cluster bomb), Scanner, Comparer",
          "Burp extensions — Auth Analyzer, Turbo Intruder, Active Scan++, Param Miner",
          "Bug bounty methodology — choosing programs, recon, note-taking, writing quality reports",
          "HackerOne & Bugcrowd — program selection, scope reading, triage communication",
        ],
        resources: [
          { label: "PortSwigger Web Security Academy (free)", url: "https://portswigger.net/web-security" },
          { label: "DVWA — Damn Vulnerable Web App", url: "https://dvwa.co.uk" },
          { label: "HackTricks (GitBook)", url: "https://book.hacktricks.xyz" },
        ],
      },
      {
        phase: 4,
        title: "Cryptography & Secure Coding",
        duration: "3–4 weeks",
        items: [
          "Symmetric encryption — AES (ECB/CBC/CTR/GCM modes), block size, IV/nonce, padding oracle attack",
          "Asymmetric encryption — RSA (key generation, encrypt, sign, PKCS#1 vs OAEP), elliptic curve (ECDSA, ECDH)",
          "Hashing — SHA-256/SHA-3, MD5 weaknesses, rainbow tables, salted bcrypt/argon2id for passwords",
          "Digital signatures — signing process, verification, X.509 certificates, certificate transparency",
          "TLS deep dive — TLS 1.3 handshake, cipher suites, perfect forward secrecy (ECDHE)",
          "Common crypto attacks — padding oracle (BEAST, POODLE), length extension attack, weak RNG",
          "Secure random number generation — /dev/urandom, crypto.randomBytes, CSPRNGs vs PRNGs",
          "Secure coding principles — input validation (allowlist), output encoding, parameterized queries",
          "Secret management — never in code, environment variables, HashiCorp Vault, AWS Secrets Manager",
          "Static analysis (SAST) — Semgrep rules, Bandit for Python, FindSecBugs for Java",
          "Dynamic analysis (DAST) — OWASP ZAP in CI, Nikto, nuclei for vulnerability scanning",
          "Dependency scanning — Snyk, Dependabot, npm audit, safety (Python), retire.js",
          "Security headers — HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy",
          "Secure development lifecycle (SDLC) — threat modeling, security requirements, SAST in CI",
          "STRIDE threat modeling — Spoofing, Tampering, Repudiation, Info disclosure, DoS, EoP",
          "Containerization security — non-root users, read-only filesystems, distroless images",
          "Infrastructure security — least privilege IAM, Security Groups, network segmentation",
          "Incident response basics — containment, eradication, recovery, lessons learned",
        ],
        resources: [
          { label: "Cryptohack (free challenges)", url: "https://cryptohack.org" },
          { label: "Semgrep Docs", url: "https://semgrep.dev/docs/" },
        ],
      },
      {
        phase: 5,
        title: "Certifications & Career",
        duration: "Ongoing",
        items: [
          "CompTIA Security+ — entry-level industry standard, vendor-neutral, widely recognized",
          "eJPT (eLearnSecurity) — beginner practical pentesting cert, 3-day lab exam",
          "CEH — Certified Ethical Hacker, broad domain coverage, good for corporate roles",
          "OSCP — gold standard offensive cert, 24-hour practical exam, requires real skill",
          "OSWE / OSED / OSEP — advanced OffSec certs for web exploits, exploit dev, evasion",
          "PNPT (TCM Security) — practical pentesting exam, 5-day external + internal pentest",
          "AWS Security Specialty — cloud security certification for AWS-heavy environments",
          "CTF competitions — CTFtime events, team participation, writeup culture",
          "OverTheWire, pwn.college, Root-Me for ongoing wargame practice and skill building",
          "Bug bounty hunting — HackerOne, Bugcrowd, Intigriti — start with narrow, known scopes",
          "CVE research — responsible disclosure, CVE numbering authority, disclosure timeline",
          "Security specializations — SOC analyst (detection), malware analysis, AppSec, red team",
          "Home lab — vulnerable VMs (Metasploitable, VulnHub), Proxmox for multi-VM lab",
          "Security blog or CTF writeups — document learning, build public portfolio",
          "Security community — NullByte Discord, TCM Security Discord, security Twitter/X",
          "Career tracks — penetration tester, security engineer, AppSec, red team, threat intel",
        ],
        resources: [
          { label: "CompTIA Security+ Study Guide", url: "https://www.comptia.org/certifications/security" },
          { label: "HackerOne Bug Bounty Platform", url: "https://www.hackerone.com" },
          { label: "CTFtime — Upcoming CTFs", url: "https://ctftime.org" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. DATA ENGINEER
  // ═══════════════════════════════════════════════════════════════
  {
    id: "data-engineering",
    title: "Data Engineer",
    tagline: "Build pipelines that power data-driven decisions",
    description:
      "Design and build robust data infrastructure — ETL pipelines, data warehouses, streaming systems, and the foundations that Data Scientists and Analysts depend on to derive insights.",
    Icon: Database,
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.15)",
    border: "rgba(56,189,248,0.3)",
    difficulty: "Intermediate",
    duration: "10–14 months",
    skills: ["Python", "SQL", "Spark", "dbt", "Airflow", "Kafka", "Snowflake", "BigQuery", "Docker", "Data Modeling"],
    phases: [
      {
        phase: 1,
        title: "Python & SQL Mastery",
        duration: "5–6 weeks",
        items: [
          "Python OOP — classes, dataclasses, abstract base classes, protocol for duck typing",
          "Python file I/O — reading CSV/JSON/Parquet with pathlib, encoding handling",
          "Virtual environments — venv, poetry, conda — reproducible dependency management",
          "Python packaging — setup.py vs pyproject.toml, building wheels, publishing to PyPI",
          "Type hints — annotating functions, Optional, Union, TypeVar, mypy strict mode",
          "SQL SELECT deep dive — WHERE with complex conditions, LIKE, IN, BETWEEN, IS NULL",
          "SQL aggregation — GROUP BY, HAVING, ROLLUP, CUBE, GROUPING SETS",
          "SQL subqueries — correlated subqueries, scalar subqueries, derived tables",
          "CTEs (Common Table Expressions) — WITH clause, multiple CTEs, recursive CTEs for trees",
          "Window functions — ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, FIRST_VALUE",
          "PARTITION BY and OVER — framing with ROWS BETWEEN, running totals, moving averages",
          "SQL performance — EXPLAIN ANALYZE, seq scan vs index scan, reading execution plans",
          "Indexes — creating, composite indexes, partial indexes, index-only scans, when not to index",
          "Python database drivers — psycopg2, asyncpg, SQLAlchemy (Core + ORM), connection pools",
          "Pandas — DataFrame creation, loc/iloc, merge, groupby/agg, pivot tables, stack/unstack",
          "Pandas performance — vectorized operations, chunked reading for large files, categorical dtype",
          "Polars — lazy DataFrames, scan_csv/scan_parquet, streaming mode for out-of-core processing",
          "Data validation — Great Expectations suites, Pandera schema validation, Pydantic models",
          "Bash scripting — cron jobs, file manipulation, loop over files, pipeline chaining with |",
          "Regular expressions — re module, pattern matching log files, named capture groups",
          "Git for data engineers — versioning pipeline code, branching strategy, code review workflow",
          "Docker basics — running databases in containers, Docker Compose for local data stacks",
        ],
        resources: [
          { label: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/" },
          { label: "SQLZoo", url: "https://sqlzoo.net" },
          { label: "Polars User Guide", url: "https://docs.pola.rs" },
        ],
      },
      {
        phase: 2,
        title: "Data Warehousing & Modeling",
        duration: "4–5 weeks",
        items: [
          "OLAP vs OLTP — analytical (large reads, aggregates) vs transactional (many small writes)",
          "Data warehouse architecture — staging layer, core/integration layer, data mart layer",
          "Dimensional modeling — Kimball methodology, grain definition before design",
          "Star schema — fact tables (metrics), dimension tables (context), foreign key relationships",
          "Snowflake schema — normalized dimensions, trade-offs with query performance",
          "Slowly Changing Dimensions — Type 1 (overwrite), Type 2 (version with SCD_valid dates), Type 3",
          "Data Vault 2.0 — hubs (business keys), links (relationships), satellites (context/history)",
          "Fact table types — transaction, periodic snapshot, accumulating snapshot fact tables",
          "Snowflake (platform) — virtual warehouses, clustering keys, micro-partitions, time travel",
          "Snowflake zero-copy clone — branching datasets for dev/test without storage cost",
          "BigQuery — on-demand vs capacity pricing, partitioning (date, integer range), clustering",
          "BigQuery ML — running SQL-based ML models, BQML CREATE MODEL syntax",
          "Amazon Redshift — distribution styles (KEY, EVEN, ALL), sort keys, VACUUM, ANALYZE",
          "dbt — project structure (models/, tests/, seeds/, macros/, snapshots/), ref() and source()",
          "dbt models — SQL SELECT statements as models, incremental models (is_incremental())",
          "dbt tests — schema tests (unique, not_null, accepted_values, relationships), custom tests",
          "dbt documentation — doc blocks, column descriptions, dbt docs generate/serve",
          "dbt macros — Jinja2 templating, DRY SQL, calling macros, dispatch for adapter-specific",
          "dbt snapshots — Type 2 SCD using dbt snapshot, strategy (timestamp vs check)",
          "Data quality rules — null checks, referential integrity, row count anomaly detection",
          "Semantic layers — defining business metrics in dbt Semantic Layer, MetricFlow",
          "Data catalogs — Apache Atlas, Datahub, dbt Catalog, column-level lineage tracking",
        ],
        resources: [
          { label: "dbt Learn (free courses)", url: "https://courses.getdbt.com" },
          { label: "Snowflake Quickstart Tutorials", url: "https://quickstarts.snowflake.com" },
          { label: "The Data Warehouse Toolkit (book)", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/" },
        ],
      },
      {
        phase: 3,
        title: "ETL Pipelines & Orchestration",
        duration: "4–5 weeks",
        items: [
          "ETL vs ELT — when to transform before vs after loading, compute location trade-offs",
          "Apache Airflow architecture — webserver, scheduler, executor, worker, metastore DB",
          "Airflow DAGs — @dag decorator, task functions, TaskFlow API, XCom for inter-task data",
          "Airflow operators — PythonOperator, BashOperator, S3ToRedshiftOperator, dbt operators",
          "Airflow sensors — S3KeySensor, ExternalTaskSensor, HttpSensor — waiting for conditions",
          "Airflow best practices — idempotent tasks, backfill with start_date, retry + retry_delay",
          "Airflow SLAs — sla_miss_callback, email alerts on SLA breach",
          "Prefect — @task and @flow decorators, deployments, work pools, schedules, caching",
          "Prefect artifacts — creating markdown/table/image artifacts for observability",
          "Dagster — software-defined assets, asset graph, jobs from assets, sensors for assets",
          "REST API ingestion — pagination (cursor, page number, offset), rate limit handling",
          "GraphQL API ingestion — querying APIs, batching, schema introspection",
          "CDC with Debezium — capturing PostgreSQL/MySQL WAL changes, Kafka Connect connector",
          "Batch vs event-driven ingestion — latency/cost trade-offs for different use cases",
          "Fivetran / Airbyte — managed SaaS connectors, custom connector development",
          "Webhook ingestion — receiving, validating signatures, exactly-once with idempotency keys",
          "Error handling in pipelines — dead-letter queues, alerting, PagerDuty integration",
          "Data lineage — OpenLineage spec, Marquez as lineage backend, Airflow OpenLineage plugin",
          "Testing data pipelines — unit testing transformation logic, integration tests end-to-end",
          "Observability for pipelines — task duration tracking, row count metrics, freshness SLAs",
          "Pipeline versioning — making backward-compatible changes, blue-green data pipeline deploys",
          "CI/CD for data pipelines — GitHub Actions, automated dbt CI (--defer, --select state:modified)",
        ],
        resources: [
          { label: "Airflow Official Docs", url: "https://airflow.apache.org/docs/" },
          { label: "Prefect Docs", url: "https://docs.prefect.io" },
          { label: "DataTalks.Club — DE Zoomcamp (free)", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp" },
        ],
      },
      {
        phase: 4,
        title: "Distributed Processing & Streaming",
        duration: "5–6 weeks",
        items: [
          "Apache Spark architecture — driver, executors, cluster manager (YARN/Kubernetes/Standalone)",
          "Spark RDDs — creation, transformation (map, filter, reduceByKey), action (collect, count, save)",
          "Spark DataFrames & SQL — createDataFrame, spark.sql(), DataFrame vs RDD performance",
          "PySpark — SparkSession, reading Parquet/JSON/CSV, UDFs (Python vs Pandas UDFs performance)",
          "Spark Window functions — partitionBy, orderBy, rowsBetween, rangeBetween",
          "Spark joins — broadcast join for small tables, sort-merge join, join skew handling (salting)",
          "Spark partitioning — repartition vs coalesce, optimal partition size (128MB–1GB)",
          "Databricks — Unity Catalog, Delta Live Tables, notebooks, auto-scaling clusters",
          "Delta Lake — ACID transactions on data lake, time travel (VERSION AS OF, TIMESTAMP AS OF)",
          "Delta Lake optimizations — Z-ordering, OPTIMIZE command, AUTO OPTIMIZE, VACUUM",
          "Apache Kafka — producers, consumers, topics, partitions, consumer groups, offsets",
          "Kafka configuration — replication factor, min.insync.replicas, acks=all for durability",
          "Kafka Connect — source connectors (DB, S3), sink connectors, SMT (Single Message Transform)",
          "Kafka Streams — KStream, KTable, windowed aggregations, joins, state stores",
          "ksqlDB — SQL over Kafka streams, persistent queries, materialized views",
          "Apache Flink — DataStream API, stateful processing, event time vs processing time",
          "Flink windowing — tumbling, sliding, session windows, watermarks for late data",
          "Streaming delivery guarantees — at-most-once, at-least-once, exactly-once semantics",
          "Schema Registry — Avro/Protobuf schemas, schema evolution (backward/forward compatibility)",
          "Apache Iceberg — open table format, hidden partitioning, schema evolution, row-level deletes",
          "Apache Hudi — upserts on data lake, Copy-on-Write vs Merge-on-Read storage types",
          "Lakehouse architecture — combining data lake flexibility with warehouse ACID guarantees",
        ],
        resources: [
          { label: "Spark Official Docs", url: "https://spark.apache.org/docs/latest/" },
          { label: "Confluent Kafka Tutorials (free)", url: "https://developer.confluent.io/tutorials/" },
          { label: "Delta Lake Docs", url: "https://docs.delta.io" },
        ],
      },
      {
        phase: 5,
        title: "Cloud, Infra & Best Practices",
        duration: "4–5 weeks",
        items: [
          "AWS Glue — serverless ETL, Glue Data Catalog (Hive metastore compatible), Crawlers",
          "AWS S3 — data lake storage, S3 Select for server-side filtering, lifecycle policies",
          "S3 storage classes — Standard, Intelligent-Tiering, Glacier for archival cost optimization",
          "AWS Athena — serverless SQL on S3 with Presto, partitioning for cost reduction",
          "AWS Lake Formation — row/column-level security, cross-account data sharing",
          "Google Cloud — GCS, Dataflow (Apache Beam managed), Pub/Sub, Cloud Composer",
          "Google BigQuery partitioned tables — date, integer range partitioning, partition expiration",
          "Azure — Azure Data Factory pipelines, ADLS Gen2, Synapse Analytics, Event Hubs",
          "Infrastructure as Code — Terraform for provisioning Redshift, S3, Glue, Kinesis",
          "Docker for data engineering — containerize Airflow, Spark jobs, dbt CLI runs",
          "Kubernetes for data — Spark on K8s, Airflow on K8s (KubernetesExecutor), Flink on K8s",
          "Data governance — data ownership, stewardship, data contracts between producers/consumers",
          "Data lineage — OpenLineage, Apache Atlas, column-level lineage in dbt",
          "PII handling — data masking (tokenization, format-preserving encryption), anonymization",
          "GDPR/CCPA compliance — right to erasure implementation, data retention policies",
          "Columnar storage formats — Parquet (row groups, column chunks, statistics, compression codecs)",
          "ORC vs Parquet — use cases, predicate pushdown, compression comparison",
          "Cost optimization — partition pruning, file size optimization (avoid too many small files)",
          "Data mesh architecture — domain-oriented data products, federated governance, self-serve",
          "Data contracts — schemas with version control, SLAs between producer and consumer teams",
          "Data observability — Monte Carlo, Soda Core — detecting data quality issues proactively",
          "Build an end-to-end portfolio project: ingestion → warehouse → dbt models → dashboard",
        ],
        resources: [
          { label: "AWS Glue Developer Guide", url: "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html" },
          { label: "Great Expectations Docs", url: "https://docs.greatexpectations.io" },
          { label: "DataTalks.Club Blog", url: "https://datatalks.club/blog.html" },
        ],
      },
    ],
  },
];

// ── Difficulty badge colors ────────────────────────────────────────────────
const difficultyColor: Record<string, string> = {
  "Beginner-friendly": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Intermediate":      "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Advanced":          "text-red-400 bg-red-400/10 border-red-400/20",
};

// ── PathCard Component ─────────────────────────────────────────────────────
interface PathCardProps {
  path: LearningPath;
  isOpen: boolean;
  onToggle: () => void;
  isPhaseComplete: (phaseIdx: number) => boolean;
  isPhaseUnlocked: (phaseIdx: number) => boolean;
  onTogglePhase: (phaseIdx: number) => void;
  stats: { completed: number; total: number; pct: number };
}

function PathCard({ path, isOpen, onToggle, isPhaseComplete, isPhaseUnlocked, onTogglePhase, stats }: PathCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: isOpen ? path.border : "rgba(255,255,255,0.06)",
        background: isOpen ? `linear-gradient(135deg, ${path.glow} 0%, transparent 60%), #161616` : "#161616",
        boxShadow: isOpen ? `0 0 40px ${path.glow}` : "none",
        transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s",
      }}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 sm:gap-5 p-4 sm:p-6 text-left group"
      >
        {/* Icon */}
        <div
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-0.5"
          style={{ background: `${path.color}18`, border: `1px solid ${path.color}40` }}
        >
          <path.Icon className="w-6 h-6" style={{ color: path.color }} />
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
              {path.title}
            </h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold", difficultyColor[path.difficulty])}>
              {path.difficulty}
            </span>
            {stats.completed === stats.total && stats.total > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full border font-semibold text-emerald-400 bg-emerald-400/10 border-emerald-400/20 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Complete
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3 leading-relaxed">{path.tagline}</p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {path.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> {path.phases.length} phases
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> {path.skills.length} core skills
            </span>
          </div>

          {/* Progress bar */}
          {stats.completed > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                <span>{stats.completed}/{stats.total} phases complete</span>
                <span>{stats.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ background: path.color }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 mt-1 text-gray-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-5 sm:space-y-6">
              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-5">
                {path.description}
              </p>

              {/* Skills */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-semibold">Skills you'll gain</p>
                <div className="flex flex-wrap gap-2">
                  {path.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1 rounded-full font-medium border"
                      style={{ color: path.color, borderColor: `${path.color}30`, background: `${path.color}0d` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Curriculum</p>
                {path.phases.map((phase, phaseIdx) => {
                  const complete = isPhaseComplete(phaseIdx);
                  const unlocked = isPhaseUnlocked(phaseIdx);

                  return (
                    <div
                      key={phase.phase}
                      className={cn(
                        "rounded-xl border p-4 sm:p-5 transition-all duration-300",
                        complete
                          ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                          : unlocked
                          ? "border-white/8 bg-black/20"
                          : "border-white/4 bg-black/10 opacity-60"
                      )}
                    >
                      {/* Phase header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                          )}
                          style={
                            complete
                              ? { background: "rgba(34,197,94,0.2)", color: "#22c55e" }
                              : unlocked
                              ? { background: `${path.color}20`, color: path.color }
                              : { background: "rgba(255,255,255,0.05)", color: "#4b5563" }
                          }
                        >
                          {complete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : !unlocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            phase.phase
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-semibold text-sm", complete ? "text-emerald-300" : unlocked ? "text-white" : "text-gray-500")}>
                            {phase.title}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {phase.duration}
                            {!unlocked && <span className="ml-2 text-gray-600">— Complete Phase {phaseIdx} first</span>}
                          </p>
                        </div>

                        {/* Mark complete button */}
                        {unlocked && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onTogglePhase(phaseIdx); }}
                            className={cn(
                              "shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                              complete
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10"
                            )}
                            title={complete ? "Mark phase incomplete" : "Mark phase complete"}
                          >
                            {complete ? (
                              <><CheckSquare className="w-3.5 h-3.5" /><span className="hidden sm:inline">Done</span></>
                            ) : (
                              <><Square className="w-3.5 h-3.5" /><span className="hidden sm:inline">Mark Done</span></>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Items list */}
                      <ul className="space-y-1.5 mb-4">
                        {phase.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle2
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: complete ? "#22c55e" : unlocked ? path.color : "#374151", opacity: complete ? 1 : 0.6 }}
                            />
                            <span className={cn(complete && "line-through text-gray-500")}>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Resources */}
                      {phase.resources.length > 0 && (
                        <div className="border-t border-white/5 pt-3">
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Recommended Resources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {phase.resources.map((r) => (
                              <a
                                key={r.url}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all group/link"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0 group-hover/link:text-primary transition-colors" />
                                {r.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Paths() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { user } = useUser();
  const { isPhaseComplete, isPhaseUnlocked, togglePhase, pathStats } = usePathProgress();

  useEffect(() => {
    document.title = "Dev Paths — 4ever Rooted";
    return () => { document.title = "4ever Rooted — Developer Learning Platform"; };
  }, []);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  // Count total items across all paths for the header stat
  const totalItems = PATHS.reduce((acc, p) => acc + p.phases.reduce((a, ph) => a + ph.items.length, 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono text-primary/70 border border-primary/20 bg-primary/5 px-3 sm:px-4 py-1.5 rounded-full mb-5 max-w-full overflow-hidden">
            <ArrowRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{PATHS.length} Structured Learning Paths · {totalItems}+ Topics</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
            Developer <span className="text-primary" style={{ textShadow: "0 0 30px rgba(0,243,255,0.4)" }}>Paths</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-2">
            Step-by-step curricula for every major engineering discipline. Each phase unlocks sequentially so you build on solid foundations.
          </p>
          {!user && (
            <p className="mt-3 text-xs text-gray-600">
              <a href="/auth" className="text-primary/60 hover:text-primary transition-colors underline underline-offset-2">Sign in</a> to save your progress to the cloud.
            </p>
          )}
        </motion.div>

        {/* Path Cards */}
        <div className="space-y-3 sm:space-y-4">
          {PATHS.map((path) => {
            const stats = pathStats(path.id, path.phases.length);
            return (
              <PathCard
                key={path.id}
                path={path}
                isOpen={openId === path.id}
                onToggle={() => toggle(path.id)}
                isPhaseComplete={(idx) => isPhaseComplete(path.id, idx)}
                isPhaseUnlocked={(idx) => isPhaseUnlocked(path.id, idx)}
                onTogglePhase={(idx) => togglePhase(path.id, idx)}
                stats={stats}
              />
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
