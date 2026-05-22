using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.ShippingAddresses.Commands;

public record UpsertShippingAddressCommand(
    Guid? Id,
    Guid UserId,
    string FullName,
    string Phone,
    string? Province,
    string? ProvinceId,
    string? District,
    string? DistrictId,
    string? Ward,
    string? WardCode,
    string? Street,
    ShippingAddressLabel? Label,
    bool IsDefault
) : IRequest<Guid>;

public class UpsertShippingAddressCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpsertShippingAddressCommand, Guid>
{
    public async Task<Guid> Handle(UpsertShippingAddressCommand request, CancellationToken ct)
    {
        if (request.IsDefault)
        {
            var existingDefaults = await context.ShippingAddresses
                .Where(x => x.UserId == request.UserId && x.IsDefault && x.Id != request.Id)
                .ToListAsync(ct);
            foreach (var item in existingDefaults)
                item.IsDefault = false;
        }

        ShippingAddress address;
        if (request.Id.HasValue)
        {
            address = await context.ShippingAddresses
                .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId, ct)
                ?? throw new KeyNotFoundException("Address not found.");
        }
        else
        {
            address = new ShippingAddress { UserId = request.UserId };
            await context.ShippingAddresses.AddAsync(address, ct);
        }

        address.FullName = request.FullName;
        address.Phone = request.Phone;
        address.Province = request.Province?.Trim() ?? string.Empty;
        address.ProvinceId = request.ProvinceId?.Trim() ?? string.Empty;
        address.District = request.District?.Trim() ?? string.Empty;
        address.DistrictId = request.DistrictId?.Trim() ?? string.Empty;
        address.Ward = request.Ward?.Trim() ?? string.Empty;
        address.WardCode = request.WardCode?.Trim() ?? string.Empty;
        address.Street = request.Street?.Trim() ?? string.Empty;
        address.Label = request.Label;
        address.IsDefault = request.IsDefault;

        await context.SaveChangesAsync(ct);
        return address.Id;
    }
}
