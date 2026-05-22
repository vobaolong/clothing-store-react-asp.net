using System.Net;
using System.Text.Json;
using ClothingStore.Application.Common.Exceptions;

namespace ClothingStore.API.Common;

public class ApiExceptionMiddleware(RequestDelegate next)
{
	private static readonly Dictionary<Type, HttpStatusCode> _exceptionStatusMap = new()
	{
		[typeof(UnauthorizedAccessException)] = HttpStatusCode.Unauthorized,
		[typeof(ForbiddenAccessException)] = HttpStatusCode.Forbidden,
		[typeof(InvalidOperationException)] = HttpStatusCode.BadRequest,
		[typeof(KeyNotFoundException)] = HttpStatusCode.NotFound,
		[typeof(ArgumentException)] = HttpStatusCode.BadRequest,
	};

	public async Task Invoke(HttpContext context)
	{
		try
		{
			await next(context);
		}
		catch (ValidationException ex)
		{
			await HandleValidationExceptionAsync(context, ex);
		}
		catch (FluentValidation.ValidationException ex)
		{
			var errors = ex.Errors
					.GroupBy(e => e.PropertyName, e => e.ErrorMessage)
					.ToDictionary(g => g.Key, g => g.ToArray());
			await HandleValidationExceptionAsync(context, new ValidationException(errors));
		}
		catch (Exception exception)
		{
			await HandleExceptionAsync(context, exception);
		}
	}

	private static Task HandleValidationExceptionAsync(HttpContext context, ValidationException ex)
	{
		context.Response.ContentType = "application/json";
		context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
		var body = JsonSerializer.Serialize(new
		{
			success = false,
			message = ex.Message,
			errors = ex.Errors
		}, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
		return context.Response.WriteAsync(body);
	}

	private static Task HandleExceptionAsync(HttpContext context, Exception exception)
	{
		var statusCode = _exceptionStatusMap.GetValueOrDefault(
				exception.GetType(),
				HttpStatusCode.InternalServerError
		);
		context.Response.ContentType = "application/json";
		context.Response.StatusCode = (int)statusCode;

		var body = JsonSerializer.Serialize(ApiResponse.Fail(exception.Message));
		return context.Response.WriteAsync(body);
	}
}
