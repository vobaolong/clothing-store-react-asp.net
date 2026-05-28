using System.Text.Json;
using ClosedXML.Excel;
using ClothingStore.Application.Products;
using ClothingStore.Application.Products.Commands;
using ClothingStore.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController(ISender sender) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var data = await sender.Send(new GetAdminProductsQuery(false), ct);
        return Ok(data, "Products fetched.");
    }

    [HttpGet("deleted")]
    public async Task<IActionResult> GetDeleted(CancellationToken ct)
    {
        var data = await sender.Send(new GetAdminProductsQuery(true), ct);
        return Ok(data, "Deleted products fetched.");
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] AdminProductUpsertDto request,
        CancellationToken ct
    )
    {
        var id = await sender.Send(
            new CreateProductCommand(
                request.Name,
                request.ProductCode,
                request.Description,
                request.DescriptionData,
                request.Price,
                request.SalePrice,
                request.CategoryId,
                request
                    .Variants.Select(v => new CreateProductVariant(
                        v.Sku,
                        v.Size,
                        v.Color,
                        v.Hex,
                        v.Price,
                        v.Quantity,
                        v.ImageUrl,
                        v.ImageUrls,
                        v.IsActive
                    ))
                    .ToList()
            ),
            ct
        );
        return Ok(id, "Product created.");
    }

    [HttpPost("import")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportFromExcel(
        [FromForm] IFormFile? file,
        CancellationToken ct
    )
    {
        if (file is null || file.Length == 0)
            return BadRequest("Excel file is required.");

        var extension = Path.GetExtension(file.FileName);
        if (
            !string.Equals(extension, ".xlsx", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(extension, ".xls", StringComparison.OrdinalIgnoreCase)
        )
        {
            return BadRequest("Only .xlsx and .xls files are supported.");
        }

        using var stream = file.OpenReadStream();
        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheets.FirstOrDefault();
        if (worksheet is null)
            return BadRequest("Excel file does not contain any worksheet.");

        var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 0;
        if (lastRow < 2)
            return BadRequest("Excel file does not contain data rows.");

        var rows = new List<AdminProductImportRowDto>();
        for (var row = 2; row <= lastRow; row++)
        {
            rows.Add(
                new AdminProductImportRowDto
                {
                    RowNumber = row,
                    ProductCode = worksheet.Cell(row, 1).GetString(),
                    ProductName = worksheet.Cell(row, 2).GetString(),
                    ProductDescription = worksheet.Cell(row, 3).GetString(),
                    Category = worksheet.Cell(row, 4).GetString(),
                    Brand = worksheet.Cell(row, 5).GetString(),
                    Material = worksheet.Cell(row, 6).GetString(),
                    Gender = worksheet.Cell(row, 7).GetString(),
                    VariantSku = worksheet.Cell(row, 8).GetString(),
                    Size = worksheet.Cell(row, 9).GetString(),
                    Color = worksheet.Cell(row, 10).GetString(),
                    Price = worksheet.Cell(row, 11).TryGetValue<decimal>(out var price)
                        ? price
                        : -1,
                    StockQuantity = worksheet.Cell(row, 12).TryGetValue<int>(out var stock)
                        ? stock
                        : -1,
                    VariantImageUrls = worksheet.Cell(row, 13).GetString(),
                }
            );
        }

        var result = await sender.Send(new ImportProductsCommand(rows), ct);
        return Ok(
            result,
            "Imported products from Excel. Expected columns: ProductCode, ProductName, ProductDescription, Category, Brand, Material, Gender, Size, Color, Price, StockQuantity, VariantImageUrls. VariantSku is optional and ignored when blank."
        );
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportToExcel(
        [FromBody] JsonElement body,
        CancellationToken ct
    )
    {
        if (
            !body.TryGetProperty("ids", out var idsProp)
            || idsProp.ValueKind != JsonValueKind.Array
        )
            return BadRequest("ids is required.");

        var ids = idsProp.EnumerateArray().Select(j => Guid.Parse(j.GetString()!)).ToList();
        if (ids.Count == 0)
            return BadRequest("No product ids provided.");

        var allProducts = await sender.Send(new GetAdminProductsQuery(false), ct);
        var products = allProducts.Where(p => ids.Contains(p.Id)).ToList();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Products");

        var headers = new[]
        {
            "ID",
            "Product Name",
            "Product Code",
            "Category",
            "Price",
            "Sale Price",
            "Stock Quantity",
            "Sold Count",
            "Status",
            "Created Date",
            "Updated Date",
        };

        for (var i = 0; i < headers.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = headers[i];
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
            worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4472C4");
            worksheet.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        worksheet.Row(1).Height = 30;

        // Format columns once (not per row)
        worksheet.Column(5).Style.NumberFormat.Format = "#,##0.00";
        worksheet.Column(6).Style.NumberFormat.Format = "#,##0.00";
        worksheet.Column(10).Style.NumberFormat.Format = "yyyy-mm-dd hh:mm:ss";
        worksheet.Column(11).Style.NumberFormat.Format = "yyyy-mm-dd hh:mm:ss";

        var row = 2;
        foreach (var product in products)
        {
            var totalStock = product.Variants?.Sum(v => v.Quantity) ?? 0;

            worksheet.Cell(row, 1).Value = product.Id.ToString();
            worksheet.Cell(row, 2).Value = product.Name;
            worksheet.Cell(row, 3).Value = product.ProductCode;
            worksheet.Cell(row, 4).Value = product.CategoryName;
            worksheet.Cell(row, 5).Value = product.Price;
            worksheet.Cell(row, 6).Value = product.SalePrice.HasValue
                ? product.SalePrice.Value
                : 0m;
            worksheet.Cell(row, 7).Value = totalStock;
            worksheet.Cell(row, 8).Value = product.SoldCount;
            worksheet.Cell(row, 9).Value = product.IsActive ? "Active" : "Inactive";
            worksheet.Cell(row, 10).Value = product.CreatedAt;
            worksheet.Cell(row, 11).Value = product.UpdatedAt;

            row++;
        }

        worksheet.Columns().AdjustToContents();
        worksheet.Column(1).Width = 40;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var fileName = $"products_export_{DateTime.Now:yyyyMMdd}.xlsx";
        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName
        );
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] AdminProductUpsertDto request,
        CancellationToken ct
    )
    {
        var updatedId = await sender.Send(new UpdateProductCommand(id, request), ct);
        return Ok(updatedId, "Product updated.");
    }

    [HttpPut("{id:guid}/active")]
    public async Task<IActionResult> UpdateActive(
        Guid id,
        [FromBody] JsonElement body,
        CancellationToken ct
    )
    {
        if (
            !body.TryGetProperty("isActive", out var isActiveProp)
            || (
                isActiveProp.ValueKind != JsonValueKind.True
                && isActiveProp.ValueKind != JsonValueKind.False
            )
        )
            return BadRequest("Invalid body.");

        var isActive = isActiveProp.GetBoolean();
        await sender.Send(new SetProductActiveCommand(id, isActive), ct);
        return Ok("Product updated.");
    }

    [HttpPut("bulk")]
    public async Task<IActionResult> BulkSetActive(
        [FromBody] JsonElement body,
        CancellationToken ct
    )
    {
        if (
            !body.TryGetProperty("ids", out var idsProp)
            || idsProp.ValueKind != JsonValueKind.Array
        )
            return BadRequest("Invalid body.");
        if (
            !body.TryGetProperty("isActive", out var isActiveProp)
            || (
                isActiveProp.ValueKind != JsonValueKind.True
                && isActiveProp.ValueKind != JsonValueKind.False
            )
        )
            return BadRequest("Invalid body.");

        var ids = idsProp.EnumerateArray().Select(j => Guid.Parse(j.GetString()!)).ToList();
        var isActive = isActiveProp.GetBoolean();
        var updated = await sender.Send(new BulkSetProductsActiveCommand(ids, isActive), ct);
        return Ok(updated, "Products updated.");
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteBulk([FromBody] JsonElement body, CancellationToken ct)
    {
        if (
            !body.TryGetProperty("ids", out var idsProp)
            || idsProp.ValueKind != JsonValueKind.Array
        )
            return BadRequest("Invalid body.");

        var ids = idsProp.EnumerateArray().Select(j => Guid.Parse(j.GetString()!)).ToList();
        if (ids == null || ids.Count == 0)
            return BadRequest("No product ids provided.");

        var deleted = await sender.Send(new BulkSoftDeleteProductsCommand(ids), ct);
        return Ok(deleted, $"{deleted} products removed.");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await sender.Send(new SoftDeleteProductCommand(id), ct);
        return Ok("Product removed.");
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id, CancellationToken ct)
    {
        await sender.Send(new RestoreProductCommand(id), ct);
        return Ok("Product restored.");
    }

    [HttpPost("bulk-restore")]
    public async Task<IActionResult> BulkRestore(
        [FromBody] IReadOnlyList<Guid> ids,
        CancellationToken ct
    )
    {
        if (ids == null || ids.Count == 0)
            return BadRequest("No product ids provided.");
        var restored = await sender.Send(new BulkRestoreProductsCommand(ids), ct);
        return Ok(restored, $"{restored} products restored.");
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> DeletePermanent(Guid id, CancellationToken ct)
    {
        await sender.Send(new DeleteProductPermanentCommand(id), ct);
        return Ok("Product permanently deleted.");
    }

    [HttpDelete("bulk/permanent")]
    public async Task<IActionResult> DeleteBulkPermanent(
        [FromBody] IReadOnlyList<Guid> ids,
        CancellationToken ct
    )
    {
        if (ids == null || ids.Count == 0)
            return BadRequest("No product ids provided.");
        var deleted = await sender.Send(new BulkDeleteProductsPermanentCommand(ids), ct);
        return Ok(deleted, $"Permanently deleted {deleted} product(s).");
    }
}
