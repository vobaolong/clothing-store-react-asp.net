using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.ShippingAddresses.Queries;

public record GetMyShippingAddressesQuery(Guid UserId)
    : IRequest<IReadOnlyList<ShippingAddressDto>>;

public class GetMyShippingAddressesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMyShippingAddressesQuery, IReadOnlyList<ShippingAddressDto>>
{
    public async Task<IReadOnlyList<ShippingAddressDto>> Handle(
        GetMyShippingAddressesQuery request,
        CancellationToken ct
    )
    {
        var entities = await context
            .ShippingAddresses.AsNoTracking()
            .Where(x => x.UserId == request.UserId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        return entities
            .Select(x => new ShippingAddressDto(
                x.Id,
                x.FullName,
                x.Phone,
                x.Province,
                x.ProvinceId,
                x.District,
                x.DistrictId,
                x.Ward,
                x.WardCode,
                x.Street,
                x.Label,
                x.IsDefault,
                x.CreatedAt,
                BuildFullAddress(x)
            ))
            .ToList();
    }

    private static string BuildFullAddress(ShippingAddress address)
    {
        var segments = new[] { address.Street, address.Ward, address.District, address.Province }
            .Where(segment => !string.IsNullOrWhiteSpace(segment))
            .Select(segment => segment.Trim());
        return string.Join(", ", segments);
    }
}
