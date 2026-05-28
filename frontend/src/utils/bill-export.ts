import type { AdminOrderDetail } from '@/types/admin.type'
import { formatCurrency, formatDate } from '@/utils/format'
import { getVietnameseStatusLabel } from '@/utils/enum.utils'

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const formatStructuredAddress = (detail: {
  shippingStreet?: string
  shippingWard?: string
  shippingProvince?: string
  shippingAddress?: string
}) => {
  const structured = [
    detail.shippingStreet,
    detail.shippingWard,
    detail.shippingProvince
  ]
    .filter((x) => Boolean(x && x.trim()))
    .join(', ')
  return structured || detail.shippingAddress || '-'
}

export const generateBillHtml = (detail: AdminOrderDetail): string => {
  const subtotal = detail.items.reduce((sum, item) => sum + item.lineTotal, 0)
  const shippingFee = Math.max(
    detail.totalAmount - subtotal + detail.discountAmount,
    0
  )

  const rows = detail.items
    .map(
      (item, index) => `
				<tr>
					<td>${index + 1}</td>
					<td>
						<div class="product-name">${escapeHtml(item.productName)}</div>
						<div class="muted">${escapeHtml(item.variantColor)} / ${escapeHtml(item.variantSize)}</div>
					</td>
					<td class="right">${item.quantity}</td>
					<td class="right">${escapeHtml(formatCurrency(item.unitPrice))}</td>
					<td class="right">${escapeHtml(formatCurrency(item.lineTotal))}</td>
				</tr>`
    )
    .join('')

  return `
		<!doctype html>
		<html lang="vi">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Hóa đơn ${escapeHtml(detail.id.slice(0, 8).toUpperCase())}</title>
			<style>
				@page { size: A4; margin: 18mm; }
				* { box-sizing: border-box; }
				body {
					margin: 0;
					font-family: Arial, Helvetica, sans-serif;
					color: #111827;
					background: #ffffff;
				}
				.sheet { max-width: 820px; margin: 10 auto; padding: 20px; }
				.header {
					display: flex;
					justify-content: space-between;
					gap: 24px;
					align-items: flex-start;
					margin-bottom: 20px;
					padding-bottom: 14px;
					border-bottom: 2px solid #111827;
				}
				.brand { font-size: 20px; font-weight: 700; }
				.muted { color: #6b7280; font-size: 12px; }
				.section { margin-top: 18px; }
				.section-title {
					font-size: 14px;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: 0.04em;
					margin-bottom: 10px;
				}
				.info-grid {
					display: grid;
					grid-template-columns: repeat(2, minmax(0, 1fr));
					gap: 12px 20px;
				}
				.info-item { font-size: 13px; line-height: 1.45; }
				.info-label { color: #6b7280; display: block; font-size: 12px; }
				table {
					width: 100%;
					border-collapse: collapse;
					margin-top: 10px;
					font-size: 13px;
				}
				thead th {
					text-align: left;
					padding: 10px 8px;
					border-bottom: 1px solid #d1d5db;
					background: #f9fafb;
				}
				tbody td {
					padding: 10px 8px;
					border-bottom: 1px solid #e5e7eb;
					vertical-align: top;
				}
				.right { text-align: right; white-space: nowrap; }
				.product-name { font-weight: 600; }
				.totals {
					margin-top: 18px;
					display: flex;
					justify-content: flex-end;
				}
				.totals-box {
					min-width: 320px;
					border: 1px solid #d1d5db;
					border-radius: 12px;
					padding: 14px;
				}
				.totals-row {
					display: flex;
					justify-content: space-between;
					gap: 16px;
					margin: 8px 0;
					font-size: 13px;
				}
				.totals-row.total {
					margin-top: 10px;
					padding-top: 10px;
					border-top: 1px solid #d1d5db;
					font-weight: 700;
					font-size: 15px;
				}
				.footer-note {
					margin-top: 18px;
					font-size: 12px;
					color: #6b7280;
					text-align: center;
				}
				@media print {
					body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				}
			</style>
		</head>
		<body>
			<div class="sheet">
				<div class="header">
					<div>
						<div class="brand">Wearly</div>
						<div class="muted">Hóa đơn bán hàng</div>
					</div>
					<div style="text-align:right">
						<div><strong>Mã đơn:</strong> ${escapeHtml(detail.id.slice(0, 8).toUpperCase())}</div>
						<div class="muted">Ngày tạo: ${escapeHtml(formatDate(detail.createdAt))}</div>
					</div>
				</div>

				<div class="section">
					<div class="section-title">Thông tin khách hàng</div>
					<div class="info-grid">
						<div class="info-item"><span class="info-label">Tên khách hàng</span>${escapeHtml(detail.userName || '—')}</div>
						<div class="info-item"><span class="info-label">Email</span>${escapeHtml(detail.userEmail || '—')}</div>
						<div class="info-item"><span class="info-label">Điện thoại</span>${escapeHtml(detail.shippingPhone || '—')}</div>
						<div class="info-item"><span class="info-label">Địa chỉ</span>${escapeHtml(formatStructuredAddress(detail))}</div>
						<div class="info-item"><span class="info-label">Ghi chú</span>${escapeHtml(detail.note?.trim() || '—')}</div>
					</div>
				</div>

				<div class="section">
					<div class="section-title">Danh sách sản phẩm</div>
					<table>
						<thead>
							<tr>
								<th style="width: 48px">#</th>
								<th>Sản phẩm</th>
								<th class="right" style="width: 64px">SL</th>
								<th class="right" style="width: 130px">Đơn giá</th>
								<th class="right" style="width: 140px">Thành tiền</th>
							</tr>
						</thead>
						<tbody>
							${rows}
						</tbody>
					</table>
				</div>

				<div class="totals">
					<div class="totals-box">
						<div class="totals-row"><span>Thành tiền</span><span>${escapeHtml(formatCurrency(subtotal))}</span></div>
						<div class="totals-row"><span>Giảm giá${detail.couponCodeSnapshot ? ` (${escapeHtml(detail.couponCodeSnapshot)})` : ''}</span><span>- ${escapeHtml(formatCurrency(detail.discountAmount || 0))}</span></div>
						<div class="totals-row"><span>Phí vận chuyển</span><span>${escapeHtml(formatCurrency(shippingFee))}</span></div>
						<div class="totals-row total"><span>Tổng cộng</span><span>${escapeHtml(formatCurrency(detail.totalAmount))}</span></div>
						<div class="muted" style="margin-top:10px">Thanh toán: ${escapeHtml(getVietnameseStatusLabel(detail.paymentStatus))}${detail.paidAt ? ` lúc ${escapeHtml(formatDate(detail.paidAt))}` : ''}</div>
					</div>
				</div>

				<div class="footer-note">Cảm ơn bạn đã mua hàng tại Wearly!</div>
			</div>
			<script>
				window.addEventListener('load', () => {
					window.focus();
					window.print();
				});
				window.addEventListener('afterprint', () => window.close());
			</script>
		</body>
		</html>
	`
}

export const openBillPrintWindow = (
  detail: AdminOrderDetail,
  onError?: () => void
): void => {
  const billWindow = window.open('', '_blank', 'width=920,height=980')
  if (!billWindow) {
    onError?.()
    return
  }

  const html = generateBillHtml(detail)
  billWindow.document.write(html)
  billWindow.document.close()
  billWindow.focus()
}
