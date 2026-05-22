using MediatR;

namespace ClothingStore.Application.Users.Queries;

public record UserProfileDto(Guid Id, string FullName, string Email, string Phone, bool IsAdmin);

public record GetMyProfileQuery(Guid UserId) : IRequest<UserProfileDto>;
