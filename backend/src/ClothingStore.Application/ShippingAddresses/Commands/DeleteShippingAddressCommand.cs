using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.ShippingAddresses.Commands;

public record DeleteShippingAddressCommand(Guid UserId, Guid Id) : IRequest;

public class DeleteShippingAddressCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteShippingAddressCommand>
{
    public async Task Handle(DeleteShippingAddressCommand request, CancellationToken ct)
    {
        var address =
            await context.ShippingAddresses.FirstOrDefaultAsync(
                x => x.Id == request.Id && x.UserId == request.UserId,
                ct
            ) ?? throw new KeyNotFoundException("Address not found.");

        address.DeletedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }
}
