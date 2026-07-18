<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCouponController extends Controller
{
    public function store(Request $request)
    {
        $coupon = Coupon::create($this->couponData($request));

        return response()->json($coupon, 201);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $coupon->update($this->couponData($request, $coupon));

        return response()->json($coupon->fresh());
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->update(['is_active' => false]);

        return response()->json(['message' => 'Đã ngừng mã giảm giá.']);
    }

    private function couponData(Request $request, ?Coupon $coupon = null): array
    {
        $data = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->ignore($coupon?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', Rule::in([Coupon::TYPE_PERCENTAGE, Coupon::TYPE_FIXED])],
            'discount_value' => ['required', 'integer', 'min:1'],
            'minimum_order_amount' => ['required', 'integer', 'min:0'],
            'maximum_discount_amount' => ['nullable', 'integer', 'min:1'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['required', 'boolean'],
        ]);

        $data['code'] = strtoupper(trim($data['code']));

        if ($data['discount_type'] === Coupon::TYPE_PERCENTAGE && $data['discount_value'] > 100) {
            abort(422, 'Phần trăm giảm giá không được vượt quá 100%.');
        }

        return $data;
    }
}
