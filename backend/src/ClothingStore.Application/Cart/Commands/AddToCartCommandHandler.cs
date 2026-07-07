using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Cart.Commands;

public class AddToCartCommandHandler(IApplicationDbContext context)
    : IRequestHandler<AddToCartCommand, CartItemDto>
{
    public async Task<CartItemDto> Handle(
        AddToCartCommand request,
        CancellationToken cancellationToken
    )
    {
        var variant =
            await context
                .ProductVariants.Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId, cancellationToken)
            ?? throw new KeyNotFoundException("Product variant not found.");

        if (variant.ProductId != request.ProductId)
            throw new InvalidOperationException("Variant does not belong to product.");

        if (variant.Quantity <= 0)
            throw new InvalidOperationException("Product variant is out of stock.");

        var existing = await context.CartItems.FirstOrDefaultAsync(
            x =>
                x.UserId == request.UserId
                && x.ProductId == request.ProductId
                && x.ProductVariantId == request.ProductVariantId,
            cancellationToken
        );

        if (existing is not null)
        {
            existing.Quantity = Math.Min(
                variant.Quantity,
                existing.Quantity + Math.Max(1, request.Quantity)
            );
            await context.SaveChangesAsync(cancellationToken);

            var updated = await context
                .CartItems.AsNoTracking()
                .Include(x => x.Product)
                .Include(x => x.ProductVariant)
                .FirstAsync(x => x.Id == existing.Id, cancellationToken);
            return MapItem(updated);
        }

        var cartItem = new Domain.Entities.CartItem
        {
            UserId = request.UserId,
            ProductId = request.ProductId,
            ProductVariantId = request.ProductVariantId,
            Quantity = Math.Max(1, request.Quantity),
        };

        context.CartItems.Add(cartItem);
        await context.SaveChangesAsync(cancellationToken);

        var saved = await context
            .CartItems.AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .FirstAsync(x => x.Id == cartItem.Id, cancellationToken);
        return MapItem(saved);
    }

    private static CartItemDto MapItem(Domain.Entities.CartItem item)
    {
        var p = item.Product!;
        var v = item.ProductVariant!;

        return new CartItemDto(
            Id: item.Id,
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
