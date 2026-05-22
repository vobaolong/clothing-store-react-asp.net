# Clothing Store Scaffold

## Project structure

- `backend/ClothingStore.slnx`
- `backend/src/ClothingStore.Domain` (entities)
- `backend/src/ClothingStore.Application` (CQRS commands/queries + MediatR handlers)
- `backend/src/ClothingStore.Infrastructure` (EF Core DbContext, JWT, persistence setup)
- `backend/src/ClothingStore.API` (REST endpoints, middleware, DI composition)
- `frontend` (React + TypeScript + Redux Toolkit + React Query)

## Run backend

1. Start PostgreSQL locally and create database `clothing_store`.
2. Update connection string in `backend/src/ClothingStore.API/appsettings.json` if needed.
3. Run:

```bash
cd backend/src/ClothingStore.API
dotnet run
```

API base URL: `https://localhost:5230/api`

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

## CQRS + MediatR flow

- Controllers only dispatch commands/queries via `ISender`.
- Queries (example: `GetProductsQuery`) return read models (`ProductDto`).
- Commands (example: `CreateProductCommand`, `PlaceOrderCommand`) mutate state and return identifiers.
- Handlers in Application layer contain business behavior.
- Infrastructure provides `IApplicationDbContext` implementation and database interaction.

## Seed data

Initial categories and products are seeded in `Infrastructure/Persistence/ApplicationDbContext.cs` via `HasData(...)`.

```bash
dotnet ef database update
```

## Refactor guardrails (must pass each phase)

- Backend:
  - `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj`
- Frontend:
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

### Smoke checklist

- Auth: login/register/forgot-reset password.
- Catalog: products list, product detail, search/filter/sort.
- Cart/Checkout: add-to-cart, coupon apply, checkout COD, checkout VNPAY redirect.
- Orders: order list, order detail, cancel order (when allowed).
- Reviews: create review from order detail and product detail rendering.
- Admin: product/category/order status management baseline flows.

### Frontend import convention

- New/updated code should prefer absolute imports with alias: `@/`.
- Relative imports are allowed for local siblings only.

Ngân hàng NCB
Số thẻ 9704198526191432198
Tên chủ thẻ NGUYEN VAN A
Ngày phát hành 07/15
Mật khẩu OTP 123456
