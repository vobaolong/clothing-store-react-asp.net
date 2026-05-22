using MediatR;

namespace ClothingStore.Application.Reviews.Commands;

public record DeleteReviewCommand(Guid UserId, Guid ReviewId) : IRequest;
