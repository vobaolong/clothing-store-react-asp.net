# Wearly — Clothing Store E-Commerce

A full-stack clothing store e-commerce platform built with **React + TypeScript** on the frontend and **ASP.NET Core (.NET 10)** on the backend, following **Clean Architecture** and **CQRS** patterns.

---

## Tech Stack

### Frontend

| Category             | Technology                                            |
| -------------------- | ----------------------------------------------------- |
| **Framework**        | React 19, TypeScript 6, Vite                          |
| **UI Library**       | Ant Design 6, Tailwind CSS 4                          |
| **State Management** | Redux Toolkit (global), React Query (server), Zustand |
| **Routing**          | React Router v7                                       |
| **Forms**            | React Hook Form + Zod                                 |
| **Realtime**         | SignalR (@microsoft/signalr)                          |
| **Charts**           | @ant-design/plots, Recharts                           |
| **Rich Text**        | Tiptap                                                |

### Backend

| Category         | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| **Runtime**      | .NET 10                                                       |
| **Architecture** | Clean Architecture (Domain, Application, Infrastructure, API) |
| **Patterns**     | CQRS with MediatR, FluentValidation, AutoMapper               |
| **Database**     | PostgreSQL, Entity Framework Core                             |
| **Auth**         | JWT Bearer (access token) + HttpOnly refresh cookie           |
| **Realtime**     | SignalR (WebSocket)                                           |
| **Payment**      | VNPay (redirect), Cash on Delivery (COD)                      |
| **File Storage** | Cloudinary (image upload)                                     |
| **Email**        | MailKit                                                       |

---

## Project Structure

```
clothing-store/
├── backend/
│   ├── ClothingStore.slnx
│   └── src/
│       ├── ClothingStore.Domain/          # Entities, enums, domain events
│       ├── ClothingStore.Application/     # CQRS commands/queries, handlers, validators
│       ├── ClothingStore.Infrastructure/  # EF Core DbContext, JWT, email, persistence
│       └── ClothingStore.API/             # REST controllers, middleware, SignalR hubs
├── frontend/
│   └── src/
│       ├── app/          # Store wiring, providers
│       ├── api/          # API client functions (Axios)
│       ├── components/   # Shared UI components
│       ├── features/     # Feature-based modules (auth, cart, checkout, orders, products, etc.)
│       ├── hooks/        # Custom React hooks
│       ├── layouts/      # App shell, admin shell
│       ├── routes/       # Route definitions
│       ├── services/     # Axios interceptors, SignalR connection
│       ├── state/        # Redux slices, auth session
│       ├── types/        # TypeScript interfaces/types
│       ├── constants/    # Enum maps, query keys, API endpoints
│       └── utils/        # Formatting, validation, helper utilities
└── ARCHITECTURE.md       # Detailed architecture guide
```

---

## Features

### Customer-facing

- **Authentication** — Register, login, forgot/reset password, email OTP verification
- **Product Catalog** — Browse by categories, search, filter, sort, pagination
- **Product Detail** — Variant selection (size/color), image gallery, reviews
- **Shopping Cart** — Add/remove items, quantity control, persistent storage
- **Checkout** — Address management, coupon application, COD or VNPay payment
- **Order Management** — Order history, order detail, cancellation (when allowed)
- **Reviews** — Create reviews from order detail page, view on product page
- **Wishlist** — Save favorite products
- **Profile** — Personal info, shipping addresses, change password
- **Notifications** — Real-time notifications via SignalR

### Admin

- **Dashboard** — Sales overview, charts, statistics
- **Product Management** — CRUD with variants, images, inventory
- **Category Management** — Nested categories with tree structure
- **Order Management** — View, update status, track history
- **Customer Management** — View customer details and purchase history
- **Coupon Management** — Create and manage discount coupons
- **Review Management** — Moderate product reviews
- **Banner Management** — Manage homepage banners

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [PostgreSQL](https://www.postgresql.org/) (15+)

### 1. Clone & Install

```bash
git clone https://github.com/vobaolong/clothing-store-react-asp.net.git
cd clothing-store

# Install frontend dependencies
cd frontend && pnpm install && cd ..
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb clothing_store
```

Configure the connection string in `backend/src/ClothingStore.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=clothing_store;Username=your_user;Password=your_password"
  }
}
```

Apply EF Core migrations:

```bash
cd backend/src/ClothingStore.API
dotnet ef database update
```

> **Note:** On first run, the API will auto-migrate and seed an admin user if `Startup:AutoMigrate` and `Startup:SeedAdmin` are enabled (default in development).
> Default admin credentials: `admin@wearly.local` / `Admin@123`

### 3. Run the Backend

```bash
cd backend/src/ClothingStore.API
dotnet run
```

The API starts at `https://localhost:5230`.
Swagger UI is available at `https://localhost:5230/swagger`.

### 4. Run the Frontend

```bash
cd frontend
pnpm dev
```

The app opens at `http://localhost:5173`.

---

## Configuration

Key configuration sections in `appsettings.json` / user secrets:

| Section                               | Description                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string                         |
| `Jwt:Secret`                          | JWT signing key (required in production)             |
| `Jwt:Issuer`                          | JWT issuer                                           |
| `Jwt:Audience`                        | JWT audience                                         |
| `VNPAY`                               | VNPay credentials (TmnCode, HashSecret, CallbackUrl) |
| `Cloudinary`                          | Cloudinary cloud name, API key, API secret           |
| `Email`                               | SMTP settings for MailKit                            |
| `Startup:AutoMigrate`                 | Auto-run EF migrations on startup                    |
| `Startup:SeedAdmin`                   | Seed default admin user on startup                   |

> Use `dotnet user-secrets` for local development secrets.

---

## API Overview

Base URL: `https://localhost:5230/api/v1`

All API responses follow a unified envelope:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

### Public Endpoints

| Method | Path                           | Description               |
| ------ | ------------------------------ | ------------------------- |
| POST   | `/api/v1/auth/register`        | Register a new account    |
| POST   | `/api/v1/auth/login`           | Login                     |
| POST   | `/api/v1/auth/forgot-password` | Send reset password email |
| POST   | `/api/v1/auth/reset-password`  | Reset password            |
| POST   | `/api/v1/auth/verify-otp`      | Verify email OTP          |
| GET    | `/api/v1/products`             | List products (paginated) |
| GET    | `/api/v1/products/{slug}`      | Product detail            |
| GET    | `/api/v1/categories`           | List categories           |

### Authenticated Customer Endpoints

| Method | Path                         | Description        |
| ------ | ---------------------------- | ------------------ |
| POST   | `/api/v1/orders`             | Place an order     |
| GET    | `/api/v1/orders`             | List my orders     |
| GET    | `/api/v1/orders/{id}`        | Order detail       |
| POST   | `/api/v1/orders/{id}/cancel` | Cancel an order    |
| GET    | `/api/v1/cart`               | Get cart items     |
| POST   | `/api/v1/cart`               | Add to cart        |
| GET    | `/api/v1/wishlist`           | Get wishlist items |
| POST   | `/api/v1/reviews`            | Create a review    |
| GET    | `/api/v1/profile`            | Get profile        |
| PUT    | `/api/v1/profile`            | Update profile     |

### Admin Endpoints

| Method | Path                               | Description               |
| ------ | ---------------------------------- | ------------------------- |
| GET    | `/api/v1/admin/products`           | List all products (admin) |
| POST   | `/api/v1/admin/products`           | Create a product          |
| PUT    | `/api/v1/admin/products/{id}`      | Update a product          |
| DELETE | `/api/v1/admin/products/{id}`      | Soft-delete a product     |
| GET    | `/api/v1/admin/orders`             | List all orders           |
| PUT    | `/api/v1/admin/orders/{id}/status` | Update order status       |
| GET    | `/api/v1/admin/customers`          | List customers            |
| GET    | `/api/v1/admin/coupons`            | List coupons              |
| POST   | `/api/v1/admin/coupons`            | Create a coupon           |
| PUT    | `/api/v1/admin/categories`         | Update a category         |

---

## Architecture Highlights

### Backend — Clean Architecture + CQRS

```
┌─────────────────────────────────────────────┐
│           ClothingStore.API                  │
│  (Controllers, Middleware, SignalR Hubs)    │
├─────────────────────────────────────────────┤
│         ClothingStore.Application           │
│  (Commands, Queries, Handlers, Validators)  │
├─────────────────────────────────────────────┤
│          ClothingStore.Domain               │
│  (Entities, Enums, Domain Events)           │
├─────────────────────────────────────────────┤
│       ClothingStore.Infrastructure          │
│  (EF Core, JWT, Email, Cloudinary)          │
└─────────────────────────────────────────────┘
```

- **Controllers** only dispatch commands/queries via `ISender` (MediatR) — no business logic.
- **Handlers** contain all business logic, with FluentValidation for input validation.
- **Pipelines**: Logging → Validation → Transaction (applied only to commands).
- **Queries** use `AsNoTracking()` and `ProjectTo<>` for read-optimized performance.
- **Domain events** are published after successful state changes.

### Frontend — Feature-based Architecture

```
src/
├── app/          # App bootstrap, store, providers
├── features/     # Auth, Cart, Checkout, Orders, Products, Reviews, etc.
├── components/   # Shared UI (header, footer, product card, etc.)
├── hooks/        # useSignalR, useWishlist, useNotifications, etc.
├── api/          # Axios-based API functions
├── services/     # API client with interceptors, SignalR service
├── state/        # Redux slices, auth session management
└── utils/        # Formatting, validation, helpers
```

- **Server state** is managed by React Query (TanStack Query).
- **Global client state** is managed by Redux Toolkit.
- **Local state** uses `useState` / `useReducer`.
- Axios interceptors handle JWT attachment and automatic refresh token flow.
- SignalR connection is established at app root with automatic reconnection.

### Realtime (SignalR)

- Hubs: `/hubs/notifications`
- Authenticated via JWT in query string.
- Users are grouped by `userId` for targeted notifications.
- Admin group `adminGroup` for broadcast notifications.

### Payment

- **VNPay**: Redirect-based payment. After success, VNPay calls back to `/api/v1/payments/vnpay-return` (bypasses JWT auth). Order status updated via domain events.
- **COD**: Order flow `Pending → Confirmed → Delivered`. Payment collected on delivery.

---

## Scripts

### Backend

| Command                                      | Description            |
| -------------------------------------------- | ---------------------- |
| `dotnet build backend/src/ClothingStore.API` | Build the API project  |
| `dotnet test`                                | Run backend tests      |
| `dotnet ef migrations add <Name>`            | Create a new migration |
| `dotnet ef database update`                  | Apply migrations       |

### Frontend

| Command           | Description              |
| ----------------- | ------------------------ |
| `pnpm dev`        | Start dev server         |
| `pnpm build`      | Production build         |
| `pnpm lint`       | Run ESLint               |
| `pnpm type-check` | TypeScript type checking |

---

## VNPay Test Card

Use the following test card for VNPay sandbox:

- **Bank**: NCB
- **Card Number**: 9704198526191432198
- **Cardholder**: NGUYEN VAN A
- **Issue Date**: 07/15
- **OTP**: 123456

---

## License

MIT
