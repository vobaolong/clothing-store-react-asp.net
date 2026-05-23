using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.ShippingAddresses.Commands;

public record SetDefaultShippingAddressCommand(Guid UserId, Guid Id) : IRequest;

public class SetDefaultShippingAddressCommandHandler(IApplicationDbContext context)
    : IRequestHandler<SetDefaultShippingAddressCommand>
{
    public async Task Handle(SetDefaultShippingAddressCommand request, CancellationToken ct)
    {
        var addresses = await context
            .ShippingAddresses.Where(x => x.UserId == request.UserId)
            .ToListAsync(ct);

        var selected =
            addresses.FirstOrDefault(x => x.Id == request.Id)
            ?? throw new KeyNotFoundException("Address not found.");

        foreach (var item in addresses)
            item.IsDefault = item.Id == request.Id;

        await context.SaveChangesAsync(ct);
    }
}
