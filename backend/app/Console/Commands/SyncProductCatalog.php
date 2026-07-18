<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SyncProductCatalog extends Command
{
    protected $signature = 'products:sync-catalog';

    protected $description = 'Sync Đức Chính Jewelry catalog and local image paths.';

    public function handle(): int
    {
        $updated = 0;
        $missingImages = 0;
        $translations = require database_path('data/jewelry_product_translations.php');

        foreach (self::catalog() as $id => $item) {
            $image = $item['image'] ?? 'products/product-'.str_pad((string) $id, 2, '0', STR_PAD_LEFT).'.jpg';

            if (! Storage::disk('public')->exists($image)) {
                $missingImages++;
                $this->warn("Missing image for product {$id}: {$image}");
            }

            Product::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $item['name'],
                    'name_en' => $translations[$id] ?? null,
                    'price' => $item['price'],
                    'image' => $image,
                    'description' => $item['description'],
                    'description_en' => match ($item['category']) {
                        'Dây chuyền' => 'An elegant necklace crafted for refined everyday styling and meaningful occasions.',
                        'Bông tai' => 'A polished pair of earrings designed to bring a graceful highlight to every look.',
                        'Vòng tay' => 'A refined bracelet with balanced proportions, ideal for wearing alone or in a stack.',
                        default => 'A refined jewelry design crafted with careful attention to every detail.',
                    },
                    'category' => $item['category'],
                    'is_best_seller' => $item['is_best_seller'],
                    'stock' => $item['stock'],
                    'status' => $item['status'] ?? 'active',
                ]
            );

            $updated++;
        }

        $this->info("Synced {$updated} jewelry products. Missing images: {$missingImages}.");

        return self::SUCCESS;
    }

    public static function catalog(): array
    {
        $path = database_path('data/jewelry_products.json');
        $items = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        return collect($items)
            ->mapWithKeys(fn (array $item) => [(int) $item['id'] => $item])
            ->all();
    }
}
