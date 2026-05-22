using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Entities;
namespace ClothingStore.Infrastructure.Security;

public class EmailTemplateBuilder : IEmailTemplateBuilder
{
	private readonly string _appName = "Wearly Store";
	private readonly string _clientBaseUrl = "http://localhost:5173";
	private readonly string _primaryColor = "#0f172a";
	private readonly string _buttonColor = "#0ea5e9";
	private string BuildBaseLayout(string title, string content)
	{
		return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            color: #334155;
            line-height: 1.6;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background-color: {_primaryColor};
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 32px 24px;
        }}
        .footer {{
            background-color: #f1f5f9;
            padding: 16px 24px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }}
        .btn {{
            display: inline-block;
            background-color: {_buttonColor};
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 16px;
        }}
        .details-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            margin-bottom: 24px;
        }}
        .details-table th, .details-table td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }}
        .details-table th {{
            color: #64748b;
            font-weight: 600;
        }}
        .greeting {{
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0f172a;
        }}
        .alert {{
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }}
        .success-alert {{
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{_appName}</h1>
        </div>
        <div class='content'>
            {content}
        </div>
        <div class='footer'>
            &copy; {DateTime.UtcNow.Year} {_appName}. Tất cả quyền được bảo lưu.<br/>
            Nếu bạn cần hỗ trợ, vui lòng phản hồi email này.
        </div>
    </div>
</body>
</html>";
	}
	public string BuildOrderPlacedEmail(Order order, User user)
	{
		var itemsHtml = string.Join("", order.Items.Select(item => $@"
            <tr>
                <td>{item.ProductName}<br/><small style='color: #64748b;'>{item.VariantName}</small></td>
                <td>{item.Quantity}</td>
                <td>{item.UnitPrice:N0}đ</td>
            </tr>
        "));
		var discountHtml = order.DiscountAmount > 0
				? $@"<tr><td colspan='2' style='text-align:right'><b>Giảm giá:</b></td><td>-{order.DiscountAmount:N0}đ</td></tr>"
				: "";
		var orderDate = order.CreatedAt.ToString("dd/MM/yyyy HH:mm");
		var content = $@"
            <div class='greeting'>Xin chào {user.FullName},</div>
            <p>Cảm ơn bạn đã đặt hàng! Chúng tôi đã nhận được đơn hàng và đang tiến hành xử lý.</p>
            <div style='background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 24px 0;'>
                <strong>Mã đơn hàng:</strong> {order.Id.ToString().ToUpper()[..8]}<br/>
                <strong>Ngày đặt:</strong> {orderDate} <br/>
                <strong>Phương thức thanh toán:</strong> {order.PaymentMethod}<br/>
                {(order.ShippingInfo != null
								? $@"<strong>Người nhận:</strong> {order.ShippingInfo.FullName}, {order.ShippingInfo.Phone}<br/>
                        {order.ShippingInfo.Street}, {order.ShippingInfo.Ward}, {order.ShippingInfo.District}"
								: "")}
            </div>
            <h3>Chi tiết đơn hàng</h3>
            <table class='details-table'>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Giá</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                    {discountHtml}
                    <tr>
                        <td colspan='2' style='text-align:right'><b>Tổng cộng:</b></td>
                        <td><b style='color: {_buttonColor}'>{order.TotalAmount:N0}đ</b></td>
                    </tr>
                </tbody>
            </table>
            <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao thành công.</p>
            <div style='text-align: center'>
                <a href='{_clientBaseUrl}/orders/{order.Id}' class='btn'>Xem đơn hàng</a>
            </div>
        ";
		return BuildBaseLayout("Xác nhận đặt hàng", content);
	}
	public string BuildOrderDeliveredEmail(Order order, User user)
	{
		var deliveredDate = DateTime.UtcNow.ToString("dd/MM/yyyy");
		var content = $@"
            <div class='greeting'>Xin chào {user.FullName},</div>
            <div class='alert success-alert'>
                <strong>Đơn hàng đã được giao thành công!</strong>
            </div>
            <p>Đơn hàng <strong>{order.Id.ToString().ToUpper()[..8]}</strong> đã được giao vào ngày {deliveredDate}.</p>
            <p>Tổng thanh toán: <strong>{order.TotalAmount:N0}đ</strong></p>
            <p>Cảm ơn bạn đã mua sắm tại {_appName}. Vui lòng kiểm tra sản phẩm sau khi nhận hàng. Nếu có bất kỳ vấn đề nào, hãy liên hệ với chúng tôi.</p>
            <div style='text-align: center'>
                <a href='{_clientBaseUrl}/orders/{order.Id}' class='btn'>Xem chi tiết đơn hàng</a>
            </div>
        ";
		return BuildBaseLayout("Đơn hàng đã được giao", content);
	}
	public string BuildUserLockedEmail(User user, string? reason)
	{
		var reasonHtml = !string.IsNullOrWhiteSpace(reason)
				? $@"<p><strong>Lý do:</strong> {reason}</p>"
				: $@"<p>Tài khoản của bạn đã bị khóa do vi phạm chính sách hoặc vì lý do bảo mật.</p>";
		var content = $@"
            <div class='greeting'>Xin chào {user.FullName},</div>
            <div class='alert'>
                <strong>Tài khoản của bạn đã bị khóa.</strong>
            </div>
            <p>Chúng tôi xin thông báo rằng tài khoản tại {_appName} của bạn hiện đã bị khóa bởi quản trị viên.</p>
            {reasonHtml}
            <p>Nếu bạn cho rằng đây là nhầm lẫn hoặc cần hỗ trợ thêm, vui lòng phản hồi email này để được hỗ trợ.</p>
        ";
		return BuildBaseLayout("Thông báo khóa tài khoản", content);
	}
	public string BuildUserUnlockedEmail(User user)
	{
		var content = $@"
            <div class='greeting'>Xin chào {user.FullName},</div>
            <div class='alert success-alert'>
                <strong>Tài khoản của bạn đã được mở khóa.</strong>
            </div>
            <p>Chúng tôi xin thông báo rằng tài khoản tại {_appName} của bạn đã được mở khóa và có thể sử dụng lại bình thường.</p>
            <div style='text-align: center'>
                <a href='{_clientBaseUrl}/login' class='btn'>Đăng nhập ngay</a>
            </div>
        ";
		return BuildBaseLayout("Thông báo mở khóa tài khoản", content);
	}
	public string BuildWelcomeEmail(User user)
	{
		var content = $@"
            <div class='greeting'>Chào mừng {user.FullName} đến với {_appName}!</div>
            <p>Tài khoản của bạn đã được tạo thành công.</p>
            <p>Khám phá ngay những sản phẩm mới nhất và tận hưởng trải nghiệm mua sắm tuyệt vời cùng chúng tôi.</p>
            <div style='text-align: center'>
                <a href='{_clientBaseUrl}' class='btn'>Mua sắm ngay</a>
            </div>
        ";
		return BuildBaseLayout("Chào mừng đến với " + _appName, content);
	}
	public string BuildResetPasswordEmail(User user, string resetLink)
	{
		var content = $@"
            <div class='greeting'>Xin chào {user.FullName},</div>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Nếu bạn thực hiện yêu cầu này, vui lòng nhấn nút bên dưới để đặt mật khẩu mới. Liên kết sẽ hết hạn sau 24 giờ.</p>
            <div style='text-align: center'>
                <a href='{resetLink}' class='btn'>Đặt lại mật khẩu</a>
            </div>
            <p style='margin-top: 24px; font-size: 14px; color: #64748b;'>
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </p>
        ";
		return BuildBaseLayout("Yêu cầu đặt lại mật khẩu", content);
	}
	public string BuildRegisterOtpEmail(User user, string otpCode)
	{
		var content = $@"
            <div class='greeting'>Xin chào {user.FullName},</div>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại {_appName}.</p>
            <p>Để hoàn tất đăng ký và xác thực email, vui lòng sử dụng mã OTP bên dưới:</p>
            <div style='text-align: center; margin: 32px 0;'>
                <div style='display: inline-block; padding: 16px 32px; background-color: #f1f5f9; border: 2px dashed {_primaryColor}; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: {_primaryColor};'>
                    {otpCode}
                </div>
            </div>
            <p>Mã OTP sẽ hết hạn sau <strong>5 phút</strong>.</p>
            <p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            <p>Nếu bạn không thực hiện đăng ký tài khoản, vui lòng bỏ qua email này.</p>
        ";
		return BuildBaseLayout("Xác thực email đăng ký", content);
	}
}