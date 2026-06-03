using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
using ClothingStore.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Application.Orders.Commands;

public class UpdateOrderStatusCommandHandler(
    IApplicationDbContext context,
    IEmailTemplateBuilder emailTemplateBuilder,
    IEmailNotificationService emailNotificationService
) : IRequestHandler<UpdateOrderStatusCommand>
{
    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order =
            await context
                .Orders.Include(o => o.Items)
                .Include(o => o.User)
                .FirstOrDefaultAsync(x => x.Id == request.OrderId, cancellationToken)
            ?? throw new InvalidOperationException("Order not found.");

        bool justDelivered =
            request.Status == OrderStatus.Delivered && order.Status != OrderStatus.Delivered;

        if (request.Status == OrderStatus.Delivered && order.Status != OrderStatus.Delivered)
        {
            foreach (var item in order.Items)
            {
                var product = await context.Products.FirstOrDefaultAsync(
                    p => p.Id == item.ProductId,
                    cancellationToken
                );
                if (product != null)
                    product.SoldCount += item.Quantity;
            }

            order.PaymentStatus = PaymentStatus.Paid;
            order.PaidAt ??= DateTime.UtcNow;
        }
        else if (order.Status == OrderStatus.Delivered && request.Status != OrderStatus.Delivered)
        {
            foreach (var item in order.Items)
            {
                var product = await context.Products.FirstOrDefaultAsync(
                    p => p.Id == item.ProductId,
                    cancellationToken
                );
                if (product != null)
                    product.SoldCount -= item.Quantity;
            }

            if (order.PaymentMethod == PaymentMethod.COD)
            {
                order.PaymentStatus = PaymentStatus.Unpaid;
                order.PaidAt = null;
            }
        }

        if (
            request.Status == OrderStatus.Cancelled
            && order.Status != OrderStatus.Cancelled
            && order.Status != OrderStatus.Delivered
        )
        {
            foreach (var item in order.Items)
            {
                var variant = await context.ProductVariants.FirstOrDefaultAsync(
                    v => v.Id == item.ProductVariantId,
                    cancellationToken
                );
                if (variant is not null)
                    variant.Quantity += item.Quantity;
            }
        }

        order.ChangeStatus(request.Status);

        await context.OrderStatusHistories.AddAsync(
            new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = request.Status,
                ChangedAt = DateTime.UtcNow,
            },
            cancellationToken
        );

        await context.SaveChangesAsync(cancellationToken);

        if (justDelivered && order.User != null)
        {
            var emailBody = emailTemplateBuilder.BuildOrderDeliveredEmail(order, order.User);
            await emailNotificationService.SendSafeAsync(
                order.User.Email,
                $"Order Delivered - {order.Id.ToString().ToUpper()[..8]}",
                emailBody
            );
        }
    }
}
