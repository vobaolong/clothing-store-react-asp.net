using ClothingStore.Application.Common;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Products;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> CreateAsync(
        AdminProductUpsertDto dto,
        CancellationToken cancellationToken
    )
    {
        var slug = await ResolveUniqueProductSlugAsync(dto.Name, null, cancellationToken);
        var existingVariantSkus = await LoadExistingVariantSkusAsync(null, cancellationToken);
        var product = new Product
        {
            Name = dto.Name,
            Slug = slug,
            IsActive = true,
            Description = dto.Description,
            DescriptionHtml = dto.Description,
            DescriptionJson = dto.DescriptionData,
            Price = dto.Price,
            SalePrice = dto.SalePrice,
            SalePriceStartDate = dto.SalePriceStartDate,
            SalePriceEndDate = dto.SalePriceEndDate,
            CategoryId = dto.CategoryId,
        };

        // product.Id is initialized on construction (BaseEntity), derive ProductCode from it
        product.ProductCode = product.Id.ToString("N").Substring(0, 8).ToUpperInvariant();

        await _context.Products.AddAsync(product, cancellationToken);
        foreach (var variant in dto.Variants)
        {
            var (cover, gallery) = VariantGallery.ToStorage(variant.ImageUrl, variant.ImageUrls);
            var sku = ResolveVariantSku(
                product.ProductCode,
                variant.Color,
                variant.Size,
                existingVariantSkus
            );
            existingVariantSkus.Add(sku);
            await _context.ProductVariants.AddAsync(
                new ProductVariant
                {
                    ProductId = product.Id,
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

        await _context.SaveChangesAsync(cancellationToken);
        return product.Id;
    }

    public async Task<IReadOnlyList<AdminProductResponseDto>> GetAllAsync(
        CancellationToken cancellationToken
    )
    {
        var entities = await _context
            .Products.Include(product => product.Variants)
            .Include(product => product.Category)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return entities
            .Select(product => new AdminProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                ProductCode = !string.IsNullOrWhiteSpace(product.ProductCode)
                    ? product.ProductCode
                    : product.Id.ToString("N").Substring(0, 8).ToUpperInvariant(),
                Slug = product.Slug,
                Description = product.Description,
                DescriptionData = product.DescriptionJson ?? string.Empty,
                Price = product.Price,
                SalePrice = product.SalePrice,
                SalePriceStartDate = product.SalePriceStartDate,
                SalePriceEndDate = product.SalePriceEndDate,
                Stock = product.Variants.Sum(v => v.Quantity),
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                SoldCount = product.SoldCount,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                DeletedAt = product.DeletedAt,
                Variants = product.Variants.Select(MapVariant).ToList(),
            })
            .ToList();
    }

    public async Task<IReadOnlyList<AdminProductResponseDto>> GetDeletedAsync(
        CancellationToken cancellationToken
    )
    {
        var entities = await _context
            .Products.IgnoreQueryFilters()
            .Where(product => product.DeletedAt != null)
            .Include(product => product.Variants)
            .Include(product => product.Category)
            .AsNoTracking()
            .OrderByDescending(product => product.DeletedAt)
            .ToListAsync(cancellationToken);

        return entities
            .Select(product => new AdminProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                ProductCode = !string.IsNullOrWhiteSpace(product.ProductCode)
                    ? product.ProductCode
                    : product.Id.ToString("N").Substring(0, 8).ToUpperInvariant(),
                Slug = product.Slug,
                Description = product.Description,
                DescriptionData = product.DescriptionJson ?? string.Empty,
                Price = product.Price,
                SalePrice = product.SalePrice,
                SalePriceStartDate = product.SalePriceStartDate,
                SalePriceEndDate = product.SalePriceEndDate,
                Stock = product.Variants.Sum(v => v.Quantity),
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? string.Empty,
                SoldCount = product.SoldCount,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                DeletedAt = product.DeletedAt,
                Variants = product.Variants.Select(MapVariant).ToList(),
            })
            .ToList();
    }

    private static AdminProductVariantResponseDto MapVariant(ProductVariant variant)
    {
        var imageUrls = VariantGallery.Parse(variant.ImageUrl, variant.VariantGalleryJson);
        return new AdminProductVariantResponseDto
        {
            Id = variant.Id,
            Sku = variant.Sku,
            Size = variant.Size,
            Color = variant.Color,
            Hex = variant.ColorHex,
            Price = variant.Price,
            Quantity = variant.Quantity,
            ImageUrl = imageUrls.Count > 0 ? imageUrls[0] : null,
            ImageUrls = imageUrls,
            IsActive = variant.IsActive,
        };
    }

    public async Task<Guid> UpdateAsync(
        Guid id,
        AdminProductUpsertDto dto,
        CancellationToken cancellationToken
    )
    {
        var product =
            await _context.Products.FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken
            ) ?? throw new InvalidOperationException("Product not found.");
        product.Name = dto.Name;
        // keep existing ProductCode derived from Id; do not accept productCode from client
        if (string.IsNullOrWhiteSpace(product.ProductCode))
            product.ProductCode = product.Id.ToString("N").Substring(0, 8).ToUpperInvariant();
        product.Slug = await ResolveUniqueProductSlugAsync(dto.Name, product.Id, cancellationToken);
        product.Description = dto.Description;
        product.DescriptionHtml = dto.Description;
        product.DescriptionJson = dto.DescriptionData;
        product.Price = dto.Price;
        product.SalePrice = dto.SalePrice;
        product.SalePriceStartDate = dto.SalePriceStartDate;
        product.SalePriceEndDate = dto.SalePriceEndDate;
        product.CategoryId = dto.CategoryId;

        var oldVariants = await _context
            .ProductVariants.Where(variant => variant.ProductId == product.Id)
            .ToListAsync(cancellationToken);
        var existingVariantSkus = await LoadExistingVariantSkusAsync(product.Id, cancellationToken);
        _context.ProductVariants.RemoveRange(oldVariants);
        foreach (var variant in dto.Variants)
        {
            var (cover, gallery) = VariantGallery.ToStorage(variant.ImageUrl, variant.ImageUrls);
            var sku = ResolveVariantSku(
                product.ProductCode,
                variant.Color,
                variant.Size,
                existingVariantSkus
            );
            existingVariantSkus.Add(sku);
            await _context.ProductVariants.AddAsync(
                new ProductVariant
                {
                    ProductId = product.Id,
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

        await _context.SaveChangesAsync(cancellationToken);
        return product.Id;
    }

    public async Task<AdminProductImportResultDto> ImportAsync(
        IReadOnlyList<AdminProductImportRowDto> rows,
        CancellationToken cancellationToken
    )
    {
        var errors = new List<AdminProductImportRowErrorDto>();
        var result = new AdminProductImportResultDto { TotalRows = rows.Count, Errors = errors };
        var grouped = rows.GroupBy(r => r.ProductCode?.Trim() ?? string.Empty)
            .Where(g => !string.IsNullOrWhiteSpace(g.Key))
            .ToList();
        result.TotalProductsDetected = grouped.Count;
        var existingVariantSkus = await LoadExistingVariantSkusAsync(null, cancellationToken);

        foreach (var productGroup in grouped)
        {
            var first = productGroup.First();
            try
            {
                var categoryName = first.Category.Trim();
                var category = await _context
                    .Categories.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Name == categoryName, cancellationToken);
                if (category is null)
                {
                    errors.AddRange(
                        productGroup.Select(r => new AdminProductImportRowErrorDto
                        {
                            RowNumber = r.RowNumber,
                            Error = $"Category '{categoryName}' not found.",
                        })
                    );
                    continue;
                }

                if (string.IsNullOrWhiteSpace(first.ProductName))
                {
                    errors.AddRange(
                        productGroup.Select(r => new AdminProductImportRowErrorDto
                        {
                            RowNumber = r.RowNumber,
                            Error = "ProductName is required.",
                        })
                    );
                    continue;
                }
                var variants = new List<AdminProductVariantDto>();
                var rowFailed = false;
                var variantSkuSet = new HashSet<string>(
                    existingVariantSkus,
                    StringComparer.OrdinalIgnoreCase
                );
                foreach (var row in productGroup)
                {
                    if (
                        string.IsNullOrWhiteSpace(row.Size)
                        || string.IsNullOrWhiteSpace(row.Color)
                        || row.Price <= 0
                        || row.StockQuantity < 0
                    )
                    {
                        errors.Add(
                            new AdminProductImportRowErrorDto
                            {
                                RowNumber = row.RowNumber,
                                Error =
                                    "Invalid variant fields (Size, Color, Price, StockQuantity).",
                            }
                        );
                        rowFailed = true;
                        continue;
                    }
                    var sku = ResolveVariantSku(
                        first.ProductCode,
                        row.Color,
                        row.Size,
                        variantSkuSet
                    );
                    if (!variantSkuSet.Add(sku))
                    {
                        errors.Add(
                            new AdminProductImportRowErrorDto
                            {
                                RowNumber = row.RowNumber,
                                Error = $"Duplicate VariantSku '{sku}'.",
                            }
                        );
                        rowFailed = true;
                        continue;
                    }
                    var images = string.IsNullOrWhiteSpace(row.VariantImageUrls)
                        ? Array.Empty<string>()
                        : row.VariantImageUrls.Split(
                            new[] { ',', ';', '\n', '\r' },
                            StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
                        );
                    variants.Add(
                        new AdminProductVariantDto
                        {
                            Sku = sku,
                            Size = row.Size.Trim(),
                            Color = row.Color.Trim(),
                            Hex = "#000000",
                            Price = row.Price,
                            Quantity = row.StockQuantity,
                            ImageUrl = images.FirstOrDefault(),
                            ImageUrls = images,
                            IsActive = true,
                        }
                    );
                }
                if (rowFailed || variants.Count == 0)
                    continue;

                var dto = new AdminProductUpsertDto
                {
                    Name = first.ProductName.Trim(),
                    ProductCode = first.ProductCode.Trim(),
                    Description = string.IsNullOrWhiteSpace(first.ProductDescription)
                        ? "<p></p>"
                        : first.ProductDescription,
                    DescriptionData = "{}",
                    Price = variants.Min(v => v.Price ?? 0),
                    SalePrice = null,
                    CategoryId = category.Id,
                    Variants = variants,
                };

                await CreateAsync(dto, cancellationToken);
                existingVariantSkus.UnionWith(dto.Variants.Select(v => v.Sku));
                result.ProductsImported++;
                result.VariantsImported += variants.Count;
            }
            catch (Exception ex)
            {
                errors.AddRange(
                    productGroup.Select(r => new AdminProductImportRowErrorDto
                    {
                        RowNumber = r.RowNumber,
                        Error = ex.Message,
                    })
                );
            }
        }
        result.FailedRows = errors.Select(e => e.RowNumber).Distinct().Count();
        return result;
    }

    public async Task RestoreAsync(Guid id, CancellationToken cancellationToken)
    {
        var product =
            await _context
                .Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    product => product.Id == id && product.DeletedAt != null,
                    cancellationToken
                )
            ?? throw new InvalidOperationException("Deleted product not found.");
        product.Slug = await ResolveUniqueProductSlugAsync(
            product.Name,
            product.Id,
            cancellationToken
        );
        product.DeletedAt = null;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> BulkRestoreAsync(
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken
    )
    {
        var products = await _context
            .Products.IgnoreQueryFilters()
            .Where(product => ids.Contains(product.Id) && product.DeletedAt != null)
            .ToListAsync(cancellationToken);

        foreach (var product in products)
        {
            product.Slug = await ResolveUniqueProductSlugAsync(
                product.Name,
                product.Id,
                cancellationToken
            );
            product.DeletedAt = null;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return products.Count;
    }

    public async Task DeletePermanentAsync(Guid id, CancellationToken cancellationToken)
    {
        var product =
            await _context
                .Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    product => product.Id == id && product.DeletedAt != null,
                    cancellationToken
                )
            ?? throw new InvalidOperationException("Deleted product not found in trash.");

        var variants = await _context
            .ProductVariants.IgnoreQueryFilters()
            .Where(variant => variant.ProductId == id)
            .ToListAsync(cancellationToken);
        var variantIds = variants.Select(variant => variant.Id).ToList();

        var hasOrderRefs = await _context
            .OrderItems.IgnoreQueryFilters()
            .AnyAsync(
                orderItem =>
                    orderItem.ProductId == id || variantIds.Contains(orderItem.ProductVariantId),
                cancellationToken
            );
        if (hasOrderRefs)
            throw new InvalidOperationException("Product referenced by orders.");

        _context.ProductVariants.RemoveRange(variants);
        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> BulkDeletePermanentAsync(
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken
    )
    {
        var deleted = 0;
        foreach (var id in ids.Distinct())
        {
            var product = await _context
                .Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    product => product.Id == id && product.DeletedAt != null,
                    cancellationToken
                );
            if (product is null)
                continue;

            var variants = await _context
                .ProductVariants.IgnoreQueryFilters()
                .Where(variant => variant.ProductId == id)
                .ToListAsync(cancellationToken);
            var variantIds = variants.Select(variant => variant.Id).ToList();

            var hasOrderRefs = await _context
                .OrderItems.IgnoreQueryFilters()
                .AnyAsync(
                    orderItem =>
                        orderItem.ProductId == id
                        || variantIds.Contains(orderItem.ProductVariantId),
                    cancellationToken
                );
            if (hasOrderRefs)
                continue;

            _context.ProductVariants.RemoveRange(variants);
            _context.Products.Remove(product);
            deleted++;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return deleted;
    }

    public async Task SoftDeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var product =
            await _context.Products.FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken
            ) ?? throw new InvalidOperationException("Product not found.");
        product.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> SoftDeleteBulkAsync(
        IReadOnlyList<Guid> ids,
        CancellationToken cancellationToken
    )
    {
        var products = await _context
            .Products.Where(product => ids.Contains(product.Id))
            .ToListAsync(cancellationToken);
        var utcNow = DateTime.UtcNow;
        foreach (var p in products)
            p.DeletedAt = utcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return products.Count;
    }

    public async Task SetActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken)
    {
        var product =
            await _context.Products.FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken
            ) ?? throw new InvalidOperationException("Product not found.");
        product.IsActive = isActive;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> BulkSetActiveAsync(
        IReadOnlyList<Guid> ids,
        bool isActive,
        CancellationToken cancellationToken
    )
    {
        var products = await _context
            .Products.Where(product => ids.Contains(product.Id))
            .ToListAsync(cancellationToken);
        foreach (var p in products)
            p.IsActive = isActive;
        await _context.SaveChangesAsync(cancellationToken);
        return products.Count;
    }

    private async Task<string> ResolveUniqueProductSlugAsync(
        string name,
        Guid? excludeProductId,
        CancellationToken cancellationToken
    )
    {
        var baseSlug = SlugGenerator.Generate(name);
        if (string.IsNullOrEmpty(baseSlug))
            baseSlug = "product";

        var slug = baseSlug;
        var suffix = 2;
        while (
            await _context.Products.AnyAsync(
                product =>
                    product.Slug == slug
                    && (!excludeProductId.HasValue || product.Id != excludeProductId.Value),
                cancellationToken
            )
        )
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }

        return slug;
    }

    private async Task<HashSet<string>> LoadExistingVariantSkusAsync(
        Guid? excludeProductId,
        CancellationToken cancellationToken
    )
    {
        var query = _context.ProductVariants.AsNoTracking().AsQueryable();
        if (excludeProductId.HasValue)
        {
            query = query.Where(variant => variant.ProductId != excludeProductId.Value);
        }

        var values = await query.Select(variant => variant.Sku).ToListAsync(cancellationToken);
        return new HashSet<string>(values, StringComparer.OrdinalIgnoreCase);
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
