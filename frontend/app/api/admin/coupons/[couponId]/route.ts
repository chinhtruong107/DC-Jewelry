import { forwardedHeaders, LARAVEL_API_URL, proxyFailure, proxyJson } from "@/lib/serverApi";

type RouteContext = { params: Promise<{ couponId: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { couponId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/admin/coupons/${encodeURIComponent(couponId)}`, {
      method: "PUT",
      headers: forwardedHeaders(request),
      body: await request.text(),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Update coupon", error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { couponId } = await params;
    const response = await fetch(`${LARAVEL_API_URL}/admin/coupons/${encodeURIComponent(couponId)}`, {
      method: "DELETE",
      headers: forwardedHeaders(request),
    });
    return proxyJson(response);
  } catch (error) {
    return proxyFailure("Disable coupon", error);
  }
}
