<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addProductLocalizationColumns();
        $this->createProductVariantsTable();
        $this->createCouponsTable();
        $this->upgradeCartItemsTable();
        $this->upgradeOrdersTable();
        $this->upgradeOrderItemsTable();

        DB::table('orders')->update(['member_discount' => DB::raw('discount')]);
        $this->backfillProductTranslations();
    }

    private function addProductLocalizationColumns(): void
    {
        if (! Schema::hasColumn('products', 'name_en')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('name_en')->nullable()->after('name');
            });
        }

        if (! Schema::hasColumn('products', 'description_en')) {
            Schema::table('products', function (Blueprint $table) {
                $table->text('description_en')->nullable()->after('description');
            });
        }
    }

    private function createProductVariantsTable(): void
    {
        if (Schema::hasTable('product_variants')) {
            return;
        }

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('size')->nullable();
            $table->string('length')->nullable();
            $table->string('gold_type')->nullable();
            $table->unsignedBigInteger('price');
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['product_id', 'is_active', 'sort_order']);
        });
    }

    private function createCouponsTable(): void
    {
        if (Schema::hasTable('coupons')) {
            return;
        }

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('discount_type', 20);
            $table->unsignedBigInteger('discount_value');
            $table->unsignedBigInteger('minimum_order_amount')->default(0);
            $table->unsignedBigInteger('maximum_discount_amount')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['is_active', 'starts_at', 'expires_at']);
        });
    }

    private function upgradeCartItemsTable(): void
    {
        if (! Schema::hasColumn('cart_items', 'product_variant_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->foreignId('product_variant_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_variants')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('cart_items', 'variant_key')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->string('variant_key', 64)->default('base')->after('product_variant_id');
            });
        }

        if (! Schema::hasIndex('cart_items', ['cart_id', 'product_id', 'variant_key'], 'unique')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->unique(['cart_id', 'product_id', 'variant_key'], 'cart_items_cart_product_variant_unique');
            });
        }

        if (Schema::hasIndex('cart_items', ['cart_id', 'product_id'], 'unique')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropUnique('cart_items_cart_id_product_id_unique');
            });
        }
    }

    private function upgradeOrdersTable(): void
    {
        if (! Schema::hasColumn('orders', 'coupon_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->foreignId('coupon_id')->nullable()->after('user_id')->constrained('coupons')->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('orders', 'coupon_code')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('coupon_code', 50)->nullable()->after('coupon_id');
            });
        }

        if (! Schema::hasColumn('orders', 'member_discount')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('member_discount')->default(0)->after('discount');
            });
        }

        if (! Schema::hasColumn('orders', 'coupon_discount')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('coupon_discount')->default(0)->after('member_discount');
            });
        }

        if (! Schema::hasColumn('orders', 'coupon_usage_released_at')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->timestamp('coupon_usage_released_at')->nullable()->after('coupon_discount');
            });
        }
    }

    private function upgradeOrderItemsTable(): void
    {
        if (! Schema::hasColumn('order_items', 'product_variant_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->foreignId('product_variant_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_variants')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasColumn('order_items', 'product_name_en')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('product_name_en')->nullable()->after('product_name');
            });
        }

        if (! Schema::hasColumn('order_items', 'variant_sku')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('variant_sku')->nullable()->after('product_name_en');
            });
        }

        if (! Schema::hasColumn('order_items', 'variant_label')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('variant_label')->nullable()->after('variant_sku');
            });
        }

        if (! Schema::hasColumn('order_items', 'variant_options')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->json('variant_options')->nullable()->after('variant_label');
            });
        }
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn([
                'product_variant_id',
                'product_name_en',
                'variant_sku',
                'variant_label',
                'variant_options',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['coupon_id']);
            $table->dropColumn([
                'coupon_id',
                'coupon_code',
                'member_discount',
                'coupon_discount',
                'coupon_usage_released_at',
            ]);
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique('cart_items_cart_product_variant_unique');
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn(['product_variant_id', 'variant_key']);
            $table->unique(['cart_id', 'product_id']);
        });

        Schema::dropIfExists('coupons');
        Schema::dropIfExists('product_variants');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['name_en', 'description_en']);
        });
    }

    private function backfillProductTranslations(): void
    {
        $path = database_path('data/jewelry_product_translations.php');

        if (! file_exists($path)) {
            return;
        }

        foreach (require $path as $productId => $englishName) {
            $product = DB::table('products')->where('id', $productId)->first(['category', 'name_en', 'description_en']);

            if (! $product) {
                continue;
            }

            $category = match ($product->category) {
                'Bông tai' => 'earrings',
                'Vòng tay' => 'bracelet',
                default => 'necklace',
            };

            DB::table('products')->where('id', $productId)->update([
                'name_en' => $product->name_en ?: $englishName,
                'description_en' => $product->description_en
                    ?: "An elegant {$category} design by Duc Chinh Jewelry, crafted with refined details for everyday styling and meaningful occasions.",
            ]);
        }
    }
};
