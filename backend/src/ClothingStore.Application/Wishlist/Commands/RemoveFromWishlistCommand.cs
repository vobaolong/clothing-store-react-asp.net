using MediatR;

namespace ClothingStore.Application.Wishlist.Commands;

public record RemoveFromWishlistCommand(Guid UserId, Guid ProductId) : IRequest;
