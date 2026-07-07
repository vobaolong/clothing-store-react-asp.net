using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Cart.Commands;

public class UpdateCartItemQuantityCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateCartItemQuantityCommand, CartItemDto>
{
    public async Task<CartItemDto> Handle(
        UpdateCartItemQuantityCommand request,
        CancellationToken cancellationToken
    )
    {
        var item =
            await context
                .CartItems.Include(x => x.ProductVariant)
                .FirstOrDefaultAsync(
                    x => x.Id == request.CartItemId && x.UserId == request.UserId,
                    cancellationToken
                )
            ?? throw new KeyNotFoundException("Cart item not found.");

        item.Quantity = Math.Clamp(request.Quantity, 1, item.ProductVariant!.Quantity);
        await context.SaveChangesAsync(cancellationToken);

        var saved = await context
            .CartItems.AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .FirstAsync(x => x.Id == item.Id, cancellationToken);

        var p = saved.Product!;
        var v = saved.ProductVariant!;

        return new CartItemDto(
            Id: saved.Id,
            ProductId: p.Id,
            ProductName: p.Name,
            ProductSlug: p.Slug,
            ProductVariantId: v.Id,
            VariantSku: v.Sku,
            Size: v.Size,
            Color: v.Color,
            Hex: v.ColorHex ?? string.Empty,
            Price: v.Price ?? p.Price,
            SalePrice: p.SalePrice,
            SalePriceStartDate: p.SalePriceStartDate,
            SalePriceEndDate: p.SalePriceEndDate,
            Quantity: item.Quantity,
            AvailableStock: v.Quantity,
            ImageUrl: v.ImageUrl,
            ImageUrls: (IReadOnlyList<string>?)
                System.Text.Json.JsonSerializer.Deserialize<List<string>>(
                    v.VariantGalleryJson ?? "[]"
                )
                ?? Array.Empty<string>()
        );
    }
}
