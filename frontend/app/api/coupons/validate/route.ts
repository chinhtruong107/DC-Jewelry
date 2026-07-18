import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${LARAVEL_API_URL}/coupons/validate`, {
      method: "POST",
      headers: forwardedHeaders(request),
      body: await request.text(),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Validate coupon", error);
  }
}
