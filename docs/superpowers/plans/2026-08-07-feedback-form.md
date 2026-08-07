# Feedback Form (Đóng góp ý kiến) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép khách gửi góp ý từ nút footer "ĐÓNG GÓP Ý KIẾN" → email về shop `vobaolong317@gmail.com`. Không lưu DB, không admin.

**Architecture:** Backend theo pattern MediatR sẵn có (controller → command → handler), handler gửi email qua `IEmailNotificationService` (MailKit queue, đã DI). Frontend: modal antd + form trong `AppFooter.tsx`, gọi API qua `api-client` có sẵn.

**Tech Stack:** .NET (MediatR, FluentValidation), React + antd + react-i18next, axios.

**Spec:** `docs/superpowers/specs/2026-08-07-feedback-form-design.md`

## Global Constraints

- Follow pattern MediatR + FluentValidation như `Auth/Commands/*` và `Reviews/*`.
- Controller: `[Route("api")]`, kế thừa `BaseApiController`, `[AllowAnonymous]` (không yêu cầu đăng nhập).
- Email nhận: `EmailSettings.FromEmail` từ config (hiện là `vobaolong317@gmail.com`) — **không hardcode địa chỉ**.
- Gửi email qua `IEmailNotificationService.SendSafeAsync` — nuốt lỗi, không throw.
- Message body email thuần text (không dùng HTML template builder).
- API response qua `BaseApiController.Ok(...)`.
- Frontend gọi API qua `apiVoid`/`apiData` từ `api-client.ts`; endpoint thêm vào `API_ENDPOINTS`.
- i18n: thêm key cả vi lẫn en (`public/locales/{vi,en}/translation.json`).
- Frontend dùng `Form.useForm` + antd `Modal`/`Input`/`Button`, pattern như `components/reviews/ReviewForm.tsx`.
- Không có test project riêng trong solution (`ClothingStore.slnx` chỉ có 4 project: API, Application, Domain, Infrastructure) → verification bằng build + smoke test curl. **Không tạo test project mới.**
- Commit tin nhắn theo convention: `feat(feedback): ...`.

---

### Task 1: Command + Validator + Handler (Backend Application layer)

**Files:**
- Create: `backend/src/ClothingStore.Application/Feedback/Commands/SubmitFeedbackCommand.cs`
- Create: `backend/src/ClothingStore.Application/Feedback/Commands/SubmitFeedbackCommandHandler.cs`
- Create: `backend/src/ClothingStore.Application/Feedback/Validators/SubmitFeedbackCommandValidator.cs`

**Interfaces:**
- Consumes: `IEmailNotificationService` (`ClothingStore.Application/Common/Interfaces/IEmailNotificationService.cs`): `Task SendSafeAsync(string? email, string subject, string body, CancellationToken ct = default)`; `IOptions<EmailSettings>` (`ClothingStore.Application/Common/Models/EmailSettings.cs`: `FromEmail`).
- Produces: `SubmitFeedbackCommand(string Name, string Email, string Message) : IRequest` — dùng bởi Task 2 controller.

- [ ] **Step 1: Tạo `SubmitFeedbackCommand.cs`**

```csharp
using MediatR;

namespace ClothingStore.Application.Feedback.Commands;

public record SubmitFeedbackCommand(string Name, string Email, string Message) : IRequest;
```

- [ ] **Step 2: Tạo `SubmitFeedbackCommandHandler.cs`**

Pattern: primary constructor + inject như `ForgotPasswordCommandHandler`.

```csharp
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Application.Common.Models;
using MediatR;
using Microsoft.Extensions.Options;

namespace ClothingStore.Application.Feedback.Commands;

public class SubmitFeedbackCommandHandler(
    IEmailNotificationService emailNotificationService,
    IOptions<EmailSettings> emailSettings
) : IRequestHandler<SubmitFeedbackCommand>
{
    public Task Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var recipient = emailSettings.Value.FromEmail;
        var subject = $"[Góp ý] {request.Name} - {request.Email}";
        var body =
            $"Họ tên: {request.Name}\nEmail: {request.Email}\n\nNội dung:\n{request.Message}";

        return emailNotificationService.SendSafeAsync(
            recipient,
            subject,
            body,
            cancellationToken
        );
    }
}
```

- [ ] **Step 3: Tạo `SubmitFeedbackCommandValidator.cs`**

Pattern: `AbstractValidator<T>` như `ForgotPasswordCommandValidator`.

```csharp
using ClothingStore.Application.Feedback.Commands;
using FluentValidation;

namespace ClothingStore.Application.Feedback.Validators;

public class SubmitFeedbackCommandValidator : AbstractValidator<SubmitFeedbackCommand>
{
    public SubmitFeedbackCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(2000);
    }
}
```

- [ ] **Step 4: Build verify**

Run (từ `backend/`):
```bash
dotnet build src/ClothingStore.Application/ClothingStore.Application.csproj
```
Expected: build success, không warning/error mới. (MediatR + validators auto-register qua assembly scan trong `Application/DependencyInjection.cs` — không cần sửa DI.)

- [ ] **Step 5: Commit**

```bash
git add backend/src/ClothingStore.Application/Feedback
git commit -m "feat(feedback): add submit feedback command handler and validator"
```

---

### Task 2: Controller + Endpoint (Backend API layer)

**Files:**
- Create: `backend/src/ClothingStore.API/Controllers/FeedbackController.cs`

**Interfaces:**
- Consumes: `SubmitFeedbackCommand` (Task 1), `BaseApiController` (`ClothingStore.API/Controllers/BaseApiController.cs`: `protected IActionResult Ok(string? message = null)`), `ISender` (MediatR).
- Produces: endpoint `POST /api/feedback` nhận `SubmitFeedbackCommand` JSON `{ name, email, message }` → 200 `ApiResponse` `{ success: true, message: "Feedback submitted." }`.

- [ ] **Step 1: Tạo `FeedbackController.cs`**

Pattern controller như `AuthController` (public endpoints không `[Authorize]`; thêm `[AllowAnonymous]` cho rõ — route hiện không có global fallback policy, endpoint public mặc định).

```csharp
using ClothingStore.Application.Feedback.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClothingStore.API.Controllers;

[Route("api")]
[AllowAnonymous]
public class FeedbackController(ISender sender) : BaseApiController
{
    [HttpPost("feedback")]
    public async Task<IActionResult> SubmitFeedback(
        SubmitFeedbackCommand command,
        CancellationToken ct
    )
    {
        await sender.Send(command, ct);
        return Ok("Feedback submitted.");
    }
}
```

- [ ] **Step 2: Build verify**

```bash
dotnet build src/ClothingStore.API/ClothingStore.API.csproj
```
Expected: success.

- [ ] **Step 3: Smoke test (nếu backend đang chạy — hoặc note lại để test cùng Task 3)**

Chạy backend `dotnet run --project src/ClothingStore.API` (nếu chưa chạy), rồi:
```bash
curl -s -X POST http://localhost:5230/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Khach","email":"test@example.com","message":"Thu nghiem feedback"}'
```
Expected: `{"success":true,"message":"Feedback submitted."}`. Kiểm tra hộp thư `vobaolong317@gmail.com` nhận email. (Nếu backend chưa chạy, bỏ qua bước này — smoke test đầy đủ ở cuối plan.)

- [ ] **Step 4: Commit**

```bash
git add backend/src/ClothingStore.API/Controllers/FeedbackController.cs
git commit -m "feat(feedback): add POST /api/feedback endpoint"
```

---

### Task 3: API client + endpoint constant (Frontend)

**Files:**
- Modify: `frontend/src/constants/api-endpoints.constant.ts` (thêm block `feedback`)
- Create: `frontend/src/api/feedback-api.ts`

**Interfaces:**
- Consumes: `apiClient`/`apiVoid` từ `@/api/api-client`, `API_ENDPOINTS` từ `@/constants/api-endpoints.constant`.
- Produces: `submitFeedback(payload: { name: string; email: string; message: string }): Promise<void>` — dùng bởi Task 4 modal.

- [ ] **Step 1: Thêm endpoint vào `api-endpoints.constant.ts`**

Tìm block `reviews` (~dòng 24-27) và thêm block `feedback` cạnh nó:

```ts
  feedback: {
    root: '/feedback'
  },
```

- [ ] **Step 2: Tạo `frontend/src/api/feedback-api.ts`**

Pattern như `reviews-api.ts`:

```ts
import { apiClient, apiVoid } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'

export const submitFeedback = async (payload: {
  name: string
  email: string
  message: string
}): Promise<void> => {
  await apiVoid(apiClient.post(API_ENDPOINTS.feedback.root, payload))
}
```

- [ ] **Step 3: Verify typecheck**

Từ `frontend/`:
```bash
npx tsc --noEmit
```
Expected: không lỗi mới.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/constants/api-endpoints.constant.ts frontend/src/api/feedback-api.ts
git commit -m "feat(feedback): add feedback api client"
```

---

### Task 4: Feedback modal component (Frontend)

**Files:**
- Create: `frontend/src/components/feedback/FeedbackModal.tsx`

**Interfaces:**
- Consumes: `submitFeedback` (Task 3), antd `Modal`/`Form`/`Input`/`Button`/`message`, `useTranslation`.
- Produces: `FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void })` — dùng bởi Task 5 footer.

- [ ] **Step 1: Tạo `FeedbackModal.tsx`**

Pattern modal + form như `OrderDetailReviewModal` + `ReviewForm`. Dùng `react-hot-toast` cho toast (pattern chuẩn của project — admin sections dùng `toast` từ `react-hot-toast`). Keys i18n (viết cả tiếng Việt tạm — Task 5 sẽ thêm vào locale file; nếu thiếu key, `t()` trả về key string, chỉ để chuẩn bị):

```tsx
import { Button, Form, Input, Modal } from 'antd'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { submitFeedback } from '@/api/feedback-api'

type FeedbackFormValues = {
  name: string
  email: string
  message: string
}

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<FeedbackFormValues>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: FeedbackFormValues) => {
    setLoading(true)
    try {
      await submitFeedback(values)
      toast.success(t('footer.feedbackSuccess'))
      form.resetFields()
      onClose()
    } catch {
      toast.error(t('footer.feedbackError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={t('footer.feedbackTitle')}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t('footer.feedbackName')}
          rules={[{ required: true, message: t('footer.feedbackNameRequired') }]}
        >
          <Input placeholder={t('footer.feedbackNamePlaceholder')} maxLength={100} />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('footer.feedbackEmail')}
          rules={[
            { required: true, message: t('footer.feedbackEmailRequired') },
            { type: 'email', message: t('footer.feedbackEmailInvalid') }
          ]}
        >
          <Input placeholder={t('footer.feedbackEmailPlaceholder')} maxLength={200} />
        </Form.Item>
        <Form.Item
          name="message"
          label={t('footer.feedbackMessage')}
          rules={[
            { required: true, message: t('footer.feedbackMessageRequired') },
            { max: 2000, message: t('footer.feedbackMessageMaxLength') }
          ]}
        >
          <Input.TextArea rows={4} placeholder={t('footer.feedbackMessagePlaceholder')} />
        </Form.Item>
        <div className="flex items-center justify-end gap-2">
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="h-10 px-6 rounded-xl">
            {t('footer.feedbackSubmit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
npx tsc --noEmit
```
Expected: không lỗi.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/feedback/FeedbackModal.tsx
git commit -m "feat(feedback): add feedback modal component"
```

---

### Task 5: Wire modal vào footer + i18n keys

**Files:**
- Modify: `frontend/src/components/AppFooter.tsx:135-140` (nút feedbackCta)
- Modify: `frontend/public/locales/vi/translation.json` (block `footer`)
- Modify: `frontend/public/locales/en/translation.json` (block `footer`)

**Interfaces:**
- Consumes: `FeedbackModal` (Task 4).
- Produces: nút "ĐÓNG GÓP Ý KIẾN →" mở modal; keys i18n `footer.feedback*`.

- [ ] **Step 1: Sửa `AppFooter.tsx`**

Thêm import + state + render modal. Sửa component:

```tsx
import { useState } from 'react'
import FeedbackModal from '@/components/feedback/FeedbackModal'
```

(Thêm `useState` vào import React hiện có nếu chưa có — file hiện không import hooks. Bên trong component `AppFooter()`:

```tsx
const [feedbackOpen, setFeedbackOpen] = useState(false)
```

Sửa Button (dòng 135-140):

```tsx
<Button
  type="primary"
  className="font-semibold text-black bg-white border-none rounded-full"
  onClick={() => setFeedbackOpen(true)}
>
  {t('footer.feedbackCta')}
</Button>
```

Và trước thẻ đóng `</footer>` thêm:

```tsx
<FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
```

- [ ] **Step 2: Thêm i18n keys — `vi/translation.json`**

Trong block `footer` (cạnh `feedbackCta` ~dòng 924), thêm:

```json
    "feedbackTitle": "Đóng góp ý kiến",
    "feedbackName": "Họ tên",
    "feedbackNamePlaceholder": "Nhập họ tên của bạn",
    "feedbackNameRequired": "Vui lòng nhập họ tên",
    "feedbackEmail": "Email",
    "feedbackEmailPlaceholder": "Nhập email của bạn",
    "feedbackEmailRequired": "Vui lòng nhập email",
    "feedbackEmailInvalid": "Email không hợp lệ",
    "feedbackMessage": "Nội dung góp ý",
    "feedbackMessagePlaceholder": "Chia sẻ ý kiến của bạn...",
    "feedbackMessageRequired": "Vui lòng nhập nội dung",
    "feedbackMessageMaxLength": "Nội dung tối đa 2000 ký tự",
    "feedbackSubmit": "Gửi góp ý",
    "feedbackSuccess": "Cảm ơn bạn đã đóng góp ý kiến!",
    "feedbackError": "Gửi góp ý thất bại, vui lòng thử lại"
```

- [ ] **Step 3: Thêm i18n keys — `en/translation.json`**

Cùng vị trí, bản tiếng Anh:

```json
    "feedbackTitle": "Give Feedback",
    "feedbackName": "Full name",
    "feedbackNamePlaceholder": "Enter your full name",
    "feedbackNameRequired": "Please enter your name",
    "feedbackEmail": "Email",
    "feedbackEmailPlaceholder": "Enter your email",
    "feedbackEmailRequired": "Please enter your email",
    "feedbackEmailInvalid": "Invalid email address",
    "feedbackMessage": "Feedback",
    "feedbackMessagePlaceholder": "Share your thoughts...",
    "feedbackMessageRequired": "Please enter your feedback",
    "feedbackMessageMaxLength": "Feedback must be under 2000 characters",
    "feedbackSubmit": "Submit feedback",
    "feedbackSuccess": "Thank you for your feedback!",
    "feedbackError": "Failed to submit feedback, please try again"
```

- [ ] **Step 4: Verify typecheck + build**

```bash
npx tsc --noEmit
```
Expected: không lỗi.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/AppFooter.tsx frontend/src/components/feedback frontend/public/locales/vi/translation.json frontend/public/locales/en/translation.json
git commit -m "feat(feedback): wire feedback modal into footer with i18n"
```

---

### Task 6: End-to-end smoke test

**Files:** không sửa code — chỉ verify.

- [ ] **Step 1: Chạy backend + frontend**

Từ `backend/`:
```bash
dotnet run --project src/ClothingStore.API
```
Từ `frontend/` (terminal riêng):
```bash
npm run dev
```

- [ ] **Step 2: Test API trực tiếp**

```bash
curl -s -X POST http://localhost:5230/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Khach Test","email":"khach@example.com","message":"San pham rat tot, mong cai thien them"}'
```
Expected: `{"success":true,"message":"Feedback submitted."}`.

- [ ] **Step 3: Test validation**

```bash
curl -s -X POST http://localhost:5230/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bad","message":""}'
```
Expected: HTTP 400, body chứa `"success":false` + `errors` (từ `ApiExceptionMiddleware`).

- [ ] **Step 4: Test UI end-to-end**

Mở `http://localhost:5173`, cuộn xuống footer, bấm "ĐÓNG GÓP Ý KIẾN →":
- Modal mở, form hiện 3 trường.
- Bấm submit khi trống → hiện message lỗi required.
- Nhập email sai format → hiện message email invalid.
- Nhập hợp lệ → bấm "Gửi góp ý" → modal đóng + toast "Cảm ơn bạn đã đóng góp ý kiến!".
- Kiểm tra email `vobaolong317@gmail.com` nhận email với subject `[Góp ý] <Tên> - <Email>`.

- [ ] **Step 5: Verify build backend full solution**

```bash
cd backend && dotnet build ClothingStore.slnx
```
Expected: success (cả 4 project).

- [ ] **Step 6: Commit (nếu có sửa gì phát sinh từ test)**

```bash
git add -A
git commit -m "fix(feedback): minor fixes from e2e smoke test"
```
Nếu không có sửa gì → bỏ qua, plan hoàn tất.
