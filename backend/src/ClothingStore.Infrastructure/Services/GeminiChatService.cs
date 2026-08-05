using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using ClothingStore.Application.AI;
using ClothingStore.Application.AI.Dtos;
using ClothingStore.Application.Common.Interfaces;
using ClothingStore.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ClothingStore.Infrastructure.Services;

public sealed class GeminiChatService(
    IApplicationDbContext context,
    IOptions<GeminiOptions> options,
    HttpClient httpClient
) : IAiService
{
    private readonly GeminiOptions _opts = options.Value;
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    private const string SystemPrompt = """
        Bạn là AI Fashion Assistant của Wearly Fashion Store.

        QUY TẮC:

        - Luôn trả lời bằng tiếng Việt.
        - Không tự tạo giá, tồn kho hoặc thông tin sản phẩm.
        - Chỉ sử dụng dữ liệu từ tool.
        - Nếu chỉ là lời chào, cảm ơn hoặc tạm biệt thì KHÔNG gọi tool.
        - Chỉ gọi tool khi cần lấy dữ liệu.

        KHI NÀO GỌI TOOL

        search_products
        - tìm áo
        - tìm quần
        - tìm váy
        - tìm hoodie
        - tìm sản phẩm
        - tìm đồ màu ...
        - giá ...
        - size ...

        get_product_detail
        - chi tiết sản phẩm

        recommend_size
        - tư vấn size

        get_order_status
        - kiểm tra đơn hàng

        get_promotions
        - khuyến mãi

        get_shipping_policy
        - vận chuyển

        get_return_policy
        - đổi trả

        get_faqs
        - câu hỏi thường gặp

        get_recommendations
        - gợi ý sản phẩm tương tự

        QUY TẮC SEARCH

        - Chỉ truyền field có dữ liệu.
        - Không truyền null.
        - Không truyền {}.
        - Không truyền chuỗi rỗng.
        - Nếu người dùng nói "áo polo trắng"
        => category="áo"
        => keyword="polo"
        => color="trắng"

        Nếu không có sản phẩm thì đề xuất sản phẩm gần nhất.

        Trả lời ngắn gọn.
        """;

    private static readonly object[] Tools =
    [
        new
        {
            type = "function",
            function = new
            {
                name = "search_products",
                description = "Tìm kiếm sản phẩm theo nhiều tiêu chí",
                parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        keyword = new { type = "string", description = "Từ khóa tên sản phẩm" },

                        category = new { type = "string", description = "Danh mục" },

                        gender = new { type = "string" },

                        color = new { type = "string" },

                        size = new { type = "string" },

                        material = new { type = "string" },

                        style = new { type = "string" },

                        price_min = new { type = "number" },

                        price_max = new { type = "number" },
                    },
                },
            },
        },
        new
        {
            type = "function",
            function = new
            {
                name = "get_product_detail",
                description = "Lấy chi tiết sản phẩm theo ID",
                parameters = new
                {
                    type = "object",
                    properties = new { product_id = new { type = "string" } },
                    required = new[] { "product_id" },
                },
            },
        },
        new
        {
            type = "function",
            function = new
            {
                name = "recommend_size",
                description = "Tư vấn size dựa trên chiều cao và cân nặng",
                parameters = new
                {
                    type = "object",
                    properties = new
                    {
                        height_cm = new { type = "number" },
                        weight_kg = new { type = "number" },
                    },
                    required = new[] { "height_cm", "weight_kg" },
                },
            },
        },
        new
        {
            type = "function",
            function = new
            {
                name = "get_order_status",
                description = "Kiểm tra trạng thái đơn hàng",
                parameters = new
                {
                    type = "object",
                    properties = new { order_id = new { type = "string" } },
                    required = new[] { "order_id" },
                },
            },
        },
        new
        {
            type = "function",
            function = new
            {
                name = "get_promotions",
                description = "Lấy danh sách khuyến mãi đang hoạt động",
            },
        },
        new
        {
            type = "function",
            function = new { name = "get_faqs", description = "Lấy danh sách câu hỏi thường gặp" },
        },
        new
        {
            type = "function",
            function = new
            {
                name = "get_shipping_policy",
                description = "Lấy chính sách vận chuyển",
            },
        },
        new
        {
            type = "function",
            function = new { name = "get_return_policy", description = "Lấy chính sách đổi trả" },
        },
        new
        {
            type = "function",
            function = new
            {
                name = "get_recommendations",
                description = "Gợi ý sản phẩm tương tự hoặc phối hợp",
                parameters = new
                {
                    type = "object",
                    properties = new { product_id = new { type = "string" } },
                    required = new[] { "product_id" },
                },
            },
        },
    ];

    public async Task<ChatResponseDto> ChatAsync(
        ChatRequestDto request,
        CancellationToken ct = default
    )
    {
        var apiKey = _opts.ApiKey;
        if (string.IsNullOrWhiteSpace(apiKey))
            return new ChatResponseDto(
                "Xin lỗi, AI chưa được cấu hình API key. Vui lòng liên hệ quản trị viên."
            );

        if (IsGreetingMessage(request.Message))
        {
            return new ChatResponseDto(
                "Xin chào! Tôi có thể giúp bạn tìm sản phẩm, tư vấn size, phối đồ, hoặc trả lời các câu hỏi về chính sách. Bạn cần tôi hỗ trợ gì hôm nay?"
            );
        }

        var messages = BuildMessages(request);
        var firstRes = await CallGemini(messages, apiKey, ct);
        var choice = firstRes?.Choices?.FirstOrDefault();
        if (choice?.Message == null)
            return new ChatResponseDto("Xin lỗi, không thể kết nối đến AI. Vui lòng thử lại sau.");

        if (choice.Message.ToolCalls is { Count: > 0 })
            return await HandleToolCall(choice.Message, messages, apiKey, request.Message, ct);

        return new ChatResponseDto(choice.Message.Content ?? "");
    }

    private List<object> BuildMessages(ChatRequestDto request)
    {
        var messages = new List<object> { new { role = "system", content = SystemPrompt } };
        if (request.History != null)
        {
            foreach (var h in request.History)
                messages.Add(
                    new { role = h.Role == "user" ? "user" : "assistant", content = h.Text }
                );
        }
        messages.Add(new { role = "user", content = request.Message });
        return messages;
    }

    private async Task<GeminiResponse?> CallGemini(
        List<object> messages,
        string apiKey,
        CancellationToken ct
    )
    {
        var body = new
        {
            model = _opts.Model,
            messages,
            tools = Tools,
            tool_choice = "auto",
            temperature = 0.7,
        };

        using var httpReq = new HttpRequestMessage(HttpMethod.Post, _opts.Endpoint)
        {
            Headers = { { "Authorization", $"Bearer {apiKey}" } },
            Content = new StringContent(
                JsonSerializer.Serialize(body, JsonOpts),
                Encoding.UTF8,
                "application/json"
            ),
        };

        using var httpRes = await httpClient.SendAsync(httpReq, ct);
        if (!httpRes.IsSuccessStatusCode)
        {
            var err = await httpRes.Content.ReadAsStringAsync(ct);
            Console.Error.WriteLine($"Gemini API {(int)httpRes.StatusCode}: {err}");
            return null;
        }

        var responseBody = await httpRes.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<GeminiResponse>(responseBody, JsonOpts);
    }

    private async Task<ChatResponseDto> HandleToolCall(
        MessageData msg,
        List<object> messages,
        string apiKey,
        string userMessage,
        CancellationToken ct
    )
    {
        var call = msg.ToolCalls![0];
        var fnName = call.Function!.Name;
        var fnArgs = JsonSerializer.Deserialize<Dictionary<string, object>>(
            call.Function.Arguments ?? "{}",
            JsonOpts
        );
        if (fnName == "search_products" && IsGreetingMessage(userMessage))
        {
            return new ChatResponseDto(
                "Xin chào! Tôi ở đây để giúp bạn tìm sản phẩm phù hợp. Bạn muốn tìm gì hôm nay?"
            );
        }
        var result = await ExecuteFunction(fnName, fnArgs, ct);
        if (result == null)
            return new ChatResponseDto("Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.");

        messages.Add(
            new
            {
                role = "assistant",
                content = (string?)null,
                tool_calls = new[]
                {
                    new
                    {
                        id = call.Id,
                        type = "function",
                        function = new
                        {
                            name = fnName,
                            arguments = call.Function.Arguments ?? "{}",
                        },
                    },
                },
            }
        );
        messages.Add(
            new
            {
                role = "tool",
                tool_call_id = call.Id,
                content = result.JsonData,
            }
        );

        var finalRes = await CallGemini(messages, apiKey, ct);
        var finalText = finalRes?.Choices?.FirstOrDefault()?.Message?.Content ?? "";

        return new ChatResponseDto(
            finalText,
            result.Products,
            result.Recommendations,
            result.OrderStatus,
            result.Promotions,
            result.Faqs,
            result.Policies,
            result.SizeGuide
        );
    }

    private async Task<FunctionExecResult?> ExecuteFunction(
        string name,
        Dictionary<string, object>? args,
        CancellationToken ct
    ) =>
        name switch
        {
            "search_products" => await SearchProducts(args, ct),
            "get_product_detail" => await GetProductDetail(args, ct),
            "recommend_size" => RecommendSize(args),
            "get_order_status" => await GetOrderStatus(args, ct),
            "get_promotions" => await GetPromotions(ct),
            "get_faqs" => GetFaqs(),
            "get_shipping_policy" => GetShippingPolicy(),
            "get_return_policy" => GetReturnPolicy(),
            "get_recommendations" => await GetRecommendations(args, ct),
            _ => null,
        };

    // ── Function implementations ──────────────────────────────

    private async Task<FunctionExecResult> SearchProducts(
        Dictionary<string, object>? args,
        CancellationToken ct
    )
    {
        var query = context
            .Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .Where(p => p.IsActive);
        if (args != null)
        {
            if (TryGetString(args, "keyword", out var kw))
                query = query.Where(p => p.Name.ToLowerInvariant().Contains(kw.ToLowerInvariant()));

            if (TryGetString(args, "category", out var cat))
                query = query.Where(p =>
                    p.Category != null
                    && (
                        p.Category.Name.ToLowerInvariant() == cat.ToLowerInvariant()
                        || p.Category.Slug.ToLowerInvariant() == cat.ToLowerInvariant()
                    )
                );
            if (TryGetString(args, "gender", out var gen))
            {
                var g = gen.ToLowerInvariant();
                if (g == "male")
                    query = query.Where(p =>
                        p.Category != null && p.Category.Gender == Gender.Male
                    );
                else if (g == "female")
                    query = query.Where(p =>
                        p.Category != null && p.Category.Gender == Gender.Female
                    );
            }
            if (TryGetDecimal(args, "price_min", out var pmin))
                query = query.Where(p => p.Price >= pmin);
            if (TryGetDecimal(args, "price_max", out var pmax))
                query = query.Where(p => p.Price <= pmax);
            if (TryGetString(args, "size", out var sz))
                query = query.Where(p =>
                    p.Variants.Any(v =>
                        v.Size.ToUpperInvariant() == sz.ToUpperInvariant() && v.Quantity > 0
                    )
                );
            if (TryGetString(args, "color", out var col))
                query = query.Where(p =>
                    p.Variants.Any(v =>
                        v.Color.ToLowerInvariant().Contains(col.ToLowerInvariant())
                        && v.Quantity > 0
                    )
                );
            if (TryGetString(args, "material", out var mat))
                query = query.Where(p =>
                    p.Description != null
                    && p.Description.ToLowerInvariant().Contains(mat.ToLowerInvariant())
                );
            if (TryGetString(args, "style", out var sty))
                query = query.Where(p =>
                    p.Description != null
                    && p.Description.ToLowerInvariant().Contains(sty.ToLowerInvariant())
                );
        }
        var products = await query.OrderByDescending(p => p.CreatedAt).Take(10).ToListAsync(ct);
        var result = products
            .Select(p =>
            {
                var fv = p.Variants.FirstOrDefault();
                return new ChatProductDto(
                    p.Id.ToString(),
                    p.Name,
                    p.Slug,
                    p.Price,
                    p.SalePrice,
                    fv?.ImageUrl,
                    p.Variants.Select(v => v.Color).Distinct().ToList(),
                    p.Variants.Select(v => v.Size).Distinct().ToList(),
                    p.AverageRating,
                    p.ReviewCount,
                    p.Variants.Sum(v => v.Quantity)
                );
            })
            .ToList();
        return new FunctionExecResult(
            JsonSerializer.Serialize(new { products = result }, JsonOpts),
            Products: result
        );
    }

    private async Task<FunctionExecResult> GetProductDetail(
        Dictionary<string, object>? args,
        CancellationToken ct
    )
    {
        if (
            args == null
            || !TryGetString(args, "product_id", out var pidStr)
            || !Guid.TryParse(pidStr, out var guid)
        )
            return new FunctionExecResult("{}");
        var p = await context
            .Products.AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == guid && x.IsActive, ct);
        if (p == null)
            return new FunctionExecResult("{}");
        return new FunctionExecResult(
            JsonSerializer.Serialize(
                new
                {
                    id = p.Id,
                    name = p.Name,
                    price = p.Price,
                    sale_price = p.SalePrice,
                    description = p.Description,
                    variants = p.Variants.Select(v => new
                    {
                        v.Size,
                        v.Color,
                        v.Quantity,
                        v.ImageUrl,
                    }),
                },
                JsonOpts
            )
        );
    }

    private FunctionExecResult RecommendSize(Dictionary<string, object>? args)
    {
        if (args == null)
            return new FunctionExecResult("{}");
        var heightCm = TryGetDecimal(args, "height_cm", out var h) ? h : 170m;
        var weightKg = TryGetDecimal(args, "weight_kg", out var w) ? w : 65m;
        string? recommended;
        if (heightCm < 165)
            recommended =
                weightKg < 55 ? "S"
                : weightKg < 65 ? "M"
                : weightKg < 75 ? "L"
                : "XL";
        else if (heightCm < 172)
            recommended =
                weightKg < 58 ? "S"
                : weightKg < 70 ? "M"
                : weightKg < 80 ? "L"
                : weightKg < 90 ? "XL"
                : "XXL";
        else if (heightCm < 180)
            recommended =
                weightKg < 62 ? "M"
                : weightKg < 75 ? "L"
                : weightKg < 88 ? "XL"
                : "XXL";
        else
            recommended =
                weightKg < 70 ? "L"
                : weightKg < 82 ? "XL"
                : "XXL";
        var guide = new List<SizeGuideRowDto>
        {
            new("S", "160-167", "50-58", "86-91", "71-76"),
            new("M", "165-172", "58-67", "91-96", "76-81"),
            new("L", "170-178", "65-76", "96-101", "81-86"),
            new("XL", "175-183", "74-86", "101-106", "86-91"),
            new("XXL", "180-188", "84-98", "106-112", "91-97"),
        };
        return new FunctionExecResult(
            JsonSerializer.Serialize(
                new { recommended_size = recommended, size_guide = guide },
                JsonOpts
            ),
            SizeGuide: new ChatSizeGuideDto(recommended, guide)
        );
    }

    private async Task<FunctionExecResult> GetOrderStatus(
        Dictionary<string, object>? args,
        CancellationToken ct
    )
    {
        if (
            args == null
            || !TryGetString(args, "order_id", out var oidStr)
            || !Guid.TryParse(oidStr, out var guid)
        )
            return new FunctionExecResult("{}");
        var order = await context
            .Orders.AsNoTracking()
            .Include(o => o.StatusHistories)
            .FirstOrDefaultAsync(o => o.Id == guid, ct);
        if (order == null)
            return new FunctionExecResult(
                JsonSerializer.Serialize(new { error = "Không tìm thấy đơn hàng" }, JsonOpts)
            );
        var dto = new ChatOrderStatusDto(
            order.Id.ToString(),
            order.Status.ToString(),
            order.Status == OrderStatus.Shipping ? "2-5 ngày làm việc" : null,
            order
                .StatusHistories.OrderByDescending(h => h.ChangedAt)
                .Select(h => new ChatOrderHistoryDto(
                    h.Status.ToString(),
                    h.ChangedAt.ToString("dd/MM/yyyy HH:mm")
                ))
                .ToList()
        );
        return new FunctionExecResult(
            JsonSerializer.Serialize(
                new
                {
                    order_id = dto.OrderId,
                    status = dto.Status,
                    estimated_delivery = dto.EstimatedDelivery,
                    history = dto.History,
                },
                JsonOpts
            ),
            OrderStatus: dto
        );
    }

    private async Task<FunctionExecResult> GetPromotions(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var coupons = await context
            .Coupons.AsNoTracking()
            .Where(c => c.Status == CouponStatus.Active && c.StartsAt <= now && c.ExpiresAt >= now)
            .OrderByDescending(c => c.DiscountAmount)
            .Take(10)
            .ToListAsync(ct);
        var list = coupons
            .Select(c => new ChatPromotionDto(
                c.Code,
                c.DiscountType == CouponDiscountType.Percent
                    ? $"Giảm {c.DiscountAmount}%"
                    : $"Giảm {c.DiscountAmount:N0} VNĐ",
                c.DiscountType == CouponDiscountType.Percent ? c.DiscountAmount : null,
                c.DiscountType == CouponDiscountType.Flat ? c.DiscountAmount : null,
                c.MinOrderSubtotal > 0 ? c.MinOrderSubtotal : null
            ))
            .ToList();
        return new FunctionExecResult(
            JsonSerializer.Serialize(new { promotions = list }, JsonOpts),
            Promotions: list
        );
    }

    private FunctionExecResult GetFaqs()
    {
        var list = new List<ChatFaqDto>
        {
            new(
                "Làm thế nào để chọn size phù hợp?",
                "Bạn có thể tham khảo bảng size trên trang sản phẩm hoặc hỏi tôi để được tư vấn dựa trên chiều cao và cân nặng."
            ),
            new(
                "Sản phẩm có được đổi trả không?",
                "Có, chúng tôi hỗ trợ đổi trả trong vòng 30 ngày. Sản phẩm phải còn nguyên nhãn mác và chưa qua sử dụng."
            ),
            new(
                "Thời gian giao hàng bao lâu?",
                "Nội thành: 1-3 ngày. Ngoại thành: 3-7 ngày làm việc."
            ),
            new("Có ship COD không?", "Có, chúng tôi hỗ trợ COD cho tất cả đơn hàng."),
        };
        return new FunctionExecResult(
            JsonSerializer.Serialize(new { faqs = list }, JsonOpts),
            Faqs: list
        );
    }

    private FunctionExecResult GetShippingPolicy()
    {
        var list = new List<ChatPolicyDto>
        {
            new("Phạm vi giao hàng", "Toàn quốc."),
            new("Thời gian", "Nội thành: 1-3 ngày. Ngoại thành: 3-7 ngày."),
            new("Phí ship", "Miễn phí đơn từ 500.000 VNĐ. Dưới 500.000 VNĐ: 30.000 VNĐ."),
        };
        return new FunctionExecResult(
            JsonSerializer.Serialize(new { policies = list }, JsonOpts),
            Policies: list
        );
    }

    private FunctionExecResult GetReturnPolicy()
    {
        var list = new List<ChatPolicyDto>
        {
            new("Điều kiện", "Còn nguyên nhãn mác, chưa qua sử dụng. Trong vòng 30 ngày."),
            new("Được đổi trả", "Lỗi kỹ thuật, sai mô tả, sai size/màu."),
            new("Không được đổi trả", "Đã qua sử dụng, sale > 50%, phụ kiện (tất, mũ, khăn)."),
        };
        return new FunctionExecResult(
            JsonSerializer.Serialize(new { policies = list }, JsonOpts),
            Policies: list
        );
    }

    private static bool IsGreetingMessage(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return false;

        var normalized = message.Trim().ToLowerInvariant();
        if (normalized.Length > 30)
            return false;

        normalized = Regex.Replace(normalized, "[\\p{P}\"]", "");

        var greetings = new[]
        {
            "xin chào",
            "chào",
            "hello",
            "hi",
            "hey",
            "chào bạn",
            "chào anh",
            "chào chị",
            "chào em",
            "chào mọi người",
        };

        var tokens = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (tokens.Length == 0)
            return false;

        if (tokens.Length == 1 && greetings.Contains(tokens[0]))
            return true;

        var normalizedMessage = string.Join(' ', tokens);
        return greetings.Any(g => normalizedMessage == g || normalizedMessage.StartsWith(g + " "));
    }

    private async Task<FunctionExecResult> GetRecommendations(
        Dictionary<string, object>? args,
        CancellationToken ct
    )
    {
        if (
            args == null
            || !TryGetString(args, "product_id", out var pidStr)
            || !Guid.TryParse(pidStr, out var guid)
        )
            return new FunctionExecResult("[]");
        var source = await context
            .Products.AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == guid, ct);
        if (source == null)
            return new FunctionExecResult("[]");
        var recs = await context
            .Products.AsNoTracking()
            .Include(p => p.Variants)
            .Where(p => p.CategoryId == source.CategoryId && p.Id != guid && p.IsActive)
            .OrderByDescending(p => p.AverageRating)
            .Take(5)
            .ToListAsync(ct);
        var reasons = new[] { "Cùng danh mục", "Phổ biến", "Đánh giá cao", "Tương tự", "Phối hợp" };
        var result = recs.Select(
                (p, i) =>
                {
                    var fv = p.Variants.FirstOrDefault();
                    return new ChatRecommendationDto(
                        p.Id.ToString(),
                        p.Name,
                        p.Slug,
                        p.Price,
                        p.SalePrice,
                        fv?.ImageUrl,
                        i < reasons.Length ? reasons[i] : "Liên quan"
                    );
                }
            )
            .ToList();
        return new FunctionExecResult(
            JsonSerializer.Serialize(new { recommendations = result }, JsonOpts),
            Recommendations: result
        );
    }

    // ── Helpers ───────────────────────────────────────────────

    private static bool TryGetString(Dictionary<string, object> dict, string key, out string value)
    {
        if (dict.TryGetValue(key, out var obj) && obj is string s && !string.IsNullOrWhiteSpace(s))
        {
            value = s.Trim();
            return true;
        }
        value = "";
        return false;
    }

    private static bool TryGetDecimal(
        Dictionary<string, object> dict,
        string key,
        out decimal value
    )
    {
        if (dict.TryGetValue(key, out var obj))
        {
            if (obj is JsonElement el && el.ValueKind == JsonValueKind.Number)
            {
                value = el.GetDecimal();
                return true;
            }
            if (obj is double d)
            {
                value = (decimal)d;
                return true;
            }
            if (obj is int i)
            {
                value = i;
                return true;
            }
        }
        value = 0;
        return false;
    }

    // ── DTOs ──────────────────────────────────────────────────

    private sealed record FunctionExecResult(
        string JsonData,
        IReadOnlyList<ChatProductDto>? Products = null,
        IReadOnlyList<ChatRecommendationDto>? Recommendations = null,
        ChatOrderStatusDto? OrderStatus = null,
        IReadOnlyList<ChatPromotionDto>? Promotions = null,
        IReadOnlyList<ChatFaqDto>? Faqs = null,
        IReadOnlyList<ChatPolicyDto>? Policies = null,
        ChatSizeGuideDto? SizeGuide = null
    );

    private sealed class GeminiResponse
    {
        public List<Choice>? Choices { get; set; }
    }

    private sealed class Choice
    {
        public MessageData? Message { get; set; }
    }

    private sealed class MessageData
    {
        public string? Content { get; set; }

        [JsonPropertyName("tool_calls")]
        public List<ToolCallData>? ToolCalls { get; set; }
    }

    private sealed class ToolCallData
    {
        public string Id { get; set; } = "";
        public string Type { get; set; } = "";
        public FunctionData? Function { get; set; }
    }

    private sealed class FunctionData
    {
        public string Name { get; set; } = "";
        public string? Arguments { get; set; }
    }
}
