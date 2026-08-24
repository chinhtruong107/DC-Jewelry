<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationAndAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_login(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Khách hàng mới',
            'email' => 'customer@example.com',
            'phone' => '0389794445',
            'password' => 'SecurePass123',
        ])->assertCreated()
            ->assertJsonPath('user.email', 'customer@example.com')
            ->assertJsonStructure(['token']);

        $this->assertTrue(Hash::check('SecurePass123', User::where('email', 'customer@example.com')->firstOrFail()->password));

        $this->postJson('/api/login', [
            'email' => 'customer@example.com',
            'password' => 'SecurePass123',
        ])->assertOk()->assertJsonStructure(['token']);
    }

    public function test_login_error_is_returned_in_vietnamese(): void
    {
        User::factory()->create([
            'email' => 'customer@example.com',
            'password' => Hash::make('SecurePass123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'customer@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Email hoặc mật khẩu không chính xác.');
    }

    public function test_customer_cannot_access_admin_dashboard(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));
        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']), ['admin']);

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['products', 'orders', 'users', 'reviews', 'summary']);
    }

    public function test_guest_order_cannot_be_viewed_by_arbitrary_user(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $order = \App\Models\Order::create([
            'order_number' => 'DH2608240001ABC',
            'user_id' => null,
            'customer_name' => 'Khách Vãng Lai',
            'customer_email' => 'guest@example.com',
            'customer_phone' => '0987654321',
            'customer_address' => 'Hà Nội',
            'payment_method' => 'cod',
            'subtotal' => 100000,
            'shipping_fee' => 30000,
            'tax' => 8000,
            'discount' => 0,
            'total' => 138000,
        ]);

        Sanctum::actingAs($user);
        $this->getJson("/api/orders/{$order->id}")->assertForbidden();

        // Khách cung cấp đúng email thì được xem
        $this->getJson("/api/orders/{$order->id}?email=guest@example.com")->assertOk();
    }
}
