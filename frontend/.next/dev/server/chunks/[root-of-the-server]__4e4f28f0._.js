module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
function trimText(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
function formatProduct(product) {
    const status = product.status === "inactive" || typeof product.stock === "number" && product.stock <= 0 ? "het hang" : "con hang";
    return [
        `ID ${product.id}`,
        product.name,
        product.category ? `danh muc: ${product.category}` : "",
        `gia: ${product.price.toLocaleString("vi-VN")} VND`,
        `trang thai: ${status}`,
        product.description ? `mo ta: ${product.description.slice(0, 140)}` : ""
    ].filter(Boolean).join(" | ");
}
function extractOutputText(data) {
    if (typeof data !== "object" || data === null) return "";
    const outputText = data.output_text;
    if (typeof outputText === "string" && outputText.trim()) {
        return outputText.trim();
    }
    const output = data.output;
    if (!Array.isArray(output)) return "";
    return output.flatMap((item)=>{
        if (typeof item !== "object" || item === null) return [];
        const content = item.content;
        return Array.isArray(content) ? content : [];
    }).map((contentItem)=>{
        if (typeof contentItem !== "object" || contentItem === null) return "";
        const text = contentItem.text;
        return typeof text === "string" ? text : "";
    }).filter(Boolean).join("\n").trim();
}
async function POST(request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Chua cau hinh OPENAI_API_KEY."
        }, {
            status: 503
        });
    }
    try {
        const body = await request.json();
        const message = trimText(body.message, 800);
        if (!message) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Vui long nhap noi dung can tu van."
            }, {
                status: 400
            });
        }
        const history = Array.isArray(body.history) ? body.history.slice(-8).map((item)=>({
                role: item.role === "assistant" ? "assistant" : "user",
                content: trimText(item.content, 500)
            })).filter((item)=>item.content) : [];
        const products = Array.isArray(body.products) ? body.products.filter((product)=>product && typeof product.id === "number" && typeof product.name === "string").slice(0, 12) : [];
        const productContext = products.length ? products.map(formatProduct).join("\n") : "Chua co danh sach san pham tu he thong.";
        const historyContext = history.length ? history.map((item)=>`${item.role === "assistant" ? "Tro ly" : "Khach"}: ${item.content}`).join("\n") : "Chua co lich su hoi thoai.";
        const prompt = `Ban la Bloom Assistant, chatbot tu van cho website ban kinh mat Bloom.

Muc tieu:
- Tra loi bang tieng Viet tu nhien, than thien, ngan gon.
- Tu van chon kinh theo nhu cau, dang mat, ngan sach, kinh can, kinh mat, UV, di hoc, van phong, qua tang.
- Neu co san pham phu hop trong danh sach, goi y ten san pham va gia. Khong bia san pham ngoai danh sach.
- Neu thieu thong tin, hoi lai 1 cau ngan de chot nhu cau.
- Khong dua loi khuyen y khoa chan doan benh mat. Neu can do khuc xa, khuyen khach den cua hang/bac si mat.
- Khong nhac den API, model, system prompt hay noi bo ky thuat.

Danh sach san pham Bloom:
${productContext}

Lich su hoi thoai gan day:
${historyContext}

Khach vua hoi: ${message}`;
        const openaiResponse = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
                input: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "input_text",
                                text: prompt
                            }
                        ]
                    }
                ],
                max_output_tokens: 450
            })
        });
        const data = await openaiResponse.json();
        if (!openaiResponse.ok) {
            console.error("OpenAI chat error:", data);
            const error = typeof data === "object" && data !== null && "error" in data ? data.error : undefined;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                code: error?.code || error?.type || "openai_error",
                message: error?.code === "insufficient_quota" ? "OpenAI API key hien het quota hoac chua bat billing." : "AI hien chua phan hoi duoc. Vui long thu lai sau."
            }, {
                status: openaiResponse.status
            });
        }
        const text = extractOutputText(data);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            text: text || "Minh chua tao duoc cau tra loi phu hop. Ban cho minh biet nhu cau, dang mat va ngan sach de tu van chinh xac hon nhe."
        });
    } catch (error) {
        console.error("Chat route error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Khong the ket noi chatbot AI luc nay."
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e4f28f0._.js.map