using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Cart.Queries;

public class GetMyCartQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMyCartQuery, IReadOnlyList<CartItemDto>>
{
    public async Task<IReadOnlyList<CartItemDto>> Handle(
        GetMyCartQuery request,
        CancellationToken cancellationToken
    )
    {
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
        var imageUrls = string.IsNullOrWhiteSpace(v.VariantGalleryJson)
            ? (IReadOnlyList<string>)Array.Empty<string>()
            : (IReadOnlyList<string>?)
                System.Text.Json.JsonSerializer.Deserialize<List<string>>(v.VariantGalleryJson)
                ?? Array.Empty<string>();

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
            ImageUrls: imageUrls
        );
    }
}
