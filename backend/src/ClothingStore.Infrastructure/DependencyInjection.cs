using System.Net.Http;
using ClothingStore.Application.AI;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Infrastructure.Persistence;
using ClothingStore.Infrastructure.Security;
using ClothingStore.Infrastructure.Services;
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
        services.AddScoped<IEmailTemplateBuilder>(sp =>
        {
            var config = sp.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
            var baseUrl = config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            return new EmailTemplateBuilder(baseUrl);
        });
        services.AddSingleton<IBackgroundEmailQueue, BackgroundEmailQueue>();
        services.AddHostedService<BackgroundEmailSenderService>();
        services.AddHostedService<TierExpiryBackgroundService>();
        services.AddScoped<IEmailNotificationService, EmailNotificationService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IRememberMeTokenService, RememberMeTokenService>();
        services.AddSingleton<HttpClient>(_ =>
        {
            var handler = new SocketsHttpHandler
            {
                // Windows schannel revocation check can fail on some networks
                SslOptions = new System.Net.Security.SslClientAuthenticationOptions
                {
                    CertificateRevocationCheckMode = System
                        .Security
                        .Cryptography
                        .X509Certificates
                        .X509RevocationMode
                        .NoCheck,
                },
            };
            return new HttpClient(handler);
        });
        services.AddScoped<IAiService, GeminiChatService>();
        services.Configure<GeminiOptions>(configuration.GetSection(GeminiOptions.SectionName));

        return services;
    }
}
