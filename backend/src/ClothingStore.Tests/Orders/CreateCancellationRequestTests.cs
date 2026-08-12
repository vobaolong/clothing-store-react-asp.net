using ClothingStore.Application.Orders.Commands;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using ClothingStore.Infrastructure.Persistence;
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
        Guid? userId = null
    )
    {
        var handler = new CreateCancellationRequestCommandHandler(db);
        return await handler.Handle(
            new CreateCancellationRequestCommand(userId ?? UserId, orderId, "CHANGED_MIND", null),
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
