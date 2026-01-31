# Enthousiazein - Personal Dashboard

A full-stack personal productivity dashboard built with Next.js 15 and Convex, consolidating task management, notes, journaling, wellness tracking, and more into a unified platform.

**Live Site:** https://www.enthousiazein.me

## Tech Stack

### Frontend
- **Framework:** Next.js 15.5.9 (App Router with Turbopack)
- **UI:** React 19, Shadcn/ui + Radix UI primitives, Tailwind CSS
- **State:** Zustand (client), Convex (server)
- **Forms:** React Hook Form + Zod validation
- **Rich Text:** Tiptap editor with extensions
- **Data Tables:** TanStack React Table
- **Drag & Drop:** dnd-kit

### Backend
- **Database/BaaS:** Convex (real-time sync)
- **Auth:** Clerk (Google OAuth)
- **AI:** Ollama integration (local LLM)

## Project Structure

```
app/
├── page.tsx                    # Login page
├── providers.tsx               # Clerk + Convex providers
├── api/ai-chat/route.ts        # Ollama streaming endpoint
└── dashboard/                  # Protected routes (37 pages)
    ├── page.tsx                # Main dashboard
    ├── components/             # Dashboard-specific components
    │   ├── tasks/              # Task management
    │   ├── sidebar/            # Navigation
    │   └── command-palette/    # Global search
    ├── tasks/                  # Full task management
    ├── notes/                  # Notes app
    ├── creativity/             # Beliefs, intentions, focus blocks
    ├── journal/                # Journal entries
    ├── plan/                   # Schedule planning
    ├── timer/                  # Pomodoro timer
    ├── wellness/               # Health tracking
    └── [other features]/

convex/                         # Backend (~4500 lines)
├── schema.ts                   # Data model definition
├── tasks.ts                    # Task CRUD (436 lines)
├── recurringTasks.ts           # Recurring task scheduling
├── recurringTasksHelpers.ts    # Complex recurrence logic (532 lines)
├── users.ts                    # User management + timezone
├── notes.ts, projects.ts, etc. # Feature modules (31 total)
├── crons.ts                    # Hourly scheduled jobs
└── http.ts                     # Clerk webhooks

components/ui/                  # Shadcn components (40+)
hooks/                          # Custom React hooks
lib/                            # Utilities (date, formatting)
```

## Key Patterns

### Data Access
```typescript
// Queries - real-time sync
const tasks = useQuery(api.tasks.allActiveTasks);

// Mutations - type-safe
const createTask = useMutation(api.tasks.create);
await createTask({ name, status: "todo" });
```

### Authentication
- Clerk handles UI and JWT tokens
- Convex syncs user data via webhooks
- Middleware protects `/dashboard/*` routes
- Use `getCurrentUserOrThrow()` in Convex mutations

### Timezone Handling
- User timezone stored in DB (default: America/Denver)
- Use `dayjs` with timezone plugin for conversions
- Cron jobs run at 6am user local time
- See `lib/date.utils.ts` for utilities

### Task System
- Statuses: `todo`, `in_progress`, `done`, `backlog`, `archived`
- Priorities: `low`, `normal`, `high`
- Recurring tasks: "schedule" (fixed) or "completion" (triggered)
- Parent-child hierarchies supported

## Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Run tests (Vitest)
npm run test:watch   # Watch mode
```

## Environment Variables

```
CONVEX_DEPLOYMENT=dev:utmost-labrador-614
NEXT_PUBLIC_CONVEX_URL=https://utmost-labrador-614.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
```

## Important Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Complete data model |
| `convex/tasks.ts` | Task CRUD operations |
| `convex/recurringTasksHelpers.ts` | Recurring task logic |
| `convex/users.ts` | User management + timezone |
| `app/api/ai-chat/route.ts` | Ollama AI streaming |
| `middleware.ts` | Auth route protection |
| `lib/date.utils.ts` | Date utilities (tested) |

## Features

- **Tasks:** Full task management with recurring support, priorities, due dates
- **Projects:** Task organization with status tracking
- **Notes:** Rich text note creation and search
- **Creativity:** Beliefs, intentions, focus blocks, statements
- **Timer:** Pomodoro/tithe sessions with history
- **Planning:** Activity-based schedules with drag-and-drop
- **Wellness:** Sleep, water intake, exercise tracking
- **Journal:** Typed journal entries
- **AI Chat:** Local LLM conversations via Ollama
- **Galaxy Defense:** Game enemy/stage database

## Conventions

- Use `"use client"` for interactive components
- Toast notifications via Sonner (`toast.success()`, `toast.error()`)
- Path aliases: `@/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`
- Real-time updates automatic via Convex subscriptions
- Table state (sorting, filters) persisted to DB via `useTableState` hook
