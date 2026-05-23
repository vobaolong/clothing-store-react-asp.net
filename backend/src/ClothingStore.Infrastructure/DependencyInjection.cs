using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Infrastructure.Persistence;
using ClothingStore.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ClothingStore.Infrastructure;

public static class DependencyInjection
{
	public static IServiceCollection AddInfrastructure(
			this IServiceCollection services,
			IConfiguration configuration
	)
	{
		services.AddDbContext<ApplicationDbContext>(opts =>
				opts.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
		);

		services.AddScoped<IApplicationDbContext>(sp =>
				sp.GetRequiredService<ApplicationDbContext>()
		);
		services.AddScoped<IJwtTokenService, JwtTokenService>();
		services.Configure<Application.Common.Models.EmailSettings>(
				configuration.GetSection("Email")
		);
		services.AddScoped<IEmailSender, MailKitEmailSender>();
		services.AddScoped<IEmailTemplateBuilder, EmailTemplateBuilder>();
		services.AddSingleton<IBackgroundEmailQueue, BackgroundEmailQueue>();
		services.AddHostedService<BackgroundEmailSenderService>();
		services.AddScoped<IEmailNotificationService, EmailNotificationService>();
		services.AddScoped<IPasswordHasher, PasswordHasher>();
		return services;
	}
}
