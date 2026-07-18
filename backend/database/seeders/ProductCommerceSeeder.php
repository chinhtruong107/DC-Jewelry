<?php

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductCommerceSeeder extends Seeder
{
    public function run(): void
    {
        Product::query()->orderBy('id')->each(function (Product $product) {
            $stocks = $this->splitStock(max(3, (int) $product->stock));

            foreach ($this->optionsFor($product) as $index => $options) {
                $price = (int) round($product->price * [1, 1.08, 1.15][$index] / 1000) * 1000;

                $product->variants()->updateOrCreate(
                    ['sku' => 'DCJ-'.str_pad((string) $product->id, 3, '0', STR_PAD_LEFT).'-V'.($index + 1)],
                    [
                        ...$options,
                        'price' => $price,
                        'stock' => $stocks[$index],
                        'is_active' => true,
                        'sort_order' => $index,
                    ]
                );
            }

            $product->update([
                'price' => (int) $product->variants()->where('is_active', true)->min('price'),
                'stock' => (int) $product->variants()->where('is_active', true)->sum('stock'),
            ]);
        });

        $this->seedCoupons();
    }

    private function optionsFor(Product $product): array
    {
        $goldType = $this->goldType($product->name);

        return match ($product->category) {
            'Dây chuyền' => [
                ['size' => null, 'length' => '40 cm', 'gold_type' => $goldType],
                ['size' => null, 'length' => '45 cm', 'gold_type' => $goldType],
                ['size' => null, 'length' => '50 cm', 'gold_type' => $goldType],
            ],
            'Bông tai' => [
                ['size' => 'Nhỏ', 'length' => null, 'gold_type' => $goldType],
                ['size' => 'Vừa', 'length' => null, 'gold_type' => $goldType],
                ['size' => 'Lớn', 'length' => null, 'gold_type' => $goldType],
            ],
            default => [
                ['size' => '15', 'length' => '15 cm', 'gold_type' => $goldType],
                ['size' => '17', 'length' => '17 cm', 'gold_type' => $goldType],
                ['size' => '19', 'length' => '19 cm', 'gold_type' => $goldType],
            ],
        };
    }

    private function goldType(string $name): string
    {
        $karat = Str::contains($name, '18K') ? '18K' : '14K';

        if (Str::contains(Str::lower($name), 'vàng trắng')) {
            return "Vàng trắng {$karat}";
        }

        if (Str::contains(Str::lower($name), 'vàng hồng')) {
            return "Vàng hồng {$karat}";
        }

        return "Vàng vàng {$karat}";
    }

    private function splitStock(int $stock): array
    {
        $first = (int) floor($stock * 0.4);
        $second = (int) floor($stock * 0.35);

        return [$first, $second, $stock - $first - $second];
    }

    private function seedCoupons(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Chào mừng khách hàng mới',
                'description' => 'Giảm 10% cho đơn hàng từ 1.000.000 ₫.',
                'discount_type' => Coupon::TYPE_PERCENTAGE,
                'discount_value' => 10,
                'minimum_order_amount' => 1000000,
                'maximum_discount_amount' => 500000,
                'usage_limit' => 500,
            ],
            [
                'code' => 'GIAM200K',
                'name' => 'Ưu đãi trang sức',
                'description' => 'Giảm trực tiếp 200.000 ₫ cho đơn từ 3.000.000 ₫.',
                'discount_type' => Coupon::TYPE_FIXED,
                'discount_value' => 200000,
                'minimum_order_amount' => 3000000,
                'maximum_discount_amount' => null,
                'usage_limit' => 250,
            ],
            [
                'code' => 'VIP15',
                'name' => 'Ưu đãi VIP',
                'description' => 'Giảm 15% cho đơn hàng cao cấp từ 8.000.000 ₫.',
                'discount_type' => Coupon::TYPE_PERCENTAGE,
                'discount_value' => 15,
                'minimum_order_amount' => 8000000,
                'maximum_discount_amount' => 1500000,
                'usage_limit' => 100,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(
                ['code' => $coupon['code']],
                [
                    ...$coupon,
                    'usage_count' => 0,
                    'starts_at' => now()->subDay(),
                    'expires_at' => now()->addYear(),
                    'is_active' => true,
                ]
            );
        }
    }
}
