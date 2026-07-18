<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with(['variants' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->when($request->boolean('best_seller'), function ($query) {
                $query->where('is_best_seller', true);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('name_en', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('description_en', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $productData = $this->productData($request);

        $product = DB::transaction(function () use ($productData, $request) {
            $product = Product::create($productData);
            $this->syncVariants($product, $request->input('variants'));

            return $product;
        });

        return response()->json($product->fresh()->load('variants'), 201);
    }

    public function show($id)
    {
        return Product::with(['variants' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $product = Product::with('variants')->findOrFail($id);
        $productData = $this->productData($request, true, $product);

        DB::transaction(function () use ($product, $productData, $request) {
            $product->update($productData);
            $this->syncVariants($product, $request->input('variants'));
        });

        return response()->json($product->fresh()->load('variants'));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $this->deleteStoredImage($product->getRawImagePath());
        $product->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    private function productData(Request $request, bool $partial = false, ?Product $product = null): array
    {
        $data = $this->validatedData($request, $partial);
        unset($data['image_file'], $data['image_data'], $data['variants']);

        if ($request->hasFile('image_file')) {
            $this->deleteStoredImage($product?->getRawImagePath());
            $data['image'] = $request->file('image_file')->store('products', 'public');
        }

        if ($request->filled('image_data')) {
            $data['image'] = $this->storeImageData((string) $request->string('image_data'), $product, $data['image'] ?? null);
        }

        return $data;
    }

    private function storeImageData(string $imageData, ?Product $product = null, ?string $requestedPath = null): string
    {
        if (! preg_match('/^data:image\/(?:jpeg|jpg|png|webp);base64,/', $imageData)) {
            abort(422, 'Dữ liệu ảnh không hợp lệ.');
        }

        $binary = base64_decode(preg_replace('/^data:image\/(?:jpeg|jpg|png|webp);base64,/', '', $imageData), true);

        if ($binary === false) {
            abort(422, 'Không thể đọc dữ liệu ảnh.');
        }

        $targetPath = $product?->getRawImagePath() ?: $requestedPath;

        if (! $targetPath || str_starts_with($targetPath, 'http://') || str_starts_with($targetPath, 'https://')) {
            $targetPath = 'products/product-'.($product?->id ?? uniqid()).'.jpg';
        }

        $targetPath = ltrim(str_replace('/storage/', '', $targetPath), '/');
        Storage::disk('public')->put($targetPath, $binary);

        return $targetPath;
    }

    private function deleteStoredImage(?string $path): void
    {
        if (! $path || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return;
        }

        $path = ltrim(str_replace('/storage/', '', $path), '/');

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function validatedData(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'price' => [$required, 'integer', 'min:0'],
            'image' => ['nullable', 'string'],
            'image_data' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'category' => [$required, 'string', 'max:255'],
            'is_best_seller' => ['sometimes', 'boolean'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'warranty_months' => ['sometimes', 'integer', 'min:1', 'max:120'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
            'variants' => ['sometimes', 'array', 'max:100'],
            'variants.*.id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'variants.*.sku' => ['nullable', 'string', 'max:100', 'distinct'],
            'variants.*.size' => ['nullable', 'string', 'max:100'],
            'variants.*.length' => ['nullable', 'string', 'max:100'],
            'variants.*.gold_type' => ['nullable', 'string', 'max:100'],
            'variants.*.price' => ['required_with:variants', 'integer', 'min:0'],
            'variants.*.stock' => ['required_with:variants', 'integer', 'min:0'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function syncVariants(Product $product, mixed $variants): void
    {
        if (! is_array($variants)) {
            return;
        }

        $keptIds = [];

        foreach (array_values($variants) as $index => $variantData) {
            $variantId = isset($variantData['id']) ? (int) $variantData['id'] : null;
            $variant = $variantId ? $product->variants()->whereKey($variantId)->first() : null;

            if ($variantId && ! $variant) {
                throw ValidationException::withMessages([
                    "variants.{$index}.id" => ['Biến thể không thuộc sản phẩm này.'],
                ]);
            }

            $sku = strtoupper(trim((string) ($variantData['sku'] ?? '')));
            if ($sku === '') {
                $sku = 'DCJ-'.$product->id.'-V'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
            }

            $globalSkuExists = DB::table('product_variants')
                ->where('sku', $sku)
                ->when($variant, fn ($query) => $query->where('id', '!=', $variant->id))
                ->exists();

            if ($globalSkuExists) {
                throw ValidationException::withMessages([
                    "variants.{$index}.sku" => ["SKU {$sku} đã được sử dụng."],
                ]);
            }

            $payload = [
                'sku' => $sku,
                'size' => $this->nullableString($variantData['size'] ?? null),
                'length' => $this->nullableString($variantData['length'] ?? null),
                'gold_type' => $this->nullableString($variantData['gold_type'] ?? null),
                'price' => (int) $variantData['price'],
                'stock' => (int) $variantData['stock'],
                'is_active' => (bool) ($variantData['is_active'] ?? true),
                'sort_order' => $index,
            ];

            if ($variant) {
                $variant->update($payload);
            } else {
                $variant = $product->variants()->create($payload);
            }

            $keptIds[] = $variant->id;
        }

        $product->variants()
            ->when($keptIds !== [], fn ($query) => $query->whereNotIn('id', $keptIds))
            ->update(['is_active' => false, 'stock' => 0]);

        $activeVariants = $product->variants()->where('is_active', true);
        if ((clone $activeVariants)->exists()) {
            $product->update([
                'price' => (int) (clone $activeVariants)->min('price'),
                'stock' => (int) (clone $activeVariants)->sum('stock'),
            ]);
        }
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : Str::limit($value, 100, '');
    }
}
