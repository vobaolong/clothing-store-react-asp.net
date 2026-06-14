# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project: Wearly — Clothing Store E-Commerce

### Tech Stack

**Frontend:** React 19, TypeScript 6, Vite, Ant Design 6, Tailwind CSS 4, Redux Toolkit, React Query (TanStack Query), Zustand, React Router v7, React Hook Form + Zod, Axios, SignalR, Tiptap

**Backend:** .NET 10, Clean Architecture (4 layers: Domain, Application, Infrastructure, API), CQRS with MediatR, FluentValidation, AutoMapper, Entity Framework Core, PostgreSQL, JWT Bearer + HttpOnly refresh cookie, SignalR

### Project Structure

```
├── backend/src/
│   ├── ClothingStore.Domain/        # Entities, enums, domain events
│   ├── ClothingStore.Application/   # CQRS commands/queries, handlers, validators
│   ├── ClothingStore.Infrastructure/# EF Core DbContext, JWT, email, persistence
│   └── ClothingStore.API/           # REST controllers, middleware, SignalR hubs
├── frontend/src/
│   ├── api/         # Axios-based API client functions
│   ├── app/         # Store wiring, providers
│   ├── components/  # Shared UI components (auth, product, checkout, admin, etc.)
│   ├── constants/   # Enum maps, query keys, API endpoints
│   ├── context/     # React context providers
│   ├── data/        # Static data (measurement presets)
│   ├── enums/       # TypeScript enums
│   ├── hooks/       # Custom React hooks (useSignalR, useWishlist, etc.)
│   ├── layouts/     # App shell, admin shell
│   ├── routes/      # Route definitions
│   ├── services/    # Axios interceptors, SignalR connection
│   ├── state/       # Redux slices, auth session
│   ├── types/       # TypeScript interfaces/types
│   └── utils/       # Formatting, validation, helpers
└── README.md        # Full documentation
```

### Architecture Rules

**Backend:**

- Controllers dispatch commands/queries via MediatR's `ISender` — NO business logic in controllers.
- Handlers (Application layer) contain all business logic.
- Pipelines: Logging → Validation → Transaction (commands only).
- Queries use `AsNoTracking()` + `ProjectTo<>` for read optimization.
- Domain events publish after successful state changes.
- All API responses follow envelope: `{ success, data, message }`.
- API base: `/api/v1`

**Frontend:**

- Server state → React Query. Global client state → Redux Toolkit. Local → useState/useReducer.
- Axios interceptors handle JWT attachment + refresh token flow.
- Feature-based component organization under `components/` (not `features/`).
- SignalR connection established at app root with auto-reconnect.

### Database & Auth

- **Database:** PostgreSQL, EF Core, migrations in Infrastructure
- **Auth:** JWT access token + HttpOnly refresh cookie

### Commands

**Backend:**

- `dotnet build backend/src/ClothingStore.API` — Build
- `dotnet test` — Run tests
- `dotnet ef migrations add <Name>` — New migration (from `ClothingStore.API/`)
- `dotnet ef database update` — Apply migrations
- `dotnet run --project backend/src/ClothingStore.API` — Run API

**Frontend:**

- `pnpm dev` — Start dev server (from `frontend/`)
- `pnpm build` — Production build
- `pnpm lint` — ESLint
- `pnpm type-check` — TypeScript type checking

### Conventions

- **Naming:** Components → PascalCase, files → kebab-case (frontend), C# → PascalCase
- **API paths:** camelCase (e.g., `/api/v1/admin/products`, `/api/v1/auth/login`)
- **Validation:** FluentValidation (backend), Zod schemas (frontend)
- **Payments:** VNPay (redirect-based) + COD
- **State management:** Redux Toolkit for global client state, React Query for server state, Zustand for lightweight local stores
