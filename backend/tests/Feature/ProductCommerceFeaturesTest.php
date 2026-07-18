<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductCommerceFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_english_content_and_product_variants(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']), ['admin']);

        $response = $this->postJson('/api/products', [
            'name' => 'Dây chuyền trái tim vàng 14K',
            'name_en' => '14K Gold Heart Necklace',
            'description' => 'Thiết kế trái tim thanh lịch.',
            'description_en' => 'An elegant heart-shaped design.',
            'price' => 2000000,
            'category' => 'Dây chuyền',
            'stock' => 5,
            'status' => 'active',
            'variants' => [
                [
                    'sku' => 'HEART-40',
                    'length' => '40 cm',
                    'gold_type' => 'Vàng vàng 14K',
                    'price' => 2000000,
                    'stock' => 2,
                    'is_active' => true,
                ],
                [
                    'sku' => 'HEART-45',
                    'length' => '45 cm',
                    'gold_type' => 'Vàng vàng 14K',
                    'price' => 2200000,
                    'stock' => 3,
                    'is_active' => true,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('name_en', '14K Gold Heart Necklace')
            ->assertJsonPath('description_en', 'An elegant heart-shaped design.')
            ->assertJsonCount(2, 'variants')
            ->assertJsonPath('price', 2000000)
            ->assertJsonPath('stock', 5);

        $this->assertDatabaseHas('product_variants', [
            'sku' => 'HEART-45',
            'price' => 2200000,
            'stock' => 3,
        ]);
    }

    public function test_cart_keeps_product_variants_as_separate_lines(): void
    {
        $product = $this->variantProduct();
        $variants = $product->variants()->orderBy('id')->get();
        $headers = ['X-Cart-Token' => 'guest-variant-cart-123456789'];

        $this->withHeaders($headers)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variants[0]->id,
            'quantity' => 1,
        ])->assertCreated();

        $this->withHeaders($headers)->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variants[1]->id,
            'quantity' => 2,
        ])->assertCreated()
            ->assertJsonCount(2, 'items')
            ->assertJsonPath('items.0.variant_sku', 'TEST-40')
            ->assertJsonPath('items.1.variant_sku', 'TEST-45')
            ->assertJsonPath('subtotal', 6400000);
    }

    public function test_checkout_applies_coupon_to_authoritative_variant_price_and_updates_stock(): void
    {
        $product = $this->variantProduct();
        $variant = $product->variants()->where('sku', 'TEST-40')->firstOrFail();
        $coupon = Coupon::create([
            'code' => 'SAVE10',
            'name' => 'Giảm 10%',
            'discount_type' => Coupon::TYPE_PERCENTAGE,
            'discount_value' => 10,
            'minimum_order_amount' => 1000000,
            'usage_limit' => 10,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addDay(),
            'is_active' => true,
        ]);

        $this->postJson('/api/coupons/validate', ['code' => 'save10', 'subtotal' => 2000000])
            ->assertOk()
            ->assertJsonPath('discount', 200000);

        $response = $this->postJson('/api/orders', [
            'customer' => [
                'name' => 'Khách demo',
                'email' => 'demo@example.com',
                'phone' => '0389794445',
                'address' => 'Hà Nội',
            ],
            'items' => [[
                'id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 1,
            ]],
            'coupon_code' => 'save10',
            'payment_method' => 'cod',
        ]);

        $response->assertCreated()
            ->assertJsonPath('subtotal', 2000000)
            ->assertJsonPath('coupon_code', 'SAVE10')
            ->assertJsonPath('coupon_discount', 200000)
            ->assertJsonPath('total', 1960000)
            ->assertJsonPath('items.0.product_name_en', 'Test Necklace')
            ->assertJsonPath('items.0.variant_sku', 'TEST-40');

        $this->assertDatabaseHas('product_variants', ['id' => $variant->id, 'stock' => 1]);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 4]);
        $this->assertDatabaseHas('coupons', ['id' => $coupon->id, 'usage_count' => 1]);
    }

    public function test_expired_coupon_is_rejected(): void
    {
        Coupon::create([
            'code' => 'EXPIRED',
            'name' => 'Mã hết hạn',
            'discount_type' => Coupon::TYPE_FIXED,
            'discount_value' => 100000,
            'minimum_order_amount' => 0,
            'starts_at' => now()->subDays(2),
            'expires_at' => now()->subDay(),
            'is_active' => true,
        ]);

        $this->postJson('/api/coupons/validate', ['code' => 'EXPIRED', 'subtotal' => 2000000])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('coupon_code');
    }

    private function variantProduct(): Product
    {
        $product = Product::create([
            'name' => 'Dây chuyền thử nghiệm',
            'name_en' => 'Test Necklace',
            'price' => 2000000,
            'category' => 'Dây chuyền',
            'stock' => 5,
            'status' => 'active',
        ]);

        $product->variants()->createMany([
            ['sku' => 'TEST-40', 'length' => '40 cm', 'gold_type' => 'Vàng vàng 14K', 'price' => 2000000, 'stock' => 2, 'is_active' => true],
            ['sku' => 'TEST-45', 'length' => '45 cm', 'gold_type' => 'Vàng vàng 14K', 'price' => 2200000, 'stock' => 3, 'is_active' => true],
        ]);

        return $product;
    }
}
