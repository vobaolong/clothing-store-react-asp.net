using ClothingStore.Application.Common;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Products.Commands;

public class CreateProductCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateProductCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateProductCommand request,
        CancellationToken cancellationToken
    )
    {
        var existingVariantSkus = new HashSet<string>(
            await context.ProductVariants
                .AsNoTracking()
                .Select(variant => variant.Sku)
                .ToListAsync(cancellationToken),
            StringComparer.OrdinalIgnoreCase
        );

        var entity = new Product
        {
            Name = request.Name,
            ProductCode = request.ProductCode,
            Slug = SlugGenerator.Generate(request.Name),
            IsActive = true,
            Description = request.Description,
            DescriptionHtml = request.Description,
            DescriptionJson = request.DescriptionData,
            Price = request.Price,
            SalePrice = request.SalePrice,
            CategoryId = request.CategoryId,
        };

        await context.Products.AddAsync(entity, cancellationToken);
        foreach (var variant in request.Variants)
        {
            var (cover, gallery) = VariantGallery.ToStorage(variant.ImageUrl, variant.ImageUrls);
            var sku = ResolveVariantSku(request.ProductCode, variant.Color, variant.Size, existingVariantSkus);
            existingVariantSkus.Add(sku);
            await context.ProductVariants.AddAsync(
                new ProductVariant
                {
                    ProductId = entity.Id,
                    Sku = sku,
                    Size = variant.Size,
                    Color = variant.Color,
                    ColorHex = variant.Hex,
                    Price = variant.Price,
                    Quantity = variant.Quantity,
                    ImageUrl = cover,
                    VariantGalleryJson = gallery,
                    IsActive = variant.IsActive,
                },
                cancellationToken
            );
        }
        await context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }

    private static string ResolveVariantSku(
        string productCode,
        string color,
        string size,
        HashSet<string> existingSkus
    )
    {
        var candidate = SkuGenerator.Generate(productCode, color, size);
        var unique = candidate;
        var suffix = 2;

        while (existingSkus.Contains(unique))
        {
            unique = $"{candidate}-{suffix}";
            suffix++;
        }

        return unique;
    }
}
