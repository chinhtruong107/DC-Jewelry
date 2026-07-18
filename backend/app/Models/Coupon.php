<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    public const TYPE_PERCENTAGE = 'percentage';

    public const TYPE_FIXED = 'fixed';

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'maximum_discount_amount',
        'usage_limit',
        'usage_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'integer',
        'minimum_order_amount' => 'integer',
        'maximum_discount_amount' => 'integer',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function calculateDiscount(int $subtotal): int
    {
        $discount = $this->discount_type === self::TYPE_PERCENTAGE
            ? (int) round($subtotal * $this->discount_value / 100)
            : (int) $this->discount_value;

        if ($this->maximum_discount_amount !== null) {
            $discount = min($discount, $this->maximum_discount_amount);
        }

        return max(0, min($subtotal, $discount));
    }
}
