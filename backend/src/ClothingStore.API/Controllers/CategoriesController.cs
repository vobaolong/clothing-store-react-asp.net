using ClothingStore.Application.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/categories")]
public class CategoriesController(ISender sender) : BaseApiController
{
	[HttpGet]
	[AllowAnonymous]
	public async Task<IActionResult> GetAll(CancellationToken ct)
	{
		var data = await sender.Send(new GetPublicCategoriesQuery(), ct);
		return Ok(data, "Categories fetched.");
	}
}