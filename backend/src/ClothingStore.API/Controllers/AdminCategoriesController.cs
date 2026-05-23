using ClothingStore.Application.Categories;
using ClothingStore.Application.Categories.Commands;
using ClothingStore.Application.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
public class AdminCategoriesController(ISender sender) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var data = await sender.Send(new GetAdminCategoriesQuery(), ct);
        return Ok(data, "Categories fetched.");
    }

    [HttpPost]
    public async Task<IActionResult> Create(CategoryUpsertDto request, CancellationToken ct)
    {
        var id = await sender.Send(new CreateCategoryCommand(request), ct);
        return Ok(id, "Category created.");
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulk(
        [FromBody] BulkCreateCategoriesCommand request,
        CancellationToken ct
    )
    {
        var createdIds = await sender.Send(request, ct);
        return Ok(createdIds, $"{createdIds.Count} categories created.");
    }

    [HttpPut("bulk")]
    public async Task<IActionResult> BulkSetActive(
        [FromBody] BulkSetActiveCategoriesCommand request,
        CancellationToken ct
    )
    {
        var count = await sender.Send(request, ct);
        return Ok(new { updated = count }, $"{count} categories updated.");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        CategoryUpsertDto request,
        CancellationToken ct
    )
    {
        await sender.Send(new UpdateCategoryCommand(id, request), ct);
        return Ok("Category updated.");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await sender.Send(new DeleteCategoryCommand(id), ct);
        return Ok("Category removed.");
    }
}
