<?php

namespace App\Http\Controllers;

use App\Services\CouponService;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCoupon(Request $request, CouponService $coupons)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'integer', 'min:0'],
        ]);

        $coupon = $coupons->resolve($validated['code'], (int) $validated['subtotal']);

        return response()->json($coupons->payload($coupon, (int) $validated['subtotal']));
    }
}
