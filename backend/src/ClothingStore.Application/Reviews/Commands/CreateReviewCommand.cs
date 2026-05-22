using MediatR;

namespace ClothingStore.Application.Reviews.Commands;

public record CreateReviewCommand(
	Guid UserId,
	Guid ProductId,
	Guid? OrderItemId,
	int Rating,
	string? Comment,
	IReadOnlyList<string>? Tags
) : IRequest<ProductReviewDto>;