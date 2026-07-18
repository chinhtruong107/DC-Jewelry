<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'length',
        'gold_type',
        'price',
        'stock',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['label'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getLabelAttribute(): string
    {
        return collect([$this->gold_type, $this->size, $this->length])
            ->filter()
            ->implode(' · ') ?: $this->sku;
    }

    public function options(): array
    {
        return array_filter([
            'gold_type' => $this->gold_type,
            'size' => $this->size,
            'length' => $this->length,
        ]);
    }
}
