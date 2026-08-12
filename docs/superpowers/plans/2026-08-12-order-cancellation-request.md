# Order Cancellation Request — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace direct user order-cancel with a Cancellation Request → Admin Review → Approve/Reject workflow, end-to-end across React, .NET backend, and PostgreSQL.

**Architecture:** MediatR CQRS handlers in ClothingStore.Application backed by EF Core; new `CancellationRequest` entity (one per order, UNIQUE index); request status rides in `OrderDetailDto`; admin reviews via new tab in `AdminOrdersSection`; notifications reuse existing `NotificationService` + SignalR domain-event handlers.

**Tech Stack:** ASP.NET Core net10.0, EF Core 10 + Npgsql, MediatR, FluentValidation, AutoMapper; React 19 + Vite + TS, Antd v6, TanStack Query, react-hook-form + zod, i18next; xUnit + InMemory EF; vitest + @testing-library/react.

## Global Constraints

- net10.0 everywhere; EF Core / Npgsql / MediatR / FluentValidation versions pinned as in existing csproj (10.0.7 / 10.0.1 / 14.1.0 / 12.1.1).
- Do NOT introduce new dependencies beyond: test-only `Microsoft.EntityFrameworkCore.InMemory` (10.0.7), vitest, @testing-library/react, jsdom (frontend devDeps).
- Follow existing code style: `DateTime.UtcNow`, primary constructors, records for DTOs/commands, `Order.ChangeStatus()` for transitions, `ApiResponse` envelope via `BaseApiController`, `ApiExceptionMiddleware` for error mapping.
- Auth: user id from `UserContext.GetRequiredUserId()`; admin via `[Authorize(Roles = "Admin")]`.
- Backend is source of truth: approve handler re-reads the order from DB and re-validates status; frontend flags are UX only.
- No frontend test framework exists; vitest setup is part of Task 7 (verify setup in Task 1 first).
- Reason strings stored as keys (`CHANGED_MIND`, `ORDERED_BY_MISTAKE`, `BETTER_PRICE`, `DELIVERY_TOO_SLOW`, `NO_LONGER_NEED`, `OTHER`), rendered via i18n.
- English replies in commit messages (repo convention: `feat/refactor/docs` prefixes).

---

### Task 1: Verify build & test tooling

**Files:**
- Create: `ClothingStore.Tests/ClothingStore.Tests.csproj`, `ClothingStore.Tests/TestDb.cs`
- Modify: `clothing-store.sln` (add project)

**Interfaces:**
- Produces: `TestDb.Create()` → `ApplicationDbContext` (InMemory, per-test instance); used by all backend test tasks.

- [ ] **Step 1: Baseline build**

Run: `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj`
Expected: builds (0 errors).

- [ ] **Step 2: Create test project**

```bash
cd "backend"
dotnet new xunit -n ClothingStore.Tests -o src/ClothingStore.Tests --framework net10.0
dotnet sln ../clothing-store.sln add src/ClothingStore.Tests/ClothingStore.Tests.csproj
dotnet add src/ClothingStore.Tests/ClothingStore.Tests.csproj reference src/ClothingStore.Application/ClothingStore.Application.csproj src/ClothingStore.Domain/ClothingStore.Domain.csproj
dotnet add src/ClothingStore.Tests/ClothingStore.Tests.csproj package Microsoft.EntityFrameworkCore.InMemory --version 10.0.7
```

Delete generated `UnitTest1.cs`.

- [ ] **Step 3: Write TestDb helper**

`ClothingStore.Tests/TestDb.cs`:

```csharp
using ClothingStore.Domain.Entities;
using ClothingStore.Infrastructure.Persistence;

namespace ClothingStore.Tests;

public static class TestDb
{
    public static ApplicationDbContext Create()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"test-{Guid.NewGuid():N}")
            .Options;
        return new ApplicationDbContext(options);
    }
}
```

- [ ] **Step 4: Add smoke test**

`ClothingStore.Tests/TestDbTests.cs`:

```csharp
using ClothingStore.Tests;
using Xunit;

namespace ClothingStore.Tests;

public class TestDbTests
{
    [Fact]
    public void Create_Returns_DbContext()
    {
        using var db = TestDb.Create();
        Assert.NotNull(db);
    }
}
```

- [ ] **Step 5: Run tests**

Run: `dotnet test backend/src/ClothingStore.Tests/ClothingStore.Tests.csproj`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/src/ClothingStore.Tests clothing-store.sln
git commit -m "test: add xUnit test project with in-memory DB helper"
```

---

### Task 2: Domain — enum + entity + DbContext + migration

**Files:**
- Create: `backend/src/ClothingStore.Domain/Enums/CancellationRequestStatus.cs`, `backend/src/ClothingStore.Domain/Entities/CancellationRequest.cs`
- Modify: `backend/src/ClothingStore.Infrastructure/Persistence/ApplicationDbContext.cs` (DbSet + `ConfigureCancellationRequest` + call in `OnModelCreating`), `backend/src/ClothingStore.Application/Common/Interfaces/IApplicationDbContext.cs` (DbSet)
- Migration generated via `dotnet ef`

**Interfaces:**
- Produces: `CancellationRequestStatus { Pending, Accepted, Rejected }`; entity `CancellationRequest : BaseEntity` with `OrderId`, `UserId`, `Reason`, `Note`, `Status`, `ReviewedBy`, `ReviewedAt`, `RejectionReason`; `context.CancellationRequests` DbSet; `context.Database.CanConnectAsync` works against migration.

- [ ] **Step 1: Write enum**

`backend/src/ClothingStore.Domain/Enums/CancellationRequestStatus.cs`:

```csharp
namespace ClothingStore.Domain.Enums;

public enum CancellationRequestStatus
{
    Pending,
    Accepted,
    Rejected,
}
```

- [ ] **Step 2: Write entity**

`backend/src/ClothingStore.Domain/Entities/CancellationRequest.cs`:

```csharp
using ClothingStore.Domain.Enums;

namespace ClothingStore.Domain.Entities;

public class CancellationRequest : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Note { get; set; }
    public CancellationRequestStatus Status { get; set; } = CancellationRequestStatus.Pending;
    public Guid? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? RejectionReason { get; set; }
}
```

- [ ] **Step 3: Register DbSet in interface**

`backend/src/ClothingStore.Application/Common/Interfaces/IApplicationDbContext.cs` — add after `DbSet<OrderStatusHistory> OrderStatusHistories { get; }`:

```csharp
DbSet<CancellationRequest> CancellationRequests { get; }
```

- [ ] **Step 4: Configure in ApplicationDbContext**

Add `public DbSet<CancellationRequest> CancellationRequests => Set<CancellationRequest>();` near `OrderStatusHistories` line. In `OnModelCreating` add `ConfigureCancellationRequest(modelBuilder);` next to `ConfigureOrder(...)`. Add method (match `ConfigureOrder` style — status string converter + unique index):

```csharp
private static void ConfigureCancellationRequest(ModelBuilder modelBuilder)
{
    var statusConverter = new ValueConverter<CancellationRequestStatus, string>(
        v => v.ToString(),
        v => Enum.Parse<CancellationRequestStatus>(v, true)
    );
    modelBuilder.Entity<CancellationRequest>(e =>
    {
        e.Property(x => x.Status).HasConversion(statusConverter);
        e.HasIndex(x => x.OrderId).IsUnique();
        e.HasOne(x => x.Order)
            .WithMany()
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
        e.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    });
}
```

- [ ] **Step 5: Generate migration**

Run: `cd backend/src/ClothingStore.API && dotnet ef migrations add AddCancellationRequests` (uses existing `ApplicationDbContextFactory`/Npgsql).
Expected: new migration file under `backend/src/ClothingStore.Infrastructure/Migrations/`.

- [ ] **Step 6: Build**

Run: `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add backend/src/ClothingStore.Domain backend/src/ClothingStore.Infrastructure backend/src/ClothingStore.Application/Common/Interfaces
git commit -m "feat: add CancellationRequest entity, enum, and migration"
```

---

### Task 3: User create — command + handler + endpoint + notifications

**Files:**
- Create: `backend/src/ClothingStore.Application/Orders/Commands/CreateCancellationRequestCommand.cs`, `backend/src/ClothingStore.Domain/Events/CancellationRequestCreatedDomainEvent.cs`, `backend/src/ClothingStore.Application/Notifications/Handlers/CancellationRequestCreatedEventHandler.cs`
- Modify: `backend/src/ClothingStore.API/Controllers/OrdersController.cs`
- Delete: `backend/src/ClothingStore.Application/Orders/Commands/CancelMyOrderCommand.cs`, `CancelMyOrderCommandHandler.cs`

**Interfaces:**
- Consumes: `CancellationRequest` entity, `CancellationRequestStatus` (Task 2).
- Produces: `CreateCancellationRequestCommand(Guid UserId, Guid OrderId, string Reason, string? Note) : IRequest<Guid>`; `POST /api/orders/my/{id}/cancellation-request` (user, own order); `CancellationRequestCreatedDomainEvent(CancellationRequest Request) : INotification`. Throws: `KeyNotFoundException` (order), `UnauthorizedAccessException` (not owned), `InvalidOperationException` (status not cancellable / duplicate).

- [ ] **Step 1: Write command**

```csharp
using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record CreateCancellationRequestCommand(
    Guid UserId,
    Guid OrderId,
    string Reason,
    string? Note = null
) : IRequest<Guid>;
```

- [ ] **Step 2: Write handler**

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class CreateCancellationRequestCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateCancellationRequestCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateCancellationRequestCommand request,
        CancellationToken cancellationToken
    )
    {
        var order = await context.Orders.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new KeyNotFoundException("Order not found.");

        if (order.UserId != request.UserId)
            throw new UnauthorizedAccessException("You can only request cancellation for your own orders.");

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            throw new InvalidOperationException("You can only request cancellation before shipping starts.");

        var exists = await context.CancellationRequests.AsNoTracking()
            .AnyAsync(r => r.OrderId == request.OrderId, cancellationToken);
        if (exists)
            throw new InvalidOperationException("A cancellation request already exists for this order.");

        var cancellationRequest = new CancellationRequest
        {
            OrderId = order.Id,
            UserId = order.UserId,
            Reason = request.Reason,
            Note = request.Note,
            Status = CancellationRequestStatus.Pending,
        };
        cancellationRequest.AddDomainEvent(new CancellationRequestCreatedDomainEvent(cancellationRequest));
        context.CancellationRequests.Add(cancellationRequest);
        await context.SaveChangesAsync(cancellationToken);

        return cancellationRequest.Id;
    }
}
```

- [ ] **Step 3: Write domain event**

`backend/src/ClothingStore.Domain/Events/CancellationRequestCreatedDomainEvent.cs`:

```csharp
using ClothingStore.Domain.Entities;
using MediatR;

namespace ClothingStore.Domain.Events;

public record CancellationRequestCreatedDomainEvent(CancellationRequest Request) : INotification;
```

- [ ] **Step 4: Write notification handler** (match `OrderCreatedEventHandler` shape — catch + Debug.WriteLine, Vietnamese strings, `SendToAdminsAsync`):

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Notifications.Handlers;

public class CancellationRequestCreatedEventHandler(
    IApplicationDbContext context,
    INotificationService notificationService
) : INotificationHandler<CancellationRequestCreatedDomainEvent>
{
    public async Task Handle(
        CancellationRequestCreatedDomainEvent notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var request = notification.Request;
            var order = await context.Orders.AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
            if (order is null) return;

            var shortId = order.Id.ToString("N")[..8].ToUpperInvariant();
            await notificationService.SendToAdminsAsync(
                "Yêu cầu hủy đơn mới",
                $"Khách hàng yêu cầu hủy đơn {shortId}. Vui lòng xem xét.",
                NotificationType.System,
                new { orderId = order.Id, requestId = request.Id, reason = request.Reason },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[CancellationRequestCreatedEventHandler] {ex}");
        }
    }
}
```

- [ ] **Step 5: Update OrdersController** — remove `CancelMyOrder` action + `PUT my/{id}/cancel`; add:

```csharp
[HttpPost("my/{id:guid}/cancellation-request")]
public async Task<IActionResult> CreateCancellationRequest(
    [FromBody] CreateCancellationRequestRequest request,
    Guid id,
    CancellationToken ct
)
{
    var userId = userContext.GetRequiredUserId();
    var requestId = await sender.Send(
        new CreateCancellationRequestCommand(userId, id, request.Reason, request.Note),
        ct
    );
    return Ok(requestId, "Cancellation request submitted.");
}
```

(Record `CreateCancellationRequestRequest(string Reason, string? Note)` at file bottom next to `PlaceOrderRequest`.)

- [ ] **Step 6: Delete old cancel command files**

```bash
rm backend/src/ClothingStore.Application/Orders/Commands/CancelMyOrderCommand.cs backend/src/ClothingStore.Application/Orders/Commands/CancelMyOrderCommandHandler.cs
```

- [ ] **Step 7: Build**

Run: `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj`
Expected: 0 errors (no other references to `CancelMyOrder*` remain — grep to confirm).

- [ ] **Step 8: Commit**

```bash
git add backend/src/ClothingStore.Application backend/src/ClothingStore.Domain backend/src/ClothingStore.API/Controllers/OrdersController.cs
git commit -m "feat: add user cancellation request creation, remove direct cancel"
```

---

### Task 4: User create — tests

**Files:**
- Create: `backend/src/ClothingStore.Tests/Orders/CreateCancellationRequestTests.cs`

**Interfaces:**
- Consumes: `TestDb` (Task 1), `CreateCancellationRequestCommand` + handler (Task 3).

- [ ] **Step 1: Write tests** — seed user+order per test via `TestDb.Create()`:

```csharp
using ClothingStore.Application.Orders.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Tests;
using Xunit;

namespace ClothingStore.Tests.Orders;

public class CreateCancellationRequestTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid OtherUserId = Guid.NewGuid();

    private static (ApplicationDbContext db, Order order) Seed(OrderStatus status)
    {
        var db = TestDb.Create();
        db.Users.Add(new User { Id = UserId, Email = "a@a.com", FullName = "A" });
        db.Users.Add(new User { Id = OtherUserId, Email = "b@b.com", FullName = "B" });
        var order = new Order { UserId = UserId, Status = status };
        db.Orders.Add(order);
        db.SaveChanges();
        return (db, order);
    }

    private static async Task<Guid> CreateAsync(
        ApplicationDbContext db,
        Guid orderId,
        Guid userId = UserId
    )
    {
        var handler = new CreateCancellationRequestCommandHandler(db);
        return await handler.Handle(
            new CreateCancellationRequestCommand(userId, orderId, "CHANGED_MIND", null),
            CancellationToken.None
        );
    }

    [Fact]
    public async Task Create_Success_ReturnsRequestId()
    {
        var (db, order) = Seed(OrderStatus.Pending);
        var id = await CreateAsync(db, order.Id);
        Assert.NotEqual(Guid.Empty, id);
        var saved = await db.CancellationRequests.FindAsync(id);
        Assert.NotNull(saved);
        Assert.Equal(CancellationRequestStatus.Pending, saved!.Status);
        Assert.Equal("CHANGED_MIND", saved.Reason);
        Assert.Equal(UserId, saved.UserId);
    }

    [Fact]
    public async Task Create_ConfirmedOrder_Allows()
    {
        var (db, order) = Seed(OrderStatus.Confirmed);
        var id = await CreateAsync(db, order.Id);
        Assert.NotEqual(Guid.Empty, id);
    }

    [Fact]
    public async Task Create_ShippingOrder_Throws()
    {
        var (db, order) = Seed(OrderStatus.Shipping);
        await Assert.ThrowsAsync<InvalidOperationException>(() => CreateAsync(db, order.Id));
    }

    [Fact]
    public async Task Create_OtherUsersOrder_Throws()
    {
        var (db, order) = Seed(OrderStatus.Pending);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => CreateAsync(db, order.Id, OtherUserId));
    }

    [Fact]
    public async Task Create_MissingOrder_Throws()
    {
        var db = TestDb.Create();
        await Assert.ThrowsAsync<KeyNotFoundException>(() => CreateAsync(db, Guid.NewGuid()));
    }

    [Fact]
    public async Task Create_Duplicate_Throws()
    {
        var (db, order) = Seed(OrderStatus.Pending);
        await CreateAsync(db, order.Id);
        await Assert.ThrowsAsync<InvalidOperationException>(() => CreateAsync(db, order.Id));
    }
}
```

(Add missing `using ClothingStore.Infrastructure.Persistence;` if needed.)

- [ ] **Step 2: Run tests**

Run: `dotnet test backend/src/ClothingStore.Tests/ClothingStore.Tests.csproj`
Expected: all pass (6 new).

- [ ] **Step 3: Commit**

```bash
git add backend/src/ClothingStore.Tests
git commit -m "test: cover cancellation request creation"
```

---

### Task 5: Admin approve/reject — commands + handlers + endpoints

**Files:**
- Create: `backend/src/ClothingStore.Application/Orders/Commands/ApproveCancellationRequestCommand.cs`, `RejectCancellationRequestCommand.cs`, `backend/src/ClothingStore.Domain/Events/CancellationRequestRejectedDomainEvent.cs`, `backend/src/ClothingStore.Application/Notifications/Handlers/CancellationRequestRejectedEventHandler.cs`
- Modify: `backend/src/ClothingStore.API/Controllers/AdminOrdersController.cs`

**Interfaces:**
- Consumes: `CancellationRequestStatus` (Task 2), `Order.ChangeStatus` + `IsValidTransition`.
- Produces: `ApproveCancellationRequestCommand(Guid AdminId, Guid RequestId) : IRequest<Unit>`; `RejectCancellationRequestCommand(Guid AdminId, Guid RequestId, string RejectionReason) : IRequest<Unit>`; endpoints `POST /api/admin/cancellation-requests/{requestId}/approve` and `/reject` (both `[Authorize(Roles = "Admin")]`). Restock logic in approve (ported from old `CancelMyOrderCommandHandler`).

- [ ] **Step 1: Write approve command + handler**

```csharp
using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record ApproveCancellationRequestCommand(Guid AdminId, Guid RequestId) : IRequest<Unit>;
```

Handler — key points: load request (with `Order.Items`), verify Pending; verify order status Pending/Confirmed; restock variants; `order.ChangeStatus(OrderStatus.Cancelled)`; add `OrderStatusHistory`; set request Accepted + ReviewedBy/ReviewedAt; single `SaveChangesAsync` (implicit transaction; same-scope checks give atomicity):

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class ApproveCancellationRequestCommandHandler(IApplicationDbContext context)
    : IRequestHandler<ApproveCancellationRequestCommand, Unit>
{
    public async Task<Unit> Handle(
        ApproveCancellationRequestCommand request,
        CancellationToken cancellationToken
    )
    {
        var cancellationRequest = await context
            .CancellationRequests
            .Include(r => r.Order)
                .ThenInclude(o => o!.Items)
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken)
            ?? throw new KeyNotFoundException("Cancellation request not found.");

        if (cancellationRequest.Status != CancellationRequestStatus.Pending)
            throw new InvalidOperationException("Cancellation request has already been processed.");

        var order = cancellationRequest.Order!;
        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            throw new InvalidOperationException("Order is no longer cancellable.");

        // Restock variants (ported from CancelMyOrderCommandHandler)
        var variantIds = order.Items.Select(i => i.ProductVariantId).ToList();
        var variants = await context
            .ProductVariants.Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, cancellationToken);
        foreach (var item in order.Items)
        {
            if (variants.TryGetValue(item.ProductVariantId, out var variant))
                variant.Quantity += item.Quantity;
        }

        order.ChangeStatus(OrderStatus.Cancelled);
        await context.OrderStatusHistories.AddAsync(
            new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = OrderStatus.Cancelled,
                ChangedAt = DateTime.UtcNow,
            },
            cancellationToken
        );

        cancellationRequest.Status = CancellationRequestStatus.Accepted;
        cancellationRequest.ReviewedBy = request.AdminId;
        cancellationRequest.ReviewedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
```

Note: `Order.ChangeStatus` emits `OrderStatusChangedDomainEvent` → existing `OrderStatusChangedEventHandler` notifies the customer (OrderCancelled). No extra event needed for approve.

- [ ] **Step 2: Write reject command + handler**

```csharp
using MediatR;

namespace ClothingStore.Application.Orders.Commands;

public record RejectCancellationRequestCommand(
    Guid AdminId,
    Guid RequestId,
    string RejectionReason
) : IRequest<Unit>;
```

Handler — request must be Pending; reason required (throw `ArgumentException`); only the request is mutated, order untouched; emit `CancellationRequestRejectedDomainEvent`:

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class RejectCancellationRequestCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RejectCancellationRequestCommand, Unit>
{
    public async Task<Unit> Handle(
        RejectCancellationRequestCommand request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.RejectionReason))
            throw new ArgumentException("Rejection reason is required.");

        var cancellationRequest = await context
            .CancellationRequests.FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken)
            ?? throw new KeyNotFoundException("Cancellation request not found.");

        if (cancellationRequest.Status != CancellationRequestStatus.Pending)
            throw new InvalidOperationException("Cancellation request has already been processed.");

        cancellationRequest.Status = CancellationRequestStatus.Rejected;
        cancellationRequest.RejectionReason = request.RejectionReason;
        cancellationRequest.ReviewedBy = request.AdminId;
        cancellationRequest.ReviewedAt = DateTime.UtcNow;
        cancellationRequest.AddDomainEvent(
            new CancellationRequestRejectedDomainEvent(cancellationRequest)
        );

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
```

- [ ] **Step 3: Write rejected domain event** (same shape as `CancellationRequestCreatedDomainEvent`):

```csharp
using ClothingStore.Domain.Entities;
using MediatR;

namespace ClothingStore.Domain.Events;

public record CancellationRequestRejectedDomainEvent(CancellationRequest Request) : INotification;
```

- [ ] **Step 4: Write rejected notification handler** (`SendToUserAsync` to the request's `UserId`, `NotificationType.System`):

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using ClothingStore.Domain.Events;
using MediatR;

namespace ClothingStore.Application.Notifications.Handlers;

public class CancellationRequestRejectedEventHandler(INotificationService notificationService)
    : INotificationHandler<CancellationRequestRejectedDomainEvent>
{
    public async Task Handle(
        CancellationRequestRejectedDomainEvent notification,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var request = notification.Request;
            var shortId = request.OrderId.ToString("N")[..8].ToUpperInvariant();
            await notificationService.SendToUserAsync(
                request.UserId,
                "Yêu cầu hủy đơn bị từ chối",
                $"Yêu cầu hủy đơn {shortId} của bạn đã bị từ chối. Lý do: {request.RejectionReason}",
                NotificationType.System,
                new { orderId = request.OrderId, requestId = request.Id },
                cancellationToken
            );
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[CancellationRequestRejectedEventHandler] {ex}");
        }
    }
}
```

- [ ] **Step 5: Update AdminOrdersController** — add 2 endpoints (same record-at-bottom pattern):

```csharp
[HttpPost("cancellation-requests/{requestId:guid}/approve")]
public async Task<IActionResult> ApproveCancellationRequest(Guid requestId, CancellationToken ct)
{
    var adminId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    await sender.Send(new ApproveCancellationRequestCommand(Guid.Parse(adminId), requestId), ct);
    return Ok("Cancellation request approved. Order cancelled.");
}

[HttpPost("cancellation-requests/{requestId:guid}/reject")]
public async Task<IActionResult> RejectCancellationRequest(
    Guid requestId,
    [FromBody] AdminRejectCancellationRequestRequest request,
    CancellationToken ct
)
{
    var adminId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    await sender.Send(new RejectCancellationRequestCommand(Guid.Parse(adminId), requestId, request.RejectionReason), ct);
    return Ok("Cancellation request rejected.");
}
```

Record: `public record AdminRejectCancellationRequestRequest(string RejectionReason);`
(If the project has a user-id accessor for admin context, use it; `UserContext.GetRequiredUserId()` is fine too — it reads the same NameIdentifier claim.)

- [ ] **Step 6: Build**

Run: `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add backend/src/ClothingStore.Application backend/src/ClothingStore.Domain backend/src/ClothingStore.API/Controllers/AdminOrdersController.cs
git commit -m "feat: add admin approve/reject for cancellation requests"
```

---

### Task 6: Admin approve/reject — tests

**Files:**
- Create: `backend/src/ClothingStore.Tests/Orders/ApproveCancellationRequestTests.cs`, `backend/src/ClothingStore.Tests/Orders/RejectCancellationRequestTests.cs`

**Interfaces:**
- Consumes: `ApproveCancellationRequestCommand`, `RejectCancellationRequestCommand` + handlers (Task 5), `TestDb` (Task 1).

- [ ] **Step 1: Write approve tests** — seed order (Pending) with 1 item, a variant with `Quantity = 5`, plus a `CancellationRequest`; assert restock happens on approve:

```csharp
using ClothingStore.Application.Orders.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Tests;
using Xunit;

namespace ClothingStore.Tests.Orders;

public class ApproveCancellationRequestTests
{
    private static (ApplicationDbContext db, Guid orderId, Guid requestId, Guid variantId) Seed(
        OrderStatus orderStatus,
        CancellationRequestStatus requestStatus = CancellationRequestStatus.Pending
    )
    {
        var db = TestDb.Create();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, Email = "u@u.com", FullName = "U" });
        var variant = new ProductVariant { Sku = "SKU1", Quantity = 5 };
        db.ProductVariants.Add(variant);
        var order = new Order { UserId = userId, Status = orderStatus, TotalAmount = 100 };
        db.Orders.Add(order);
        db.OrderItems.Add(new OrderItem
        {
            OrderId = order.Id,
            ProductId = Guid.NewGuid(),
            ProductVariantId = variant.Id,
            Quantity = 2,
            UnitPrice = 50,
        });
        var req = new CancellationRequest
        {
            OrderId = order.Id,
            UserId = userId,
            Reason = "CHANGED_MIND",
            Status = requestStatus,
        };
        db.CancellationRequests.Add(req);
        db.SaveChanges();
        return (db, order.Id, req.Id, variant.Id);
    }

    [Fact]
    public async Task Approve_Success_CancelsOrderRestocksAndMarksAccepted()
    {
        var (db, orderId, requestId, variantId) = Seed(OrderStatus.Pending);
        var handler = new ApproveCancellationRequestCommandHandler(db);
        await handler.Handle(new ApproveCancellationRequestCommand(Guid.NewGuid(), requestId), CancellationToken.None);

        var order = await db.Orders.FindAsync(orderId);
        Assert.Equal(OrderStatus.Cancelled, order!.Status);
        Assert.Single(order.StatusHistories);
        var variant = await db.ProductVariants.FindAsync(variantId);
        Assert.Equal(7, variant!.Quantity);
        var req = await db.CancellationRequests.FindAsync(requestId);
        Assert.Equal(CancellationRequestStatus.Accepted, req!.Status);
        Assert.NotNull(req.ReviewedAt);
        Assert.NotNull(req.ReviewedBy);
    }

    [Fact]
    public async Task Approve_RequestAlreadyProcessed_Throws()
    {
        var (db, _, requestId, _) = Seed(OrderStatus.Pending, CancellationRequestStatus.Accepted);
        var handler = new ApproveCancellationRequestCommandHandler(db);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => handler.Handle(new ApproveCancellationRequestCommand(Guid.NewGuid(), requestId), CancellationToken.None)
        );
    }

    [Fact]
    public async Task Approve_OrderShipped_ThrowsAndLeavesOrderUnchanged()
    {
        var (db, orderId, requestId, _) = Seed(OrderStatus.Shipping);
        var handler = new ApproveCancellationRequestCommandHandler(db);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => handler.Handle(new ApproveCancellationRequestCommand(Guid.NewGuid(), requestId), CancellationToken.None)
        );
        var order = await db.Orders.FindAsync(orderId);
        Assert.Equal(OrderStatus.Shipping, order!.Status);
        var req = await db.CancellationRequests.FindAsync(requestId);
        Assert.Equal(CancellationRequestStatus.Pending, req!.Status);
    }

    [Fact]
    public async Task Approve_MissingRequest_Throws()
    {
        var db = TestDb.Create();
        var handler = new ApproveCancellationRequestCommandHandler(db);
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => handler.Handle(new ApproveCancellationRequestCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None)
        );
    }
}
```

- [ ] **Step 2: Write reject tests**

```csharp
using ClothingStore.Application.Orders.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Tests;
using Xunit;

namespace ClothingStore.Tests.Orders;

public class RejectCancellationRequestTests
{
    private static (ApplicationDbContext db, Guid orderId, Guid requestId) Seed(
        CancellationRequestStatus status = CancellationRequestStatus.Pending
    )
    {
        var db = TestDb.Create();
        var userId = Guid.NewGuid();
        db.Users.Add(new User { Id = userId, Email = "u@u.com", FullName = "U" });
        var order = new Order { UserId = userId, Status = OrderStatus.Pending };
        db.Orders.Add(order);
        var req = new CancellationRequest
        {
            OrderId = order.Id,
            UserId = userId,
            Reason = "CHANGED_MIND",
            Status = status,
        };
        db.CancellationRequests.Add(req);
        db.SaveChanges();
        return (db, order.Id, req.Id);
    }

    [Fact]
    public async Task Reject_Success_OrderUnchangedRequestRejected()
    {
        var (db, orderId, requestId) = Seed();
        var handler = new RejectCancellationRequestCommandHandler(db);
        await handler.Handle(
            new RejectCancellationRequestCommand(Guid.NewGuid(), requestId, "Already shipped"),
            CancellationToken.None
        );
        var order = await db.Orders.FindAsync(orderId);
        Assert.Equal(OrderStatus.Pending, order!.Status);
        var req = await db.CancellationRequests.FindAsync(requestId);
        Assert.Equal(CancellationRequestStatus.Rejected, req!.Status);
        Assert.Equal("Already shipped", req.RejectionReason);
        Assert.NotNull(req.ReviewedAt);
        Assert.NotNull(req.ReviewedBy);
    }

    [Fact]
    public async Task Reject_MissingReason_Throws()
    {
        var (db, _, requestId) = Seed();
        var handler = new RejectCancellationRequestCommandHandler(db);
        await Assert.ThrowsAsync<ArgumentException>(
            () => handler.Handle(new RejectCancellationRequestCommand(Guid.NewGuid(), requestId, "  "), CancellationToken.None)
        );
    }

    [Fact]
    public async Task Reject_AlreadyProcessed_Throws()
    {
        var (db, _, requestId) = Seed(CancellationRequestStatus.Accepted);
        var handler = new RejectCancellationRequestCommandHandler(db);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => handler.Handle(new RejectCancellationRequestCommand(Guid.NewGuid(), requestId, "nope"), CancellationToken.None)
        );
    }
}
```

- [ ] **Step 3: Run tests**

Run: `dotnet test backend/src/ClothingStore.Tests/ClothingStore.Tests.csproj`
Expected: all pass (7 new).

- [ ] **Step 4: Commit**

```bash
git add backend/src/ClothingStore.Tests
git commit -m "test: cover admin approve and reject"
```

---

### Task 7: Admin queries + OrderDetailDto enrichment + frontend build check

**Files:**
- Create: `backend/src/ClothingStore.Application/Orders/Queries/GetAdminCancellationRequestsQuery.cs`, `GetAdminCancellationRequestDetailQuery.cs`
- Modify: `backend/src/ClothingStore.Application/Orders/OrderDto.cs` (add `CancellationRequestStatus?` + `RejectionReason?` to `OrderDetailDto`), `backend/src/ClothingStore.Application/Orders/Queries/GetMyOrderDetailQuery.cs` (populate fields), `backend/src/ClothingStore.API/Controllers/AdminOrdersController.cs` (2 GET endpoints)

**Interfaces:**
- Consumes: `CancellationRequestStatus` (Task 2).
- Produces: `CancellationRequestListItemDto(Guid Id, Guid OrderId, string OrderShortId, string CustomerName, string CustomerEmail, OrderStatus OrderStatus, string Reason, string? Note, CancellationRequestStatus Status, DateTime CreatedAt, DateTime? ReviewedAt, string? RejectionReason)`; `CancellationRequestDetailDto` (list item fields + `OrderTotal`, `PaymentMethod`, `PaymentStatus`, `DateTime? PaidAt`, `Guid? ReviewedBy`); `GetAdminCancellationRequestsQuery(string? Status)` + `GetAdminCancellationRequestDetailQuery(Guid RequestId)`; `GET /api/admin/cancellation-requests` + `.../{requestId}`.

- [ ] **Step 1: Add DTOs to OrderDto.cs**

```csharp
public record CancellationRequestListItemDto(
    Guid Id,
    Guid OrderId,
    string OrderShortId,
    string CustomerName,
    string CustomerEmail,
    OrderStatus OrderStatus,
    string Reason,
    string? Note,
    CancellationRequestStatus Status,
    DateTime CreatedAt,
    DateTime? ReviewedAt,
    string? RejectionReason
);

public record CancellationRequestDetailDto(
    Guid Id,
    Guid OrderId,
    string OrderShortId,
    string CustomerName,
    string CustomerEmail,
    OrderStatus OrderStatus,
    decimal OrderTotal,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    DateTime? PaidAt,
    string Reason,
    string? Note,
    CancellationRequestStatus Status,
    DateTime CreatedAt,
    Guid? ReviewedBy,
    DateTime? ReviewedAt,
    string? RejectionReason
);
```

- [ ] **Step 2: Add list query**

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Queries;

public record GetAdminCancellationRequestsQuery(string? Status) : IRequest<IReadOnlyList<CancellationRequestListItemDto>>;

public class GetAdminCancellationRequestsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminCancellationRequestsQuery, IReadOnlyList<CancellationRequestListItemDto>>
{
    public async Task<IReadOnlyList<CancellationRequestListItemDto>> Handle(
        GetAdminCancellationRequestsQuery request,
        CancellationToken ct
    )
    {
        IQueryable<CancellationRequest> query = context
            .CancellationRequests.AsNoTracking()
            .Include(r => r.Order)
            .Include(r => r.User);

        if (
            !string.IsNullOrWhiteSpace(request.Status)
            && !string.Equals(request.Status, "All", StringComparison.OrdinalIgnoreCase)
            && Enum.TryParse<CancellationRequestStatus>(request.Status, true, out var statusFilter)
        )
        {
            query = query.Where(r => r.Status == statusFilter);
        }

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new CancellationRequestListItemDto(
                r.Id,
                r.OrderId,
                r.OrderId.ToString("N")[..8].ToUpperInvariant(),
                r.User != null ? r.User.FullName : string.Empty,
                r.User != null ? r.User.Email : string.Empty,
                r.Order != null ? r.Order.Status : OrderStatus.Pending,
                r.Reason,
                r.Note,
                r.Status,
                r.CreatedAt,
                r.ReviewedAt,
                r.RejectionReason
            ))
            .ToListAsync(ct);
    }
}
```

(Add `using ClothingStore.Domain.Entities;` if needed.)

- [ ] **Step 3: Add detail query** — same shape, filter `r.Id == request.RequestId`, include order `PaymentMethod`/`PaymentStatus`/`PaidAt`/`TotalAmount`; throw `KeyNotFoundException` if missing:

```csharp
public record GetAdminCancellationRequestDetailQuery(Guid RequestId) : IRequest<CancellationRequestDetailDto>;

public class GetAdminCancellationRequestDetailQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminCancellationRequestDetailQuery, CancellationRequestDetailDto>
{
    public async Task<CancellationRequestDetailDto> Handle(
        GetAdminCancellationRequestDetailQuery request,
        CancellationToken ct
    )
    {
        var item = await context
            .CancellationRequests.AsNoTracking()
            .Include(r => r.Order)
            .Include(r => r.User)
            .Where(r => r.Id == request.RequestId)
            .Select(r => new CancellationRequestDetailDto(
                r.Id,
                r.OrderId,
                r.OrderId.ToString("N")[..8].ToUpperInvariant(),
                r.User != null ? r.User.FullName : string.Empty,
                r.User != null ? r.User.Email : string.Empty,
                r.Order != null ? r.Order.Status : OrderStatus.Pending,
                r.Order != null ? r.Order.TotalAmount : 0m,
                r.Order != null ? r.Order.PaymentMethod : PaymentMethod.COD,
                r.Order != null ? r.Order.PaymentStatus : PaymentStatus.Unpaid,
                r.Order != null ? r.Order.PaidAt : null,
                r.Reason,
                r.Note,
                r.Status,
                r.CreatedAt,
                r.ReviewedBy,
                r.ReviewedAt,
                r.RejectionReason
            ))
            .FirstOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("Cancellation request not found.");
        return item;
    }
}
```

- [ ] **Step 4: Enrich OrderDetailDto** — add 2 fields at end: `CancellationRequestStatus? CancellationRequestStatus = null, string? CancellationRequestRejectionReason = null`. In `GetMyOrderDetailQueryHandler`, after loading `order`, fetch latest request:

```csharp
var cancellationRequest = await context
    .CancellationRequests.AsNoTracking()
    .Where(r => r.OrderId == order.Id)
    .OrderByDescending(r => r.CreatedAt)
    .FirstOrDefaultAsync(ct);
```

Pass to the `OrderDetailDto` ctor: `cancellationRequest?.Status, cancellationRequest?.RejectionReason`.

- [ ] **Step 5: Add admin GET endpoints** (AdminOrdersController, admin of the controller):

```csharp
[HttpGet("cancellation-requests")]
public async Task<IActionResult> GetCancellationRequests([FromQuery] string? status, CancellationToken ct)
{
    var data = await sender.Send(new GetAdminCancellationRequestsQuery(status), ct);
    return Ok(data, "Cancellation requests fetched.");
}

[HttpGet("cancellation-requests/{requestId:guid}")]
public async Task<IActionResult> GetCancellationRequest(Guid requestId, CancellationToken ct)
{
    var data = await sender.Send(new GetAdminCancellationRequestDetailQuery(requestId), ct);
    return Ok(data, "Cancellation request fetched.");
}
```

- [ ] **Step 6: Build + quick test**

Run: `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj` then `dotnet test backend/src/ClothingStore.Tests/ClothingStore.Tests.csproj`
Expected: build 0 errors; all tests pass.

- [ ] **Step 7: Frontend baseline check**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors (before frontend changes).

- [ ] **Step 8: Commit**

```bash
git add backend/src/ClothingStore.Application backend/src/ClothingStore.API/Controllers/AdminOrdersController.cs
git commit -m "feat: admin cancellation request queries; expose request status on order detail"
```

---

### Task 8: Frontend user flow — modal + page state

**Files:**
- Create: `frontend/src/components/order/CancelOrderModal.tsx`
- Modify: `frontend/src/pages/OrderDetailPage.tsx`, `frontend/src/api/orders-api.ts`, `frontend/src/constants/api-endpoints.constant.ts`, `frontend/src/constants/query-keys.constant.ts`, `frontend/src/types/order.type.ts`, `frontend/src/enums/order.enum.ts`, `frontend/public/locales/vi/translation.json`, `frontend/public/locales/en/translation.json`

**Interfaces:**
- Consumes: `OrderDetailDto` new fields `cancellationRequestStatus` / `cancellationRequestRejectionReason` (Task 7).
- Produces: `createCancellationRequest(orderId: string, payload: { reason: string; note?: string }): Promise<string>`; `CancelOrderModal` props `{ open: boolean; onClose: () => void }`; `CancellationRequestStatus` enum (`PENDING`/`ACCEPTED`/`REJECTED`); `CANCEL_REASONS` const.

- [ ] **Step 1: Add enum**

`frontend/src/enums/order.enum.ts` — add:

```ts
export const CancellationRequestStatus = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected'
} as const
export type CancellationRequestStatus =
  (typeof CancellationRequestStatus)[keyof typeof CancellationRequestStatus]
```

- [ ] **Step 2: Add type fields**

`frontend/src/types/order.type.ts` — in `MyOrderDetail` add:

```ts
cancellationRequestStatus?: CancellationRequestStatus | null
cancellationRequestRejectionReason?: string | null
```

- [ ] **Step 3: Add endpoints + API fn**

`api-endpoints.constant.ts` — in `orders` add:

```ts
cancellationRequest: (id: string) => `/orders/my/${id}/cancellation-request`,
```

`orders-api.ts` — replace `cancelMyOrder` with:

```ts
export const createCancellationRequest = async (
  id: string,
  payload: { reason: string; note?: string }
): Promise<string> =>
  apiData(apiClient.post(API_ENDPOINTS.orders.cancellationRequest(id), payload))
```

- [ ] **Step 4: Add query keys**

`query-keys.constant.ts` — add:

```ts
adminCancellationRequests: ['admin-cancellation-requests'],
adminCancellationRequest: (id?: string) => ['admin-cancellation-request', id],
```

- [ ] **Step 5: Add i18n keys**

`vi/translation.json` — under `"order"` add `cancelOrderModalTitle`, `cancelOrderModalPrompt`, `cancelReasons` object (CHANGED_MIND/ORDERED_BY_MISTAKE/BETTER_PRICE/DELIVERY_TOO_SLOW/NO_LONGER_NEED/OTHER), `cancelReasonRequired`, `cancelNotePlaceholder`, `cancelSubmit`, `cancellationPending`, `cancellationAccepted`, `cancellationRejected`, `cancellationSubmitted`, `cancellationSubmitFailed`. Mirror in `en/translation.json`.

- [ ] **Step 6: Write CancelOrderModal** — Antd `Modal` + `Radio.Group` + conditional `Input.TextArea` for OTHER; zod validation via `react-hook-form` (project pattern) or plain state — match project's form usage (react-hook-form + zod used in `ShippingAddressFormModal`); submit disabled until valid; loading state; prevent double submit via `mutation.isPending`; toast + `queryClient.invalidateQueries` on success:

```tsx
import { useState } from 'react'
import { Button, Input, Modal, Radio, Space, Alert } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { createCancellationRequest } from '@/api/orders-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'

export const CANCEL_REASONS = [
  'CHANGED_MIND',
  'ORDERED_BY_MISTAKE',
  'BETTER_PRICE',
  'DELIVERY_TOO_SLOW',
  'NO_LONGER_NEED',
  'OTHER'
] as const

interface Props {
  open: boolean
  onClose: () => void
}

export default function CancelOrderModal({ open, onClose }: Props) {
  const { id } = useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createCancellationRequest(String(id), {
        reason: reason ?? '',
        note: reason === 'OTHER' ? note : undefined
      }),
    onSuccess: async () => {
      toast.success(t('order.cancellationSubmitted'))
      setReason(null)
      setNote('')
      onClose()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrderDetail(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myOrders() })
      ])
    },
    onError: () => toast.error(t('order.cancellationSubmitFailed'))
  })

  const canSubmit = reason !== null && (reason !== 'OTHER' || note.trim().length > 0)

  return (
    <Modal
      open={open}
      title={t('order.cancelOrderModalTitle')}
      onCancel={onClose}
      footer={null}
      closable={!mutation.isPending}
    >
      <div className="space-y-4">
        <Alert
          type="info"
          showIcon
          message={t('order.cancelOrderModalPrompt')}
        />
        <Radio.Group
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            {CANCEL_REASONS.map((r) => (
              <Radio key={r} value={r}>
                {t(`order.cancelReasons.${r}`)}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
        {reason === 'OTHER' && (
          <Input.TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('order.cancelNotePlaceholder')}
            maxLength={500}
          />
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={mutation.isPending}>
            {t('common.close')}
          </Button>
          <Button
            type="primary"
            danger
            loading={mutation.isPending}
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
          >
            {t('order.cancelSubmit')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 7: Update OrderDetailPage** — replace `canCancelOrder`/`cancelOrderMutation`/`Modal.confirm` with:

```tsx
const [showCancelModal, setShowCancelModal] = useState(false)

const requestStatus = detail?.cancellationRequestStatus
const canCancelOrder =
  (detail?.status === OrderStatus.PENDING || detail?.status === OrderStatus.CONFIRMED) &&
  !requestStatus
```

Render logic: if `canCancelOrder` → danger Button opens modal (`setShowCancelModal(true)`); else if `requestStatus` → `Alert`/`Tag` showing `cancellationPending` / `cancellationAccepted` / `cancellationRejected` (+ reason when rejected); else nothing. Add `<CancelOrderModal open={showCancelModal} onClose={() => setShowCancelModal(false)} />` near the review modal.

- [ ] **Step 8: Remove `cancelMyOrder` from orders-api.ts** (replaced by `createCancellationRequest`) and drop unused imports in OrderDetailPage.

- [ ] **Step 9: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 10: Commit**

```bash
git add frontend/src frontend/public/locales
git commit -m "feat: user cancel order modal with reason, pending status UI"
```

---

### Task 9: Frontend admin — tab + table + modal

**Files:**
- Create: `frontend/src/components/admin/admin-table/AdminCancellationRequestsTable.tsx`, `frontend/src/components/admin/admin-modal/AdminCancellationRequestModal.tsx`
- Modify: `frontend/src/components/admin/admin-section/AdminOrdersSection.tsx` (Tabs), `frontend/src/api/admin-api.ts`, `frontend/src/constants/api-endpoints.constant.ts`, `frontend/src/constants/admin-nav.constant.ts` (label key if needed), `frontend/public/locales/vi/translation.json`, `frontend/public/locales/en/translation.json`

**Interfaces:**
- Consumes: `getAdminCancellationRequests`, `getAdminCancellationRequest`, `approveCancellationRequest`, `rejectCancellationRequest` (this task), `CancellationRequestStatus` enum (Task 8).
- Produces: `getAdminCancellationRequests(status?: string): Promise<CancellationRequestListItem[]>`, `getAdminCancellationRequest(id): Promise<CancellationRequestDetail>`, `approveCancellationRequest(id)`, `rejectCancellationRequest(id, reason)`; tabs `orders` | `cancellation-requests`.

- [ ] **Step 1: Add endpoint constants + API fns** (admin-api.ts):

```ts
export const getAdminCancellationRequests = async (
  status?: string
): Promise<CancellationRequestListItem[]> =>
  apiData(
    apiClient.get(API_ENDPOINTS.admin.cancellationRequests, {
      params: status && status !== 'all' ? { status } : {}
    })
  )

export const getAdminCancellationRequest = async (
  id: string
): Promise<CancellationRequestDetail> =>
  apiData(apiClient.get(API_ENDPOINTS.admin.cancellationRequestById(id)))

export const approveCancellationRequest = async (id: string) =>
  apiVoid(apiClient.post(API_ENDPOINTS.admin.cancellationRequestApprove(id)))

export const rejectCancellationRequest = async (
  id: string,
  rejectionReason: string
) =>
  apiVoid(
    apiClient.post(API_ENDPOINTS.admin.cancellationRequestReject(id), {
      rejectionReason
    })
  )
```

Endpoints:

```ts
cancellationRequests: '/admin/cancellation-requests',
cancellationRequestById: (id: string) => `/admin/cancellation-requests/${id}`,
cancellationRequestApprove: (id: string) => `/admin/cancellation-requests/${id}/approve`,
cancellationRequestReject: (id: string) => `/admin/cancellation-requests/${id}/reject`,
```

- [ ] **Step 2: Add types** (`frontend/src/types/order.type.ts`):

```ts
export interface CancellationRequestListItem {
  id: string
  orderId: string
  orderShortId: string
  customerName: string
  customerEmail: string
  orderStatus: OrderStatus
  reason: string
  note?: string | null
  status: CancellationRequestStatus
  createdAt: string
  reviewedAt?: string | null
  rejectionReason?: string | null
}

export interface CancellationRequestDetail extends CancellationRequestListItem {
  orderTotal: number
  paymentMethod: string
  paymentStatus: string
  paidAt?: string | null
  reviewedBy?: string | null
}
```

- [ ] **Step 3: Write AdminCancellationRequestsTable** — reuse `getVietnameseLabel` from `@/constants/i18n.constant` for reason labels (add `cancellationReasons.*` to that map in Task 10 or use `t` keys inline — follow `AdminOrdersTable` conventions), columns: `#`, Order (short id), Customer (name+email), Order Status (Tag via `ORDER_STATUS_COLORS`), Reason (label), CreatedAt (`formatDate`), Status (Tag: Pending gold / Accepted green / Rejected red — add `CANCELLATION_REQUEST_STATUS_COLORS` const), View action (`EyeOutlined`).

Props: `{ dataSource, loading, onView }`. Pagination local-state pattern like `AdminOrdersTable`.

- [ ] **Step 4: Write AdminCancellationRequestModal** — props `{ open, requestId, onClose }`; `useQuery` on `getAdminCancellationRequest`; `Descriptions` + `Tag` for all detail fields; footer:

```tsx
const approveMutation = useMutation({
  mutationFn: approveCancellationRequest,
  onSuccess: async () => { toast.success(t('admin.cancellationApproved')); onClose(); await refresh() },
  onError: () => toast.error(t('admin.cancellationApproveFailed'))
})
```

- Approve button → `Modal.confirm` (danger) → `approveMutation.mutate(requestId)`.
- Reject button → opens nested `Modal` with `Input.TextArea`; `rejectMutation.mutate({ id: requestId, reason })`; disabled until reason non-empty; loading state.
- Hide action buttons when `status !== 'Pending'`.

- [ ] **Step 5: Wire tabs in AdminOrdersSection** — add `Tabs` wrapper; existing orders table/query stays as tab `orders`; new tab `cancellation-requests` renders `AdminCancellationRequestsTable` + `AdminCancellationRequestModal` (open state `selectedRequestId` local to section). Keep `useOrdersTabs` for orders tab. Tab labels via `t('admin.ordersTab')` / `t('admin.cancellationRequestsTab')`.

- [ ] **Step 6: Add i18n keys** — `admin.cancellationRequestsTab`, `admin.ordersTab`, `admin.cancellationApproved`, `admin.cancellationApproveFailed`, `admin.cancellationRejected`, `admin.cancellationRejectFailed`, `admin.cancellationRejectReasonRequired`, `admin.cancellationRejectTitle`, `admin.cancellationRejectPlaceholder`, `admin.cancellationReason`, `admin.cancellationRequestStatus`, `admin.cancellationOrderStatus`, `admin.cancellationCustomer`, `admin.cancellationCreatedAt`, `admin.cancellationReviewedAt`, `admin.cancellationReviewedBy`, `admin.cancellationRejectionReason`. Mirror en.

- [ ] **Step 7: Type-check + build**

Run: `cd frontend && npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/src frontend/public/locales
git commit -m "feat: admin cancellation requests tab with review modal"
```

---

### Task 10: Frontend tests (vitest setup)

**Files:**
- Create: `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`, `frontend/src/components/order/CancelOrderModal.test.tsx`, `frontend/src/pages/OrderDetailPage.test.tsx`
- Modify: `frontend/package.json` (scripts + devDeps)

**Interfaces:**
- Consumes: `CancelOrderModal` (Task 8), `CANCEL_REASONS` (Task 8).

- [ ] **Step 1: Add devDeps + script**

```bash
cd frontend
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 2: vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
```

- [ ] **Step 3: setup.ts**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: CancelOrderModal.test.tsx** — mock `@/api/orders-api`, `react-i18next` (`useTranslation` → `t: (k) => k`), `react-hot-toast`; render modal open; assert:

- `submit` disabled when no reason selected
- selecting `OTHER` shows textarea; submit disabled until note non-empty
- selecting a non-OTHER reason enables submit
- submit calls `createCancellationRequest` with reason; loading state disables button
- success → toast called, `onClose` called

Use `@testing-library/user-event` for clicks. Example skeleton:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CancelOrderModal from './CancelOrderModal'

vi.mock('@/api/orders-api', () => ({
  createCancellationRequest: vi.fn()
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k })
}))
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}))
vi.mock('react-router-dom', () => ({ useParams: () => ({ id: 'order-1' }) }))

import { createCancellationRequest } from '@/api/orders-api'

describe('CancelOrderModal', () => {
  it('disables submit until a reason is selected', () => {
    render(<CancelOrderModal open onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'order.cancelSubmit' })).toBeDisabled()
    fireEvent.click(screen.getByLabelText('order.cancelReasons.CHANGED_MIND'))
    expect(screen.getByRole('button', { name: 'order.cancelSubmit' })).toBeEnabled()
  })

  it('requires note when OTHER selected', () => {
    render(<CancelOrderModal open onClose={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('order.cancelReasons.OTHER'))
    expect(screen.getByRole('button', { name: 'order.cancelSubmit' })).toBeDisabled()
    fireEvent.change(screen.getByPlaceholderText('order.cancelNotePlaceholder'), {
      target: { value: 'just because' }
    })
    expect(screen.getByRole('button', { name: 'order.cancelSubmit' })).toBeEnabled()
  })

  it('submits and closes on success', async () => {
    const onClose = vi.fn()
    vi.mocked(createCancellationRequest).mockResolvedValue('req-1')
    render(<CancelOrderModal open onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('order.cancelReasons.CHANGED_MIND'))
    await userEvent.click(screen.getByRole('button', { name: 'order.cancelSubmit' }))
    expect(createCancellationRequest).toHaveBeenCalledWith('order-1', {
      reason: 'CHANGED_MIND',
      note: undefined
    })
    expect(onClose).toHaveBeenCalled()
  })
})
```

(Adjust mock paths per actual alias; run tests to confirm.)

- [ ] **Step 5: OrderDetailPage.test.tsx** — mock `getMyOrderDetail` returning orders with each `cancellationRequestStatus` variant; assert cancel button hidden when request exists; pending/accepted/rejected status text renders. (Keep minimal — 2-3 assertions; page has many dependencies to mock.)

- [ ] **Step 6: Run tests**

Run: `cd frontend && npx vitest run`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add frontend
git commit -m "test: add vitest setup and cancel order modal tests"
```

---

### Task 11: i18n label map + end-to-end verification

**Files:**
- Modify: `frontend/src/constants/i18n.constant.ts` (add reason label map), `frontend/src/enums/admin.enum.ts` if needed, README if relevant

**Interfaces:**
- Consumes: everything prior.

- [ ] **Step 1: Add reason labels to getVietnameseLabel map**

`i18n.constant.ts` — extend `LABEL_KEY_MAP` with the 6 reason keys → `order.cancelReasons.*` keys.

- [ ] **Step 2: Full backend build + tests**

Run: `dotnet build backend/src/ClothingStore.API/ClothingStore.API.csproj && dotnet test backend/src/ClothingStore.Tests/ClothingStore.Tests.csproj`
Expected: 0 errors, all pass.

- [ ] **Step 3: Full frontend check**

Run: `cd frontend && npm run type-check && npx vitest run`
Expected: 0 type errors, all tests pass.

- [ ] **Step 4: Migration SQL sanity**

Run: `cd backend/src/ClothingStore.API && dotnet ef migrations list`
Expected: `AddCancellationRequests` listed; inspect migration `.cs` for `CREATE UNIQUE INDEX ... "IX_CancellationRequests_OrderId"` on `"CancellationRequests"` table.

- [ ] **Step 5: Manual smoke (optional)** — if a dev environment is available: `dotnet run` API + `npm run dev` frontend; login as user, open order detail, request cancellation, verify status badge; login as admin, check Orders tab, approve/reject, verify order status + notification. If no environment, note in final summary.

- [ ] **Step 6: Commit any final touch-ups**

```bash
git add -A
git commit -m "chore: final polish for cancellation request flow"
```

---

## Self-Review Notes

- Spec coverage: creation/approve/reject/query/notifications all mapped (Tasks 3, 5, 7); user UI (Task 8), admin UI (Task 9), tests (Tasks 4, 6, 10), verification (Task 11).
- Placeholders: all steps contain concrete code or exact commands.
- Type consistency: `CancellationRequestStatus` enum shared across backend/frontend; `OrderDetailDto` fields match `MyOrderDetail` additions; DTOs match query projections.
- Concurrency: approve re-reads order in same scope; request-status check throws on non-Pending (covers two-admins race); UNIQUE index covers create-duplicate; frontend disables double submit.
