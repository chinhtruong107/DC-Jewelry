<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($this->cartPayload($this->resolveCart($request)));
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);
        $product = Product::findOrFail($validated['product_id']);
        $variant = $this->resolveVariant($product, $validated['variant_id'] ?? null);
        $quantity = (int) ($validated['quantity'] ?? 1);

        $this->ensureProductCanBeAdded($product, $variant, $quantity);
        $cart = $this->resolveCart($request);
        $variantKey = $variant ? 'variant:'.$variant->id : 'base';
        $item = $cart->items()->firstOrNew([
            'product_id' => $product->id,
            'variant_key' => $variantKey,
        ]);
        $item->product_variant_id = $variant?->id;
        $availableStock = $variant?->stock ?? $product->stock;
        $item->quantity = min($availableStock, ($item->exists ? $item->quantity : 0) + $quantity);
        $item->save();

        return response()->json($this->cartPayload($cart->fresh()), 201);
    }

    public function updateItem(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);
        $quantity = (int) $validated['quantity'];
        $variant = $this->resolveVariant($product, $request->query('variant_id'), false);
        $this->ensureProductCanBeAdded($product, $variant, $quantity);
        $cart = $this->resolveCart($request);
        $item = $this->findCartItem($cart, $product, $variant);
        $item->update(['quantity' => min($quantity, $variant?->stock ?? $product->stock)]);

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public function destroyItem(Request $request, Product $product)
    {
        $cart = $this->resolveCart($request);
        $variant = $this->resolveVariant($product, $request->query('variant_id'), false);
        $this->findCartItem($cart, $product, $variant)->delete();

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public function clear(Request $request)
    {
        $cart = $this->resolveCart($request);
        $cart->items()->delete();

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public function merge(Request $request)
    {
        $validated = $request->validate([
            'guest_token' => ['required', 'string', 'min:16', 'max:64', 'regex:/^[A-Za-z0-9-]+$/'],
        ]);
        $user = $request->user();

        $cart = DB::transaction(function () use ($user, $validated) {
            $userCart = Cart::firstOrCreate(['user_id' => $user->id], ['guest_token' => null]);
            $guestCart = Cart::where('guest_token', $validated['guest_token'])->lockForUpdate()->first();

            if (! $guestCart || $guestCart->id === $userCart->id) {
                return $userCart;
            }

            $guestCart->load(['items.product', 'items.variant']);
            foreach ($guestCart->items as $guestItem) {
                $availableStock = $guestItem->variant?->stock ?? $guestItem->product?->stock ?? 0;
                if (! $guestItem->product
                    || $guestItem->product->status !== 'active'
                    || ($guestItem->product_variant_id && (! $guestItem->variant || ! $guestItem->variant->is_active))
                    || $availableStock < 1) {
                    continue;
                }

                $userItem = $userCart->items()->firstOrNew([
                    'product_id' => $guestItem->product_id,
                    'variant_key' => $guestItem->variant_key,
                ]);
                $userItem->product_variant_id = $guestItem->product_variant_id;
                $userItem->quantity = min(
                    $availableStock,
                    ($userItem->exists ? $userItem->quantity : 0) + $guestItem->quantity
                );
                $userItem->save();
            }

            $guestCart->delete();

            return $userCart;
        });

        return response()->json($this->cartPayload($cart->fresh()));
    }

    public static function clearForRequest(Request $request, $user = null): void
    {
        if ($user) {
            Cart::where('user_id', $user->id)->first()?->items()->delete();

            return;
        }

        $guestToken = $request->header('X-Cart-Token');
        if ($guestToken) {
            Cart::where('guest_token', $guestToken)->first()?->items()->delete();
        }
    }

    private function resolveCart(Request $request): Cart
    {
        $user = $this->resolveUser($request);
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id], ['guest_token' => null]);
        }

        $guestToken = (string) $request->header('X-Cart-Token');
        if (! preg_match('/^[A-Za-z0-9-]{16,64}$/', $guestToken)) {
            throw ValidationException::withMessages([
                'guest_token' => ['Thiếu mã giỏ hàng khách hợp lệ.'],
            ]);
        }

        return Cart::firstOrCreate(['guest_token' => $guestToken], ['user_id' => null]);
    }

    private function resolveUser(Request $request)
    {
        if ($request->user()) {
            return $request->user();
        }

        return $request->bearerToken()
            ? PersonalAccessToken::findToken($request->bearerToken())?->tokenable
            : null;
    }

    private function resolveVariant(Product $product, mixed $variantId, bool $requireForVariantProduct = true): ?ProductVariant
    {
        if ($variantId !== null && $variantId !== '') {
            $variant = $product->variants()->whereKey((int) $variantId)->where('is_active', true)->first();

            if (! $variant) {
                throw ValidationException::withMessages([
                    'variant_id' => ['Biến thể không tồn tại hoặc không thuộc sản phẩm này.'],
                ]);
            }

            return $variant;
        }

        if ($requireForVariantProduct && $product->variants()->where('is_active', true)->exists()) {
            throw ValidationException::withMessages([
                'variant_id' => ['Vui lòng chọn kích thước, chiều dài hoặc loại vàng trước khi thêm vào giỏ.'],
            ]);
        }

        return null;
    }

    private function ensureProductCanBeAdded(Product $product, ?ProductVariant $variant, int $quantity): void
    {
        $availableStock = $variant?->stock ?? $product->stock;

        if ($product->status !== 'active' || $availableStock < $quantity) {
            throw ValidationException::withMessages([
                'quantity' => ["Sản phẩm {$product->name} chỉ còn {$availableStock} sản phẩm."],
            ]);
        }
    }

    private function findCartItem(Cart $cart, Product $product, ?ProductVariant $variant)
    {
        $variantKey = $variant ? 'variant:'.$variant->id : 'base';

        return $cart->items()
            ->where('product_id', $product->id)
            ->where('variant_key', $variantKey)
            ->firstOrFail();
    }

    private function cartPayload(Cart $cart): array
    {
        $cart->load(['items.product', 'items.variant']);
        $items = $cart->items
            ->filter(function ($item) {
                $availableStock = $item->variant?->stock ?? $item->product?->stock ?? 0;

                return $item->product
                    && $item->product->status === 'active'
                    && (! $item->product_variant_id || ($item->variant && $item->variant->is_active))
                    && $availableStock > 0;
            })
            ->map(function ($item) {
                $availableStock = $item->variant?->stock ?? $item->product->stock;

                return [
                    'cart_item_id' => $item->id,
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'name_en' => $item->product->name_en,
                    'price' => $item->variant?->price ?? $item->product->price,
                    'image' => $item->product->image,
                    'stock' => $availableStock,
                    'quantity' => min($item->quantity, $availableStock),
                    'variant_id' => $item->variant?->id,
                    'variant_sku' => $item->variant?->sku,
                    'variant_label' => $item->variant?->label,
                    'variant_options' => $item->variant?->options(),
                ];
            })
            ->values();

        return [
            'id' => $cart->id,
            'items' => $items,
            'item_count' => $items->sum('quantity'),
            'subtotal' => $items->sum(fn ($item) => $item['price'] * $item['quantity']),
        ];
    }
}
