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

    public function test_legacy_order_resource_is_not_public(): void
    {
        $this->getJson('/api/don_hangs')->assertUnauthorized();
    }
}
