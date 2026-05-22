# Architecture guide

## Frontend

The frontend is being migrated to a feature-sliced structure:

- `src/app`: app bootstrap, router, providers, store wiring.
- `src/shared`: cross-feature primitives (ui, hooks, lib, constants, services).
- `src/entities`: domain data contracts per bounded context.
- `src/features`: user/business actions (review, checkout, wishlist, cart, search).
- `src/widgets`: composed UI blocks used by pages/layouts.
- `src/pages`: route-level orchestration only.

### Migration rule

When moving files, keep compatibility exports to avoid big-bang breakage.

## Backend

The backend follows Clean Architecture + CQRS with MediatR:

- `ClothingStore.API`: transport concerns (routing, authz, mapping, response envelope).
- `ClothingStore.Application`: use-cases (commands/queries/handlers).
- `ClothingStore.Domain`: entities and domain enums.
- `ClothingStore.Infrastructure`: EF Core, persistence, integrations.

### Boundary rule

New API endpoints should call `ISender` use-cases whenever business logic is involved.

## Startup hardening

- Production requires explicit `Jwt:Secret`.
- Startup DB migrate/seed controlled by:
  - `Startup:AutoMigrate`
  - `Startup:SeedAdmin`
- VNPAY startup logs warn when required credentials are missing.
