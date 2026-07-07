using MediatR;

namespace ClothingStore.Application.Cart.Commands;

public record ClearMyCartCommand(Guid UserId) : IRequest;
