using MediatR;

namespace ClothingStore.Application.Reviews.Queries;

public record GetProductReviewsQuery(Guid ProductId, Guid? CurrentUserId = null)
		: IRequest<ProductReviewsDto>;
