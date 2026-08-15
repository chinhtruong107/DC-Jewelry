-- Catalog 120 san pham DC Jewelry (UTF-8).
-- Chay sau khi Laravel migrations hoan tat:
-- mysql -u <user> -p trangsuc < backend/database/jewelry_catalog_120.sql
-- Anh: public/storage/products/product-01.jpg den product-120.jpg.

SET NAMES utf8mb4;
SET @seed_now = NOW();

INSERT INTO products
    (id, name, name_en, price, image, description, description_en, category,
     is_best_seller, stock, warranty_months, status, created_at, updated_at)
WITH RECURSIVE product_numbers AS (
    SELECT 1 AS id
    UNION ALL SELECT id + 1 FROM product_numbers WHERE id < 120
), catalog AS (
    SELECT
        id,
        CASE
            WHEN id <= 20 THEN 'Dây chuyền'
            WHEN id <= 40 THEN 'Bông tai'
            WHEN id <= 60 THEN 'Vòng tay'
            WHEN id <= 90 THEN 'Nhẫn'
            ELSE 'Lắc tay'
        END AS category,
        CASE
            WHEN id <= 20 THEN ELT(MOD(id - 1, 10) + 1, 'trái tim CZ', 'giọt nước Moissanite', 'cỏ bốn lá CZ', 'nơ ngọc trai', 'solitaire kim cương lab-grown', 'hoa năm cánh CZ', 'trăng khuyết Moissanite', 'vô cực CZ', 'đồng xu tia nắng', 'halo Moissanite')
            WHEN id <= 40 THEN ELT(MOD(id - 21, 10) + 1, 'nụ trái tim CZ', 'solitaire Moissanite', 'hoa bốn cánh CZ', 'khoen đính đá', 'thả ngọc trai', 'cỏ bốn lá CZ', 'lá cong CZ', 'oval kim cương lab-grown', 'giọt nước Moissanite', 'nụ ngọc trai')
            WHEN id <= 60 THEN ELT(MOD(id - 41, 10) + 1, 'kiềng trái tim CZ', 'charm cỏ bốn lá', 'kiềng ngọc trai', 'mắt xích CZ', 'charm hoa năm cánh', 'kiềng Moissanite', 'charm bướm', 'kiềng sao trăng', 'vô cực CZ', 'đôi Moissanite')
            WHEN id <= 90 THEN ELT(MOD(id - 61, 10) + 1, 'solitaire Moissanite', 'halo CZ', 'trái tim đính đá', 'cỏ bốn lá', 'giọt nước Moissanite', 'nơ thanh lịch', 'hoa năm cánh', 'vương miện CZ', 'oval kim cương lab-grown', 'vô cực đính đá')
            ELSE ELT(MOD(id - 91, 10) + 1, 'charm trái tim CZ', 'mắt xích thanh lịch', 'ngọc trai', 'hoa năm cánh', 'vô cực CZ', 'bướm đính đá', 'ngôi sao Moissanite', 'cỏ bốn lá', 'kiềng đôi', 'giọt nước CZ')
        END AS design,
        CASE MOD(id, 3) WHEN 0 THEN 'vàng hồng 14K' WHEN 1 THEN 'vàng vàng 14K' ELSE 'vàng trắng 18K' END AS material,
        2950000 + MOD(id * 487000, 8200000) AS price,
        12 + MOD(id * 7, 69) AS stock,
        CASE WHEN MOD(id, 5) IN (0, 1) THEN 1 ELSE 0 END AS is_best_seller
    FROM product_numbers
)
SELECT
    id,
    CONCAT(category, ' ', design, ' ', material),
    CONCAT('DC Jewelry ', CASE category WHEN 'Dây chuyền' THEN 'Necklace' WHEN 'Bông tai' THEN 'Earrings' WHEN 'Vòng tay' THEN 'Bangle' WHEN 'Nhẫn' THEN 'Ring' ELSE 'Bracelet' END, ' ', LPAD(id, 3, '0')),
    price,
    CONCAT('products/product-', LPAD(id, 2, '0'), '.jpg'),
    CONCAT('Thiết kế ', category, ' ', design, ' ', material, ', hoàn thiện tinh tế, phù hợp đeo hằng ngày và làm quà tặng. Sản phẩm đi kèm hộp trang sức DC Jewelry và chính sách bảo hành 12 tháng.'),
    CONCAT('A refined ', LOWER(CASE category WHEN 'Dây chuyền' THEN 'necklace' WHEN 'Bông tai' THEN 'earring' WHEN 'Vòng tay' THEN 'bangle' WHEN 'Nhẫn' THEN 'ring' ELSE 'bracelet' END), ' crafted for everyday elegance and meaningful gifting.'),
    category, is_best_seller, stock, 12, 'active', DATE_SUB(@seed_now, INTERVAL (121 - id) DAY), @seed_now
FROM catalog
ON DUPLICATE KEY UPDATE
    name = VALUES(name), name_en = VALUES(name_en), price = VALUES(price), image = VALUES(image),
    description = VALUES(description), description_en = VALUES(description_en), category = VALUES(category),
    is_best_seller = VALUES(is_best_seller), stock = VALUES(stock), warranty_months = VALUES(warranty_months),
    status = VALUES(status), updated_at = VALUES(updated_at);

-- Ba bien the co the ban cho moi san pham. SKU unique nen import lai an toan.
INSERT INTO product_variants
    (product_id, sku, size, length, gold_type, price, stock, is_active, sort_order, created_at, updated_at)
SELECT
    p.id,
    CONCAT('DCJ-', LPAD(p.id, 3, '0'), '-V', variants.variant_no),
    CASE WHEN p.category = 'Nhẫn' THEN ELT(variants.variant_no, '10', '12', '14')
         WHEN p.category = 'Bông tai' THEN ELT(variants.variant_no, 'Nhỏ', 'Vừa', 'Lớn') ELSE NULL END,
    CASE WHEN p.category = 'Dây chuyền' THEN ELT(variants.variant_no, '40 cm', '45 cm', '50 cm')
         WHEN p.category IN ('Vòng tay', 'Lắc tay') THEN ELT(variants.variant_no, '15 cm', '17 cm', '19 cm') ELSE NULL END,
    CASE MOD(p.id, 3) WHEN 0 THEN 'Vàng hồng 14K' WHEN 1 THEN 'Vàng vàng 14K' ELSE 'Vàng trắng 18K' END,
    ROUND(p.price * ELT(variants.variant_no, 1.00, 1.08, 1.15) / 1000) * 1000,
    GREATEST(1, FLOOR(p.stock * ELT(variants.variant_no, 0.40, 0.35, 0.25))),
    1, variants.variant_no - 1, @seed_now, @seed_now
FROM products p
CROSS JOIN (SELECT 1 AS variant_no UNION ALL SELECT 2 UNION ALL SELECT 3) variants
WHERE p.id BETWEEN 1 AND 120
ON DUPLICATE KEY UPDATE
    size = VALUES(size), length = VALUES(length), gold_type = VALUES(gold_type), price = VALUES(price),
    stock = VALUES(stock), is_active = VALUES(is_active), sort_order = VALUES(sort_order), updated_at = VALUES(updated_at);

INSERT INTO coupons
    (code, name, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount,
     usage_limit, usage_count, starts_at, expires_at, is_active, created_at, updated_at)
VALUES
    ('WELCOME10', 'Ưu đãi khách hàng mới', 'Giảm 10% cho đơn hàng từ 1.000.000 đ.', 'percentage', 10, 1000000, 500000, 500, 0, @seed_now, DATE_ADD(@seed_now, INTERVAL 1 YEAR), 1, @seed_now, @seed_now),
    ('DCJ200K', 'Ưu đãi trang sức', 'Giảm trực tiếp 200.000 đ cho đơn từ 3.000.000 đ.', 'fixed', 200000, 3000000, NULL, 250, 0, @seed_now, DATE_ADD(@seed_now, INTERVAL 1 YEAR), 1, @seed_now, @seed_now),
    ('VIP15', 'Đặc quyền khách hàng VIP', 'Giảm 15% cho đơn từ 8.000.000 đ.', 'percentage', 15, 8000000, 1500000, 100, 0, @seed_now, DATE_ADD(@seed_now, INTERVAL 1 YEAR), 1, @seed_now, @seed_now)
ON DUPLICATE KEY UPDATE
    name = VALUES(name), description = VALUES(description), discount_type = VALUES(discount_type), discount_value = VALUES(discount_value),
    minimum_order_amount = VALUES(minimum_order_amount), maximum_discount_amount = VALUES(maximum_discount_amount), usage_limit = VALUES(usage_limit),
    starts_at = VALUES(starts_at), expires_at = VALUES(expires_at), is_active = VALUES(is_active), updated_at = VALUES(updated_at);

-- Gia hien thi va ton kho tong lay tu bien the.
UPDATE products p
JOIN (SELECT product_id, MIN(price) AS min_price, SUM(stock) AS total_stock FROM product_variants WHERE is_active = 1 AND product_id BETWEEN 1 AND 120 GROUP BY product_id) v ON v.product_id = p.id
SET p.price = v.min_price, p.stock = v.total_stock, p.updated_at = @seed_now;
