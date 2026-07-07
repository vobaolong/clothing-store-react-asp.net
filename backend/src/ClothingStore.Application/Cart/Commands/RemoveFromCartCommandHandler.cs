using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Cart.Commands;

public class RemoveFromCartCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RemoveFromCartCommand>
{
    public async Task Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        var item = await context.CartItems.FirstOrDefaultAsync(
            x => x.Id == request.CartItemId && x.UserId == request.UserId,
            cancellationToken
        );

        if (item is null)
            return;

        context.CartItems.Remove(item);
        await context.SaveChangesAsync(cancellationToken);
    }
}
