using ClothingStore.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/products")]
public class ProductsController(ISender sender) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var data = await sender.Send(new GetProductsQuery(), ct);
        return Ok(data, "Products fetched.");
    }
}
