using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Wishlist.Commands;

public class AddToWishlistCommandHandler(IApplicationDbContext context)
    : IRequestHandler<AddToWishlistCommand>
{
    public async Task Handle(AddToWishlistCommand request, CancellationToken cancellationToken)
    {
        var productExists = await context.Products.AnyAsync(
            x => x.Id == request.ProductId,
            cancellationToken
        );
        if (!productExists)
            throw new KeyNotFoundException("Product not found.");

        var exists = await context.WishlistItems.AnyAsync(
            x => x.UserId == request.UserId && x.ProductId == request.ProductId,
            cancellationToken
        );
        if (exists)
            return;

        await context.WishlistItems.AddAsync(
            new WishlistItem { UserId = request.UserId, ProductId = request.ProductId },
            cancellationToken
        );
        await context.SaveChangesAsync(cancellationToken);
    }
}
