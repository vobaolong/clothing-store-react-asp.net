using MediatR;

namespace ClothingStore.Application.Wishlist.Commands;

public record AddToWishlistCommand(Guid UserId, Guid ProductId) : IRequest;
