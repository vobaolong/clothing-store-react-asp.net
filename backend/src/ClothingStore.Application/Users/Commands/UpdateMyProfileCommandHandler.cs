using ClothingStore.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Users.Commands;

public class UpdateMyProfileCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateMyProfileCommand>
{
    public async Task Handle(UpdateMyProfileCommand request, CancellationToken cancellationToken)
    {
        var fullName = request.FullName.Trim();
        var phone = request.Phone.Trim();

        if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Full name and phone are required.");

        var user =
            await context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        user.FullName = fullName;
        user.Phone = phone;
        await context.SaveChangesAsync(cancellationToken);
    }
}
