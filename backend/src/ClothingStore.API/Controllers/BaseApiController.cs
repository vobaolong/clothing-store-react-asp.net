using ClothingStore.API.Common;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected IActionResult Ok<T>(T? data, string? message = null) =>
        base.Ok(ApiResponse<T>.Ok(data, message));

    protected IActionResult Ok(string? message = null) => base.Ok(ApiResponse.Ok(message));

    protected IActionResult Created<T>(T? data, string? message = null) =>
        base.Created(string.Empty, ApiResponse<T>.Ok(data, message));

    protected IActionResult BadRequest(string? message) =>
        base.BadRequest(ApiResponse.Fail(message ?? "Bad request"));

    protected IActionResult NotFound(string? message) =>
        base.NotFound(ApiResponse.Fail(message ?? "Not found"));
}
