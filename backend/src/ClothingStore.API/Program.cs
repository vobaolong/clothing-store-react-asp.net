using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using ClothingStore.API.Common;
using ClothingStore.API.Hubs;
using ClothingStore.API.Services;
using ClothingStore.Application;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Infrastructure;
using ClothingStore.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VNPAY.Extensions;

var builder = WebApplication.CreateBuilder(args);

// ── JSON & Controllers ──────────────────────────────────────────
builder
    .Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opts.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// ── Application & Infrastructure ─────────────────────────────────
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.Configure<CloudinaryOptions>(
    builder.Configuration.GetSection(CloudinaryOptions.SectionName)
);

// ── Application Services ─────────────────────────────────────────
builder.Services.AddScoped<IImageStorageService, CloudinaryImageStorageService>();
builder.Services.AddSingleton<IConnectionManager, ConnectionManager>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();

// ── VNPay ────────────────────────────────────────────────────────
var vnpayConfig = builder.Configuration.GetSection("VNPAY");
builder.Services.AddVnpayClient(config =>
{
    config.TmnCode = vnpayConfig["TmnCode"] ?? string.Empty;
    config.HashSecret = vnpayConfig["HashSecret"] ?? string.Empty;
    config.CallbackUrl = vnpayConfig["CallbackUrl"] ?? string.Empty;
    if (!string.IsNullOrWhiteSpace(vnpayConfig["BaseUrl"]))
        config.BaseUrl = vnpayConfig["BaseUrl"]!;
    if (!string.IsNullOrWhiteSpace(vnpayConfig["Version"]))
        config.Version = vnpayConfig["Version"]!;
    if (!string.IsNullOrWhiteSpace(vnpayConfig["OrderType"]))
        config.OrderType = vnpayConfig["OrderType"]!;
});

// ── SignalR ──────────────────────────────────────────────────────
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// ── JWT Authentication ──────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) && !builder.Environment.IsDevelopment())
    throw new InvalidOperationException("Missing required configuration: Jwt:Secret");

var secret = string.IsNullOrWhiteSpace(jwtSecret)
    ? "super-secret-dev-key-change-me-2026"
    : jwtSecret;

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (
                    !string.IsNullOrEmpty(accessToken)
                    && context.HttpContext.Request.Path.StartsWithSegments("/hubs")
                )
                    context.Token = accessToken;
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
    options.AddPolicy(
        "frontend",
        p =>
            p.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
    )
);

var app = builder.Build();

app.UseMiddleware<ApiExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ── Database Migration & Seeding ─────────────────────────────────
var autoMigrate = builder.Configuration.GetValue(
    "Startup:AutoMigrate",
    app.Environment.IsDevelopment()
);
var seedAdmin = builder.Configuration.GetValue(
    "Startup:SeedAdmin",
    app.Environment.IsDevelopment()
);

if (autoMigrate)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    if (seedAdmin)
    {
        SeedAdminUser(db);
    }
}

// ── Middleware Pipeline ──────────────────────────────────────────
app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.Run();

// ── Helper Methods ──────────────────────────────────────────────
static void SeedAdminUser(ApplicationDbContext db)
{
    const string adminEmail = "admin@wearly.local";
    var admin = db.Users.FirstOrDefault(x => x.Email == adminEmail);

    if (admin is null)
    {
        db.Users.Add(
            new User
            {
                FullName = "System Admin",
                Email = adminEmail,
                Phone = "0900000000",
                PasswordHash = Convert.ToHexString(
                    SHA256.HashData(Encoding.UTF8.GetBytes("Admin@123"))
                ),
                IsAdmin = true,
                IsEmailVerified = true,
            }
        );
        db.SaveChanges();
    }
    else if (!admin.IsAdmin)
    {
        admin.IsAdmin = true;
        db.SaveChanges();
    }
}
