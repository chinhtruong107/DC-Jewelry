<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedSmallInteger('warranty_months')->default(12)->after('stock');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_carrier', 20)->nullable()->after('payment_status');
            $table->string('tracking_number', 64)->nullable()->unique()->after('shipping_carrier');
            $table->text('tracking_url')->nullable()->after('tracking_number');
            $table->timestamp('shipped_at')->nullable()->after('tracking_url');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('certificate_code', 40)->nullable()->unique()->after('line_total');
            $table->unsignedSmallInteger('warranty_months')->default(12)->after('certificate_code');
            $table->timestamp('warranty_starts_at')->nullable()->after('warranty_months');
            $table->timestamp('warranty_expires_at')->nullable()->after('warranty_starts_at');
        });

        Schema::create('shipment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status', 40);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('event_at');
            $table->timestamps();
            $table->index(['order_id', 'event_at']);
        });

        DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select('order_items.id', 'orders.order_number', 'orders.created_at')
            ->orderBy('order_items.id')
            ->each(function ($item) {
                $start = Carbon::parse($item->created_at);
                $code = 'DCJ-'.strtoupper(substr(hash('sha256', $item->order_number.'-'.$item->id), 0, 12));

                DB::table('order_items')->where('id', $item->id)->update([
                    'certificate_code' => $code,
                    'warranty_starts_at' => $start,
                    'warranty_expires_at' => $start->copy()->addMonths(12),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_events');

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropUnique(['certificate_code']);
            $table->dropColumn(['certificate_code', 'warranty_months', 'warranty_starts_at', 'warranty_expires_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['tracking_number']);
            $table->dropColumn(['shipping_carrier', 'tracking_number', 'tracking_url', 'shipped_at', 'delivered_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('warranty_months');
        });
    }
};
