using ClothingStore.Application.Orders.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Infrastructure.Persistence;
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
