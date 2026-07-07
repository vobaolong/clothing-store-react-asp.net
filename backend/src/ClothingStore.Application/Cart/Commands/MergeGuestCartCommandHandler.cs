using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Cart.Commands;

public class MergeGuestCartCommandHandler(IApplicationDbContext context)
    : IRequestHandler<MergeGuestCartCommand, IReadOnlyList<CartItemDto>>
{
    public async Task<IReadOnlyList<CartItemDto>> Handle(
        MergeGuestCartCommand request,
        CancellationToken cancellationToken
    )
    {
        foreach (var guest in request.GuestItems)
        {
            var variant = await context
                .ProductVariants.AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == guest.ProductVariantId, cancellationToken);

            if (variant is null || variant.Quantity <= 0)
                continue;

            var existing = await context.CartItems.FirstOrDefaultAsync(
                x =>
                    x.UserId == request.UserId
                    && x.ProductId == guest.ProductId
                    && x.ProductVariantId == guest.ProductVariantId,
                cancellationToken
            );

            if (existing is not null)
            {
                existing.Quantity = Math.Min(variant.Quantity, existing.Quantity + guest.Quantity);
            }
            else
            {
                context.CartItems.Add(
                    new Domain.Entities.CartItem
                    {
                        UserId = request.UserId,
                        ProductId = guest.ProductId,
                        ProductVariantId = guest.ProductVariantId,
                        Quantity = Math.Max(1, Math.Min(variant.Quantity, guest.Quantity)),
                    }
                );
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        // Return full cart after merge
        var items = await context
            .CartItems.AsNoTracking()
            .Where(x => x.UserId == request.UserId)
            .Include(x => x.Product)
            .Include(x => x.ProductVariant)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return items.Select(MapItem).ToList();
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
