using MediatR;

namespace ClothingStore.Application.Reviews.Commands;

public record UpdateReviewCommand(Guid UserId, Guid ReviewId, int Rating, string? Comment)
    : IRequest<ProductReviewDto>;
