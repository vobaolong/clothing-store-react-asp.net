namespace ClothingStore.API.Services;

public interface IUserContext
{
	Guid? GetUserId();
	Guid GetRequiredUserId();
}
