using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Wishlist.Commands;

public class RemoveFromWishlistCommandHandler(IApplicationDbContext context)
		: IRequestHandler<RemoveFromWishlistCommand>
{
	public async Task Handle(RemoveFromWishlistCommand request, CancellationToken cancellationToken)
	{
		var item = await context.WishlistItems.FirstOrDefaultAsync(
				x => x.UserId == request.UserId && x.ProductId == request.ProductId,
				cancellationToken
		);
		if (item is null)
			return;

		context.WishlistItems.Remove(item);
		await context.SaveChangesAsync(cancellationToken);
	}
}
