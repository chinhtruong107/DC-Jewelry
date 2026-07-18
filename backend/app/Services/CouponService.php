<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Validation\ValidationException;

class CouponService
{
    public function resolve(?string $code, int $subtotal, bool $lockForUpdate = false): ?Coupon
    {
        $normalizedCode = strtoupper(trim((string) $code));

        if ($normalizedCode === '') {
            return null;
        }

        $query = Coupon::where('code', $normalizedCode);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $coupon = $query->first();

        if (! $coupon || ! $coupon->is_active) {
            $this->fail('Mã giảm giá không tồn tại hoặc đã bị tắt.');
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            $this->fail('Mã giảm giá chưa đến thời gian sử dụng.');
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            $this->fail('Mã giảm giá đã hết hạn.');
        }

        if ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
            $this->fail('Mã giảm giá đã hết lượt sử dụng.');
        }

        if ($subtotal < $coupon->minimum_order_amount) {
            $minimum = number_format($coupon->minimum_order_amount, 0, ',', '.').' ₫';
            $this->fail("Đơn hàng cần đạt tối thiểu {$minimum} để dùng mã này.");
        }

        return $coupon;
    }

    public function payload(Coupon $coupon, int $subtotal): array
    {
        return [
            'coupon' => $coupon,
            'discount' => $coupon->calculateDiscount($subtotal),
        ];
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages([
            'coupon_code' => [$message],
        ]);
    }
}
