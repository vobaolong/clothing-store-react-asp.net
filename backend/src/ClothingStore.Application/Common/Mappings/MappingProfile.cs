using AutoMapper;
using ClothingStore.Application.Orders;
using ClothingStore.Application.Reviews;
using ClothingStore.Domain.Entities;

namespace ClothingStore.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<OrderStatusHistory, OrderStatusHistoryDto>()
            .ConvertUsing(src => new OrderStatusHistoryDto(src.Status, src.ChangedAt));

        CreateMap<OrderItem, OrderDetailItemDto>()
            .ConvertUsing(src => new OrderDetailItemDto(
                src.Id,
                src.ProductId,
                !string.IsNullOrWhiteSpace(src.ProductName)
                    ? src.ProductName
                    : (src.Product != null ? src.Product.Name ?? string.Empty : string.Empty),
                src.ProductVariantId,
                !string.IsNullOrWhiteSpace(src.ProductSlug)
                    ? src.ProductSlug
                    : (src.Product != null ? src.Product.Slug ?? string.Empty : string.Empty),
                src.VariantName,
                src.ProductVariant != null ? src.ProductVariant.Size : null,
                src.ProductVariant != null ? src.ProductVariant.Color : null,
                src.Quantity,
                src.UnitPrice,
                src.Quantity * src.UnitPrice,
                null,
                null,
                src.ProductVariant != null ? src.ProductVariant.ImageUrl : null
            ));

        CreateMap<Review, ProductReviewDto>()
            .ConvertUsing(src => new ProductReviewDto(
                src.Id,
                src.UserId,
                src.User != null ? src.User.FullName : string.Empty,
                src.Rating,
                src.Comment,
                ParseTags(src.Tags),
                src.VariantSize,
                src.VariantColor,
                src.CreatedAt,
                src.UpdatedAt,
                false
            ));
    }

    private static IReadOnlyList<string> ParseTags(string? tags)
    {
        if (string.IsNullOrWhiteSpace(tags))
            return [];

        return tags.Split(
                ',',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
            )
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .ToArray();
    }
}
