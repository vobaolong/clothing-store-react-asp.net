# Order Cancellation Request — Design Spec

Date: 2026-08-12
Status: Approved by user (verbal "ok")

## 1. Problem

Current cancel flow lets a user cancel an order directly (`PUT /orders/my/{id}/cancel`), with no admin oversight. Target: user submits a cancellation **request** with a reason; admin approves or rejects it. Order becomes Cancelled only after approval.

## 2. Decisions (confirmed with user)

| Decision | Choice |
|---|---|
| Admin UI placement | Tab inside existing Orders admin section (`Orders` \| `Cancellation Requests`) |
| User can create request when | Order is `Pending` or `Confirmed` (same as today's cancel rule) |
| Admin can accept when | Order is `Pending` or `Confirmed` at the moment of approval (revalidated backend-side) |
| Retry after reject | A single order may have **at most one** cancellation request for its entire lifetime |
| Admin direct cancel | `UpdateOrderStatusCommand` (admin Order Management) stays as-is; user-facing cancel endpoint replaced by request flow |
| Concurrency/transaction | Single DbContext scope per request; EF implicit transaction; optimistic status re-checks in handler |
| Notifications | Reuse `Notification` entity + `NotificationService` + SignalR + MediatR domain-event handlers |
| Storage | New dedicated table `CancellationRequests` |
| Tests | Backend: new xUnit test project. Frontend: new vitest + testing-library setup |
| i18n | Full keys in both `vi` and `en` translation.json |

## 3. Current architecture

```
Frontend: React 19 + Vite + TS, Antd v6, TanStack Query, react-hook-form + zod,
          i18next (vi/en), react-hot-toast, Redux (auth), SignalR realtime
Backend:  ASP.NET Core net10.0, Clean Architecture:
          ClothingStore.API (controllers, ApiExceptionMiddleware, SignalR hub,
                            NotificationService, UserContext) /
          ClothingStore.Application (MediatR CQRS, FluentValidation, domain-event handlers) /
          ClothingStore.Domain (entities, enums) /
          ClothingStore.Infrastructure (EF Core 10 + PostgreSQL, migrations)
Auth:     JWT bearer. User id from claims via UserContext.GetRequiredUserId().
          Admin via [Authorize(Roles = "Admin")] + User.IsAdmin.
```

## 4. Current cancel flow (to be replaced)

```
OrderDetailPage (user)
  → Modal.confirm "Hủy đơn?" → PUT /api/orders/my/{id}/cancel
  → OrdersController.CancelMyOrder → CancelMyOrderCommandHandler
  → if order.Status in {Shipping, Delivered, Cancelled} → reject
  → restock ProductVariants from order items
  → order.Status = Cancelled, add OrderStatusHistory(Cancelled)
  → SaveChanges
```

Order status lifecycle: `Pending → Confirmed → Shipping → Delivered`, plus `Cancelled`.
`Order.ChangeStatus(OrderStatus)` throws `InvalidOperationException` on invalid transitions.
Finally, note: **no backend test project exists** and **no frontend test framework is configured** — this feature introduces both.

## 5. New data model

New entity `CancellationRequest : BaseEntity` (inherits `Id`, `CreatedAt` — project convention):

| Column | Type | Notes |
|---|---|---|
| OrderId | Guid, FK → Orders | cascade delete |
| UserId | Guid, FK → Users | restrict/required |
| Reason | string | one of predefined keys |
| Note | string? | free text, used when Reason = Other |
| Status | string (enum) | see below |
| ReviewedBy | Guid? | admin user id |
| ReviewedAt | DateTime? | |
| RejectionReason | string? | required on reject |

Enum `CancellationRequestStatus { Pending, Accepted, Rejected }` (new file, string-converted like `OrderStatus`).

**Unique constraint:** `UNIQUE(OrderId)` — enforces "one request per order, ever", including after Rejected. DB-level duplicate prevention (Rule 9).

## 6. Backend design

### New queries/commands (MediatR, matching existing handler style)

1. `CreateCancellationRequestCommand(UserId, OrderId, Reason, Note)`
   - Validates: order exists & belongs to `UserId`; order status `Pending`/`Confirmed`; no existing request for order (index enforced).
   - Creates request with `Status = Pending`. No stock changes.
2. `ApproveCancellationRequestCommand(AdminId, RequestId)`
   - Loads request; must be `Pending` (else fail — concurrent-admins case).
   - Loads **current** order from DB; status must be `Pending`/`Confirmed` (else fail gracefully — "order no longer cancellable").
   - Good path: re-stock variants (logic ported unchanged from `CancelMyOrderCommandHandler`), `order.ChangeStatus(Cancelled)` (valid transition, emits `OrderStatusChangedDomainEvent`), add `OrderStatusHistory(Cancelled)`, set request `Accepted` + `ReviewedBy`/`ReviewedAt`. Save in same scope → implicit transaction.
3. `RejectCancellationRequestCommand(AdminId, RequestId, RejectionReason)`
   - Request must be `Pending`; rejection reason required (throw `ArgumentException` → 400).
   - Sets `Rejected` + `ReviewedBy`/`ReviewedAt` + `RejectionReason`. Order untouched.
4. `GetMyCancellationRequestQuery(UserId, OrderId)` — user-side status fetch.
5. `GetAdminCancellationRequestsQuery(statusFilter?)` — list, joining order + user info (customer name/email).
6. `GetAdminCancellationRequestDetailQuery(RequestId)` — full detail incl. order info, customer, review info.

### Deleted

- `CancelMyOrderCommand` + handler, `PUT /orders/my/{id}/cancel` endpoint, frontend `cancelMyOrder` API fn.

### API surface (project routing conventions — `/api/orders/my`, `/api/admin/orders`)

```
POST /api/orders/my/{orderId}/cancellation-request   (user, own order)
GET  /api/orders/my/{orderId}/cancellation-request   (user, own order)
GET  /api/admin/cancellation-requests?status=        (admin)
GET  /api/admin/cancellation-requests/{requestId}    (admin)
POST /api/admin/cancellation-requests/{requestId}/approve  (admin, body empty)
POST /api/admin/cancellation-requests/{requestId}/reject   (admin, body { rejectionReason })
```

### Error conventions (reuse ApiExceptionMiddleware)

- `KeyNotFoundException` → 404 (order/request not found)
- `UnauthorizedAccessException` → 401 (ownership violation)
- `InvalidOperationException` → 400 (wrong status, duplicate, concurrent)
- `ArgumentException` → 400 (missing rejection reason, invalid reason)

### Order detail DTO change

`OrderDetailDto` gains `CancellationRequestStatus?` + `RejectionReason?` (from latest request, no separate API call needed on the page).

### Notifications (reuse existing domain-event pattern)

- `CancellationRequestCreatedDomainEvent` → `SendToAdminsAsync("Yêu cầu hủy đơn mới", ...)` with order id, reason.
- Approve → order `Cancelled` change already triggers `OrderStatusChangedDomainEvent` → customer gets `OrderCancelled` notification (existing handler). No new event needed.
- `CancellationRequestRejectedDomainEvent` → `SendToUserAsync("Yêu cầu hủy bị từ chối", reason, ...)`.

## 7. Frontend design

### User side

- `OrderDetailPage`:
  - Reads new fields `cancellationRequestStatus` / `rejectionReason` from `GetMyOrderDetail`.
  - Cancel button visible only when order is `Pending`/`Confirmed` **and** no request exists.
  - When a request exists, replace button with a status alert:
    - `Pending` → "Yêu cầu hủy đang chờ admin duyệt"
    - `Accepted` → "Đã duyệt. Đơn hàng đã bị hủy" (timeline already shows Cancelled)
    - `Rejected` → "Yêu cầu bị từ chối. Lý do: {reason}"
- `CancelOrderModal` (new component, Antd Modal + Radio.Group):
  - 6 predefined reasons (i18n keys, vi+en): changed mind / ordered by mistake / better price elsewhere / delivery too slow / no longer need / other.
  - Reason required; when `Other` selected, show required textarea.
  - Submit disabled until valid; loading state; double-submit protected via mutation `isPending` + button disable; toast success/error; invalidates order-detail + orders queries; modal closes only after success.

### Admin side

- `AdminOrdersSection`: add Tabs — `Orders` (existing content) | `Cancellation Requests` (new).
- `AdminCancellationRequestsTable`: Request ID (short), Order short id, Customer (name/email), Order status tag, Reason, CreatedAt, Request status tag.
- `AdminCancellationRequestModal`: detail — order info (id, total, status, dates), customer, reason, note, request status, created/reviewed timestamps, reviewedBy; actions:
  - Accept → Antd `Modal.confirm` → POST approve → toast → close.
  - Reject → nested modal with required textarea → POST reject.
  - Reload list after action; refresh detail query.
- New API fns + endpoint constants + query keys.

## 8. Testing

### Backend (new project `ClothingStore.Tests`, xUnit, net10.0)

Reference `ClothingStore.Application` + `ClothingStore.Domain`. Use `Microsoft.EntityFrameworkCore.InMemory` package. Cover:

- Create: success (Pending created), order not found / not owned (403→401 semantics), ineligible status (Shipping/Delivered → 400), duplicate request (second create fails — logic and index).
- Approve: success (order Cancelled, status history added, variant restocked, request Accepted + reviewed fields); request not Pending → fail; order no longer Pending/Confirmed (e.g. already Shipping) → fail; order unchanged on failure.
- Reject: success (Rejected + reason + reviewed fields, order unchanged), missing reason → fail, request not Pending → fail.
- Concurrency: two approves on same request — second fails.

Data access helper: in-memory context seeded per test.

### Frontend (new vitest + @testing-library/react)

- Modal: renders, submit disabled until reason chosen.
- Other → textarea required.
- Submit → loading state, no double-submit, success toast + query invalidation, error toast on failure.
- Page: cancel button hidden when request exists (Pending/Accepted/Rejected variants show correct status text).

## 9. Files changed

Backend:
- `Domain/Enums/OrderEnums.cs` — add `CancellationRequestStatus` enum (new file `CancellationRequestStatus.cs`)
- `Domain/Entities/CancellationRequest.cs` — new
- `Infrastructure/Persistence/ApplicationDbContext.cs` — DbSet + config
- `Application/Common/Interfaces/IApplicationDbContext.cs` — DbSet
- `Infrastructure/Migrations/*` — new migration
- `Application/Orders/Commands/` — `CancelMyOrderCommand(+Handler)` deleted; `CreateCancellationRequestCommand`, `ApproveCancellationRequestCommand`, `RejectCancellationRequestCommand` (+handlers) added
- `Application/Orders/Queries/` — `GetMyCancellationRequestQuery`, `GetAdminCancellationRequestsQuery`, `GetAdminCancellationRequestDetailQuery` (+handlers)
- `Application/Orders/OrderDto.cs` — DTO changes
- `Application/Orders/Queries/GetMyOrderDetailQuery.cs` — include request fields
- `Domain/Events/` — 2 new events; `Application/Notifications/Handlers/` — 2 new handlers
- `API/Controllers/OrdersController.cs` — 2 new endpoints, remove cancel
- `API/Controllers/AdminOrdersController.cs` — 4 new endpoints
- `ClothingStore.Tests/` — new test project

Frontend:
- `types/order.type.ts` — new fields
- `api/orders-api.ts` — add request fns, remove `cancelMyOrder`
- `constants/api-endpoints.constant.ts`, `constants/query-keys.constant.ts`
- `pages/OrderDetailPage.tsx` — button/status alert logic
- `components/order/CancelOrderModal.tsx` — new
- `components/admin/admin-section/AdminOrdersSection.tsx` — tabs
- `components/admin/admin-table/AdminCancellationRequestsTable.tsx` — new
- `components/admin/admin-modal/AdminCancellationRequestModal.tsx` — new
- `public/locales/{vi,en}/translation.json` — new keys
- Test setup: `vitest.config`, `src/test/` mocks, `* .test.tsx` files

## 10. Risks & mitigations

- **Double restock**: stock is restored only in approve handler; removed from old cancel command. Admin direct cancel (`UpdateOrderStatusCommand`) still restocks independently — no shared path, no double-restock.
- **One request per order, ever**: after a reject the user cannot request again (business rule, explicit). If that proves wrong, drop the UNIQUE index.
- **Breaking API change**: removing `PUT /orders/my/{id}/cancel` — same release as frontend change, acceptable.
- **PostgreSQL migration**: run `dotnet ef migrations add`, verify SQL (filtered/unique index syntax).
- **New test infra**: version-matched packages for net10.0; first-ever tests in this repo.