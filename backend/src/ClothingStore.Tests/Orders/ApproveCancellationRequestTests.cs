using ClothingStore.Application.Orders.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Infrastructure.Persistence;
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
