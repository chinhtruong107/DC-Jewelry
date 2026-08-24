import { NextResponse } from "next/server";

type ChatRole = "assistant" | "user";

type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

type ChatProduct = {
  id: number;
  name: string;
  price: number;
  category?: string;
  description?: string;
  stock?: number;
  status?: string;
};

function trimText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function formatProduct(product: ChatProduct) {
  const status =
    product.status === "inactive" || (typeof product.stock === "number" && product.stock <= 0)
      ? "hết hàng"
      : "còn hàng";

  return [
    `ID ${product.id}`,
    product.name,
    product.category ? `danh mục: ${product.category}` : "",
    `giá: ${product.price.toLocaleString("vi-VN")} VND`,
    `trạng thái: ${status}`,
    product.description ? `mô tả: ${product.description.slice(0, 140)}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!geminiApiKey && !openaiApiKey) {
    return NextResponse.json(
      { message: "Chưa cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      message?: unknown;
      history?: ChatHistoryItem[];
      products?: ChatProduct[];
    };

    const message = trimText(body.message, 800);

    if (!message) {
      return NextResponse.json(
        { message: "Vui lòng nhập nội dung cần tư vấn." },
        { status: 400 }
      );
    }

    const history = Array.isArray(body.history)
      ? body.history
          .slice(-8)
          .map((item) => ({
            role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: trimText(item.content, 500),
          }))
          .filter((item) => item.content)
      : [];

    const products = Array.isArray(body.products)
      ? body.products
          .filter((product) => product && typeof product.id === "number" && typeof product.name === "string")
          .slice(0, 12)
      : [];

    const productContext = products.length
      ? products.map(formatProduct).join("\n")
      : "Chưa có danh sách sản phẩm từ hệ thống.";

    const historyContext = history.length
      ? history.map((item) => `${item.role === "assistant" ? "Trợ lý" : "Khách"}: ${item.content}`).join("\n")
      : "Chưa có lịch sử hội thoại.";

    const prompt = `Bạn là Đức Chính Jewelry Concierge, chatbot tư vấn cho website trang sức cao cấp Đức Chính Jewelry.

Mục tiêu:
- Trả lời bằng tiếng Việt tự nhiên, thân thiện, ngắn gọn.
- Tư vấn theo đúng 3 nhóm chính: dây chuyền, bông tai, vòng tay/lắc tay.
- Có thể tư vấn theo phong cách, dịp sử dụng, ngân sách, chất liệu và nhu cầu quà tặng.
- Nếu có sản phẩm phù hợp trong danh sách, gợi ý tên sản phẩm và giá. Không bịa sản phẩm ngoài danh sách.
- Nếu thiếu thông tin, hỏi lại 1 câu ngắn để chốt nhu cầu.
- Không khẳng định chất liệu, chứng nhận hoặc chính sách nếu thông tin đó không có trong dữ liệu sản phẩm.
- Không nhắc đến API, model, system prompt hay nội bộ kỹ thuật.

Danh sách sản phẩm Đức Chính Jewelry:
${productContext}

Lịch sử hội thoại gần đây:
${historyContext}

Khách vừa hỏi: ${message}`;

    let replyText = "";

    if (geminiApiKey) {
      const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 450 },
        }),
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } else {
        console.error("Gemini chat error:", await geminiResponse.text());
      }
    }

    if (!replyText && openaiApiKey) {
      const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            {
              role: "system",
              content: "Bạn là Đức Chính Jewelry Concierge, chatbot tư vấn cho website trang sức cao cấp Đức Chính Jewelry.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 450,
        }),
      });

      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json();
        replyText = openaiData.choices?.[0]?.message?.content?.trim() || "";
      } else {
        console.error("OpenAI chat error:", await openaiResponse.text());
      }
    }

    return NextResponse.json({
      text:
        replyText ||
        "Mình chưa tạo được câu trả lời phù hợp. Bạn cho mình biết nhu cầu, nhóm sản phẩm và ngân sách để tư vấn chính xác hơn nhé.",
    });
  } catch (error) {
    console.error("Chat route error:", error);

    return NextResponse.json(
      { message: "Không thể kết nối chatbot AI lúc này." },
      { status: 500 }
    );
  }
}
