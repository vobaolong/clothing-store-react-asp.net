namespace ClothingStore.Domain.Enums;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Shipping,
    Delivered,
    Cancelled,
}

public enum PaymentMethod
{
    COD,
    BankTransfer,
    Momo,
    VNPAY,
    ZaloPay,
}

public enum PaymentStatus
{
    Unpaid,
    Paid,
    Refunded,
}

public enum NotificationType
{
    OrderCreated,
    OrderConfirmed,
    OrderShipping,
    OrderDelivered,
    OrderCancelled,
    PaymentReceived,
    System,
    Promotion,
}
