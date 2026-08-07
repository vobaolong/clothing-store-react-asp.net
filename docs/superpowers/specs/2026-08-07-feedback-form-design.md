# Design: Tính năng "Đóng góp ý kiến" (Feedback)

Ngày: 2026-08-07

## Mục tiêu

Khách bấm nút "ĐÓNG GÓP Ý KIẾN" trong footer → mở modal góp ý (tên, email, nội dung) → gửi email về shop. Không lưu DB, không admin.

## Phạm vi

- Backend: endpoint public `POST /api/feedback`, gửi email về shop qua email service có sẵn.
- Frontend: modal form góp ý mở từ nút footer, có validation + i18n vi/en.
- **Ngoài phạm vi:** lưu DB, entity/table mới, admin UI, ảnh đính kèm, chọn chủ đề.

## Backend

Theo pattern MediatR có sẵn trong project (controller → command → handler).

1. **Request DTO** — `FeedbackRequest`: `Name` (required), `Email` (required, hợp lệ), `Message` (required, tối đa 2000 ký tự).
2. **Command** — `SubmitFeedbackCommand(Name, Email, Message)` + handler inject `IEmailNotificationService` (đã đăng ký DI ở `DependencyInjection.cs`):
   - To: `support@wearly.com` (đọc từ config `Email` → nếu không có dùng hardcode như fallback)
   - Subject: `[Góp ý] {Name} - {Email}`
   - Body: nội dung góp ý.
   - `SendSafeAsync` nuốt lỗi email — API vẫn trả thành công, không chặn người dùng.
3. **Controller** — `FeedbackController`, `[Route("api")]`, `[AllowAnonymous]`, `POST api/feedback`.

## Frontend

4. **API** — `frontend/src/api/feedback-api.ts`: `submitFeedback({ name, email, message })` → POST `/feedback` qua `api-client` có sẵn.
5. **Modal** — sửa [AppFooter.tsx](frontend/src/components/AppFooter.tsx#L135-L140): bấm nút "ĐÓNG GÓP Ý KIẾN" mở `Modal` antd:
   - Form: Họ tên, Email, Nội dung (textarea).
   - Validate: bắt buộc + định dạng email.
   - Submit → loading → thành công: đóng modal + `message.success`.
   - Lỗi network/API → `message.error`, giữ modal mở.
6. **i18n** — thêm keys `footer.feedback*` vào `public/locales/vi/translation.json` và `en/translation.json`.

## Lỗi & biên tập

- Email fail → `SendSafeAsync` tự xử lý, API vẫn 200.
- Validation fail → 400 với message lỗi.
- Test: validator command + happy path handler (mock email service).

## Kiến trúc mở rộng

Sau này nếu cần lưu DB → thêm entity + table + persist trong handler; không thay đổi controller/API shape.
