using AutoMapper;
using ClothingStore.Application.Products;
using ClothingStore.Domain.Entities;

namespace ClothingStore.Application.Common.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        CreateMap<ProductVariant, ProductVariantDto>()
            .ConvertUsing((ProductVariant v) => MapVariant(v));
        CreateMap<Product, ProductDto>()
            .ForCtorParam(
                nameof(ProductDto.ProductCode),
                opt => opt.MapFrom(src => src.ProductCode)
            )
            .ForCtorParam(
                nameof(ProductDto.Category),
                opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty)
            )
            .ForCtorParam(
                nameof(ProductDto.CategorySlug),
                opt => opt.MapFrom(src => src.Category != null ? src.Category.Slug : string.Empty)
            )
            .ForCtorParam(nameof(ProductDto.CategoryId), opt => opt.MapFrom(src => src.CategoryId))
            .ForCtorParam(
                nameof(ProductDto.DescriptionData),
                opt => opt.MapFrom(src => src.DescriptionJson ?? string.Empty)
            )
            .ForCtorParam(nameof(ProductDto.SalePrice), opt => opt.MapFrom(src => src.SalePrice))
            .ForCtorParam(
                nameof(ProductDto.SalePriceStartDate),
                opt => opt.MapFrom(src => src.SalePriceStartDate)
            )
            .ForCtorParam(
                nameof(ProductDto.SalePriceEndDate),
                opt => opt.MapFrom(src => src.SalePriceEndDate)
            )
            .ForCtorParam(
                nameof(ProductDto.Stock),
                opt => opt.MapFrom(src => src.Variants.Sum(v => v.Quantity))
            )
            .ForCtorParam(
                nameof(ProductDto.TotalAvailable),
                opt => opt.MapFrom(src => src.Variants.Sum(v => v.Quantity))
            )
            .ForCtorParam(nameof(ProductDto.CreatedAt), opt => opt.MapFrom(src => src.CreatedAt))
            .ForCtorParam(nameof(ProductDto.SoldCount), opt => opt.MapFrom(src => src.SoldCount))
            .ForCtorParam(
                nameof(ProductDto.AverageRating),
                opt => opt.MapFrom(src => src.AverageRating)
            )
            .ForCtorParam(
                nameof(ProductDto.ReviewCount),
                opt => opt.MapFrom(src => src.ReviewCount)
            )
            .ForCtorParam(
                nameof(ProductDto.CategoryBreadcrumbs),
                opt => opt.MapFrom(_ => Array.Empty<CategoryBreadcrumbDto>())
            )
            .ForCtorParam(nameof(ProductDto.Variants), opt => opt.MapFrom(src => src.Variants));
    }

    private static ProductVariantDto MapVariant(ProductVariant v)
    {
        var urls = VariantGallery.Parse(v.ImageUrl, v.VariantGalleryJson);
        return new ProductVariantDto(
            v.Id,
            v.Sku,
            v.Size,
            v.Color,
            v.ColorHex,
            v.Price,
            v.Quantity,
            urls.Count > 0 ? urls[0] : null,
            urls,
            v.IsActive
        );
    }
}
