using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MediatR;

namespace ClothingStore.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IPublisher publisher)
		: DbContext(options),
				IApplicationDbContext
{
	public DbSet<User> Users => Set<User>();
	public DbSet<Category> Categories => Set<Category>();
	public DbSet<Product> Products => Set<Product>();
	public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
	public DbSet<Banner> Banners => Set<Banner>();
	public DbSet<Order> Orders => Set<Order>();
	public DbSet<OrderItem> OrderItems => Set<OrderItem>();
	public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
	public DbSet<Coupon> Coupons => Set<Coupon>();
	public DbSet<ShippingAddress> ShippingAddresses => Set<ShippingAddress>();
	public DbSet<Review> Reviews => Set<Review>();
	public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
	public DbSet<Notification> Notifications => Set<Notification>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		ConfigureConverters(modelBuilder);
		ConfigureIndexes(modelBuilder);
		ConfigureCategory(modelBuilder);
		ConfigureOrder(modelBuilder);
		ConfigureOrderItem(modelBuilder);
		ConfigureProduct(modelBuilder);
		ConfigureReview(modelBuilder);
		ConfigureWishlist(modelBuilder);
		ConfigureSoftDeleteQueryFilters(modelBuilder);

		base.OnModelCreating(modelBuilder);
	}

	private static void ConfigureSoftDeleteQueryFilters(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Category>().HasQueryFilter(c => c.DeletedAt == null);
		modelBuilder.Entity<Product>().HasQueryFilter(p => p.DeletedAt == null);
		modelBuilder.Entity<OrderItem>().HasQueryFilter(oi => oi.Product == null || oi.Product.DeletedAt == null);
		modelBuilder.Entity<ProductVariant>().HasQueryFilter(v => v.Product!.DeletedAt == null);
		modelBuilder.Entity<Banner>().HasQueryFilter(b => b.DeletedAt == null);
		modelBuilder.Entity<ShippingAddress>().HasQueryFilter(a => a.DeletedAt == null);
	}

	private static void ConfigureConverters(ModelBuilder modelBuilder)
	{
		var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
				v =>
						v.Kind == DateTimeKind.Utc
								? v
								: DateTime.SpecifyKind(v, DateTimeKind.Local).ToUniversalTime(),
				v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
		);
		var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
				v =>
						v.HasValue
								? (
										v.Value.Kind == DateTimeKind.Utc
												? v
												: DateTime.SpecifyKind(v.Value, DateTimeKind.Local).ToUniversalTime()
								)
								: v,
				v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
		);

		foreach (var entityType in modelBuilder.Model.GetEntityTypes())
		{
			foreach (var property in entityType.GetProperties())
			{
				if (property.ClrType == typeof(DateTime))
					property.SetValueConverter(dateTimeConverter);
				else if (property.ClrType == typeof(DateTime?))
					property.SetValueConverter(nullableDateTimeConverter);
			}
		}
	}

	private static void ConfigureIndexes(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
		modelBuilder
				.Entity<Coupon>()
				.HasIndex(x => x.Code)
				.IsUnique()
				.HasFilter("\"DeletedAt\" IS NULL");
		modelBuilder
				.Entity<Category>()
				.HasIndex(x => x.Slug)
				.IsUnique()
				.HasFilter("\"DeletedAt\" IS NULL");
		modelBuilder
				.Entity<Product>()
				.HasIndex(x => x.ProductCode)
				.IsUnique()
				.HasFilter("\"DeletedAt\" IS NULL");
		modelBuilder
				.Entity<Product>()
				.HasIndex(x => x.Slug)
				.IsUnique()
				.HasFilter("\"DeletedAt\" IS NULL");
		modelBuilder
				.Entity<ProductVariant>()
				.HasIndex(x => x.Sku)
				.IsUnique();
		modelBuilder
				.Entity<ProductVariant>()
				.HasIndex(x => new
				{
					x.ProductId,
					x.Size,
					x.Color,
				})
				.IsUnique();
		modelBuilder
				.Entity<Review>()
				.HasIndex(x => new { x.UserId, x.OrderItemId })
				.IsUnique()
				.HasFilter("\"OrderItemId\" IS NOT NULL");
		modelBuilder.Entity<WishlistItem>().HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
		modelBuilder
				.Entity<Order>()
				.HasIndex(x => x.IdempotencyKey)
				.IsUnique()
				.HasFilter("\"IdempotencyKey\" IS NOT NULL");
	}

	private static void ConfigureCategory(ModelBuilder modelBuilder)
	{
		var genderConverter = new ValueConverter<Gender, string>(
				v => v.ToString().ToLowerInvariant(),
				v => Enum.Parse<Gender>(v, true)
		);
		var productTypeConverter = new ValueConverter<ProductType?, string?>(
				v => v.HasValue ? v.Value.ToString().ToLowerInvariant() : null,
				v => string.IsNullOrWhiteSpace(v) ? null : Enum.Parse<ProductType>(v, true)
		);
		modelBuilder.Entity<Category>(e =>
		{
			e.HasOne(x => x.Parent)
							.WithMany(x => x.Children)
							.HasForeignKey(x => x.ParentId)
							.OnDelete(DeleteBehavior.SetNull);

			e.Property(x => x.Level).HasDefaultValue((byte)0);
			e.Property(x => x.Gender).HasConversion(genderConverter).HasDefaultValue(Gender.Unisex);
			e.Property(x => x.ProductType).HasConversion(productTypeConverter);
			e.Property(x => x.IsActive).HasDefaultValue(true);
		});
	}

	private static void ConfigureOrder(ModelBuilder modelBuilder)
	{
		var orderStatusConverter = new ValueConverter<OrderStatus, string>(
				v => v.ToString(),
				v => Enum.Parse<OrderStatus>(v, true)
		);
		var paymentMethodConverter = new ValueConverter<PaymentMethod, string>(
				v => v.ToString(),
				v => Enum.Parse<PaymentMethod>(v, true)
		);
		var paymentStatusConverter = new ValueConverter<PaymentStatus, string>(
				v => v.ToString(),
				v => Enum.Parse<PaymentStatus>(v, true)
		);
		var nullableShippingAddressLabelConverter = new ValueConverter<
				ShippingAddressLabel?,
				string?
		>(v => v.HasValue ? v.Value.ToString() : null, v => ParseShippingAddressLabel(v));

		modelBuilder.Entity<Order>(e =>
		{
			e.Property(o => o.Status).HasConversion(orderStatusConverter);
			e.Property(o => o.PaymentMethod).HasConversion(paymentMethodConverter);
			e.Property(o => o.PaymentStatus).HasConversion(paymentStatusConverter);
			e.HasMany(o => o.StatusHistories)
							.WithOne(h => h.Order)
							.HasForeignKey(h => h.OrderId)
							.OnDelete(DeleteBehavior.Cascade);

			e.HasOne(x => x.Coupon)
							.WithMany()
							.HasForeignKey(x => x.CouponId)
							.OnDelete(DeleteBehavior.SetNull);

			e.OwnsOne(
							o => o.ShippingInfo,
							s =>
							{
								s.Property(x => x.FullName).HasColumnName("ShippingName");
								s.Property(x => x.Phone).HasColumnName("ShippingPhone");
								s.Property(x => x.Province).HasColumnName("ShippingProvince");
								s.Property(x => x.ProvinceId).HasColumnName("ShippingProvinceId");
								s.Property(x => x.District).HasColumnName("ShippingDistrict");
								s.Property(x => x.DistrictId).HasColumnName("ShippingDistrictId");
								s.Property(x => x.Ward).HasColumnName("ShippingWard");
								s.Property(x => x.WardCode).HasColumnName("ShippingWardCode");
								s.Property(x => x.Street).HasColumnName("ShippingStreet");
								s.Property(x => x.Label)
												.HasColumnName("ShippingLabel")
												.HasConversion(nullableShippingAddressLabelConverter);
							}
					);
		});
	}

	private static void ConfigureOrderItem(ModelBuilder modelBuilder)
	{
		modelBuilder
				.Entity<OrderItem>()
				.HasOne(x => x.ProductVariant)
				.WithMany()
				.HasForeignKey(x => x.ProductVariantId);

		var orderStatusConverter = new ValueConverter<OrderStatus, string>(
				v => v.ToString(),
				v => Enum.Parse<OrderStatus>(v, true)
		);
		modelBuilder.Entity<OrderStatusHistory>(e =>
		{
			e.Property(x => x.Status).HasConversion(orderStatusConverter);
			e.HasIndex(x => new { x.OrderId, x.ChangedAt });
		});
	}

	private static void ConfigureProduct(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Product>(e => e.Property(x => x.IsActive).HasDefaultValue(true));

		modelBuilder
				.Entity<ShippingAddress>()
				.HasOne(x => x.User)
				.WithMany()
				.HasForeignKey(x => x.UserId);
		var nullableShippingAddressLabelConverter = new ValueConverter<
				ShippingAddressLabel?,
				string?
		>(v => v.HasValue ? v.Value.ToString() : null, v => ParseShippingAddressLabel(v));
		modelBuilder
				.Entity<ShippingAddress>()
				.Property(x => x.Label)
				.HasConversion(nullableShippingAddressLabelConverter);
	}

	private static void ConfigureReview(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Review>(e =>
		{
			e.ToTable(
							"Reviews",
							t =>
									t.HasCheckConstraint("CK_Reviews_Rating", "\"Rating\" >= 1 AND \"Rating\" <= 5")
					);
			e.Property(x => x.Rating).IsRequired();
			e.Property(x => x.Comment).HasColumnType("text");
			e.Property(x => x.Tags).HasColumnType("text");
			e.Property(x => x.UpdatedAt).HasColumnType("timestamp with time zone");
			e.HasQueryFilter(x => x.Product!.DeletedAt == null);
			e.HasOne(x => x.User)
							.WithMany()
							.HasForeignKey(x => x.UserId)
							.OnDelete(DeleteBehavior.Cascade);
			e.HasOne(x => x.Product)
							.WithMany()
							.HasForeignKey(x => x.ProductId)
							.OnDelete(DeleteBehavior.Cascade);
			e.HasOne(x => x.OrderItem)
							.WithMany()
							.HasForeignKey(x => x.OrderItemId)
							.OnDelete(DeleteBehavior.SetNull);
		});
	}

	private static void ConfigureWishlist(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<WishlistItem>(e =>
		{
			e.ToTable("Wishlist");
			e.HasQueryFilter(x => x.Product!.DeletedAt == null);
			e.HasOne(x => x.User)
							.WithMany()
							.HasForeignKey(x => x.UserId)
							.OnDelete(DeleteBehavior.Cascade);
			e.HasOne(x => x.Product)
							.WithMany()
							.HasForeignKey(x => x.ProductId)
							.OnDelete(DeleteBehavior.Cascade);
		});
	}

	private static ShippingAddressLabel? ParseShippingAddressLabel(string? rawValue)
	{
		if (string.IsNullOrWhiteSpace(rawValue))
			return null;

		return Enum.TryParse<ShippingAddressLabel>(rawValue, true, out var label) ? label : null;
	}

	public override int SaveChanges()
	{
		ApplyAuditTimestamps();
		return base.SaveChanges();
	}

	public override int SaveChanges(bool acceptAllChangesOnSuccess)
	{
		ApplyAuditTimestamps();
		return base.SaveChanges(acceptAllChangesOnSuccess);
	}

	public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
		ApplyAuditTimestamps();
		var domainEvents = CollectAndClearDomainEvents();
		var result = await base.SaveChangesAsync(cancellationToken);
		await DispatchEventsAsync(domainEvents);
		return result;
	}

	public override async Task<int> SaveChangesAsync(
			bool acceptAllChangesOnSuccess,
			CancellationToken cancellationToken = default
	)
	{
		ApplyAuditTimestamps();
		var domainEvents = CollectAndClearDomainEvents();
		var result = await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
		await DispatchEventsAsync(domainEvents);
		return result;
	}

	private void ApplyAuditTimestamps()
	{
		var utcNow = DateTime.UtcNow;

		foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
			if (entry.State is EntityState.Added or EntityState.Modified)
				entry.Entity.UpdatedAt = utcNow;

		foreach (var entry in ChangeTracker.Entries<WishlistItem>())
			if (entry.State is EntityState.Added)
				entry.Entity.CreatedAt = utcNow;
	}



	private List<INotification> CollectAndClearDomainEvents()
	{
		var domainEntities = ChangeTracker
			.Entries<BaseEntity>()
			.Where(x => x.Entity.DomainEvents.Count > 0)
			.ToList();

		var domainEvents = domainEntities
			.SelectMany(x => x.Entity.DomainEvents)
			.ToList();

		domainEntities.ForEach(entity => entity.Entity.ClearDomainEvents());

		return domainEvents;
	}

	private async Task DispatchEventsAsync(List<INotification> domainEvents)
	{
		foreach (var domainEvent in domainEvents)
		{
			await publisher.Publish(domainEvent);
		}
	}
}