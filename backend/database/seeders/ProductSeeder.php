<?php

namespace Database\Seeders;

use App\Console\Commands\SyncProductCatalog;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $translations = require database_path('data/jewelry_product_translations.php');

        foreach (SyncProductCatalog::catalog() as $id => $product) {
            Product::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $product['name'],
                    'name_en' => $translations[$id] ?? null,
                    'price' => $product['price'],
                    'image' => 'products/product-'.str_pad((string) $id, 2, '0', STR_PAD_LEFT).'.jpg',
                    'description' => $product['description'],
                    'description_en' => $this->englishDescription($product['category']),
                    'category' => $product['category'],
                    'is_best_seller' => $product['is_best_seller'],
                    'stock' => $product['stock'],
                    'status' => 'active',
                ]
            );
        }
    }

    private function englishDescription(string $category): string
    {
        return match ($category) {
            'Dây chuyền' => 'An elegant necklace crafted for refined everyday styling and meaningful occasions.',
            'Bông tai' => 'A polished pair of earrings designed to bring a graceful highlight to every look.',
            'Vòng tay' => 'A refined bracelet with balanced proportions, ideal for wearing alone or in a stack.',
            default => 'A refined jewelry design crafted with careful attention to every detail.',
        };
    }
}
