using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Cart.Commands;

public class ClearMyCartCommandHandler(IApplicationDbContext context)
    : IRequestHandler<ClearMyCartCommand>
{
    public async Task Handle(ClearMyCartCommand request, CancellationToken cancellationToken)
    {
        var items = await context
            .CartItems.Where(x => x.UserId == request.UserId)
            .ToListAsync(cancellationToken);

        context.CartItems.RemoveRange(items);
        await context.SaveChangesAsync(cancellationToken);
    }
}
