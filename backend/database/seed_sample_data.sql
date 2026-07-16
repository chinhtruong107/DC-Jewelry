-- Sample data for Bloom shop.
-- Target database: MySQL 8 / utf8mb4.
-- Default sample user password: password

SET NAMES utf8mb4;
SET @seed_now = NOW();

START TRANSACTION;

-- Users must be inserted before orders, favorites, and reviews.
INSERT INTO users (
    name,
    email,
    phone,
    address,
    email_verified_at,
    password,
    remember_token,
    created_at,
    updated_at
) VALUES
    ('Nguyễn Minh Anh', 'anh.nguyen@example.com', '0901000001', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', @seed_now, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, DATE_SUB(@seed_now, INTERVAL 35 DAY), @seed_now),
    ('Trần Quốc Bảo', 'bao.tran@example.com', '0901000002', '45 Lê Lợi, Quận Hải Châu, Đà Nẵng', @seed_now, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, DATE_SUB(@seed_now, INTERVAL 30 DAY), @seed_now),
    ('Lê Phương Chi', 'chi.le@example.com', '0901000003', '78 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', @seed_now, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, DATE_SUB(@seed_now, INTERVAL 24 DAY), @seed_now),
    ('Phạm Gia Dũng', 'dung.pham@example.com', '0901000004', '23 Trần Phú, Nha Trang, Khánh Hòa', @seed_now, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, DATE_SUB(@seed_now, INTERVAL 18 DAY), @seed_now),
    ('Hoàng Thu Hạnh', 'hanh.hoang@example.com', '0901000005', '9 Phan Đình Phùng, Đà Lạt, Lâm Đồng', @seed_now, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, DATE_SUB(@seed_now, INTERVAL 12 DAY), @seed_now),
    ('Vũ Minh Giang', 'giang.vu@example.com', '0901000006', '101 Cầu Giấy, Hà Nội', @seed_now, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, DATE_SUB(@seed_now, INTERVAL 7 DAY), @seed_now)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    phone = VALUES(phone),
    address = VALUES(address),
    email_verified_at = VALUES(email_verified_at),
    password = VALUES(password),
    updated_at = VALUES(updated_at);

-- Admin account for the database-backed admin login.
INSERT INTO users (
    name,
    email,
    phone,
    address,
    email_verified_at,
    password,
    role,
    remember_token,
    created_at,
    updated_at
) VALUES (
    'Admin',
    'admin@bloom.local',
    NULL,
    NULL,
    @seed_now,
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    NULL,
    DATE_SUB(@seed_now, INTERVAL 40 DAY),
    @seed_now
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = VALUES(role),
    email_verified_at = VALUES(email_verified_at),
    password = VALUES(password),
    updated_at = VALUES(updated_at);

SET @user_anh = (SELECT id FROM users WHERE email = 'anh.nguyen@example.com');
SET @user_bao = (SELECT id FROM users WHERE email = 'bao.tran@example.com');
SET @user_chi = (SELECT id FROM users WHERE email = 'chi.le@example.com');
SET @user_dung = (SELECT id FROM users WHERE email = 'dung.pham@example.com');
SET @user_hanh = (SELECT id FROM users WHERE email = 'hanh.hoang@example.com');
SET @user_giang = (SELECT id FROM users WHERE email = 'giang.vu@example.com');

-- Products use fixed ids because the app already maps local images by product-XX.jpg.
INSERT INTO products (
    id,
    name,
    price,
    image,
    description,
    category,
    is_best_seller,
    stock,
    status,
    created_at,
    updated_at
) VALUES
    (1, 'Kính râm Aviator Classic', 2047000, 'products/product-01.jpg', 'Kính râm kiểu phi công cổ điển, tròng kính chống tia UV phù hợp đi nắng hằng ngày.', 'Mắt kính', 1, 96, 'active', DATE_SUB(@seed_now, INTERVAL 60 DAY), @seed_now),
    (2, 'Kính mát Oversized Grace', 1817000, 'products/product-02.jpg', 'Kính mát bản lớn, tạo vẻ thanh lịch và che phủ tốt khi di chuyển ngoài trời.', 'Mắt kính', 0, 97, 'active', DATE_SUB(@seed_now, INTERVAL 59 DAY), @seed_now),
    (3, 'Kính thể thao Polarized', 2967000, 'products/product-03.jpg', 'Tròng kính phân cực giảm chói, phù hợp chạy bộ, đạp xe và hoạt động ngoài trời.', 'Mắt kính', 1, 93, 'active', DATE_SUB(@seed_now, INTERVAL 58 DAY), @seed_now),
    (4, 'Kính râm nữ Cat-Eye', 1955000, 'products/product-04.jpg', 'Thiết kế mắt mèo sắc nét, nhẹ mặt và dễ phối với trang phục hiện đại.', 'Mắt kính', 0, 88, 'active', DATE_SUB(@seed_now, INTERVAL 57 DAY), @seed_now),
    (5, 'Gọng kính tròn Retro', 1127000, 'products/product-05.jpg', 'Gọng tròn phong cách hoài cổ, hợp khuôn mặt nhỏ và trung bình.', 'Gọng kính', 1, 90, 'active', DATE_SUB(@seed_now, INTERVAL 56 DAY), @seed_now),
    (6, 'Gọng kính Titanium Pro', 2737000, 'products/product-06.jpg', 'Chất liệu titanium nhẹ, bền và chống gỉ tốt cho nhu cầu đeo lâu.', 'Gọng kính', 0, 82, 'active', DATE_SUB(@seed_now, INTERVAL 55 DAY), @seed_now),
    (7, 'Gọng kính TR90 Flex', 805000, 'products/product-07.jpg', 'Gọng nhựa TR90 dẻo nhẹ, ôm mặt và ít gây đau sống mũi.', 'Gọng kính', 1, 75, 'active', DATE_SUB(@seed_now, INTERVAL 54 DAY), @seed_now),
    (8, 'Gọng kính kim loại Basic', 1035000, 'products/product-08.jpg', 'Thiết kế kim loại tối giản, phù hợp dùng đi học, đi làm mỗi ngày.', 'Gọng kính', 0, 84, 'active', DATE_SUB(@seed_now, INTERVAL 53 DAY), @seed_now),
    (9, 'Hộp đựng kính da cao cấp', 575000, 'products/product-09.jpg', 'Hộp đựng kính bọc da, lót mềm giúp hạn chế trầy xước khi mang theo.', 'Phụ kiện', 1, 70, 'active', DATE_SUB(@seed_now, INTERVAL 52 DAY), @seed_now),
    (10, 'Kính chống ánh sáng xanh', 1495000, 'products/product-10.jpg', 'Tròng lọc ánh sáng xanh hỗ trợ mắt khi làm việc lâu với máy tính.', 'Phụ kiện', 0, 66, 'active', DATE_SUB(@seed_now, INTERVAL 51 DAY), @seed_now),
    (11, 'Bộ lau kính Nano Care', 345000, 'products/product-11.jpg', 'Dung dịch lau kính và khăn nano mềm, làm sạch nhanh mà không để lại vệt.', 'Phụ kiện', 0, 42, 'active', DATE_SUB(@seed_now, INTERVAL 50 DAY), @seed_now),
    (12, 'Dây đeo kính Vintage', 276000, 'products/product-12.jpg', 'Dây đeo kính phong cách vintage, chắc chắn và tiện khi di chuyển.', 'Phụ kiện', 0, 58, 'active', DATE_SUB(@seed_now, INTERVAL 49 DAY), @seed_now),
    (13, 'Kính mát Wayfarer Urban', 2369000, 'products/product-13.jpg', 'Dáng Wayfarer hiện đại, dễ đeo và nổi bật trong phong cách thường ngày.', 'Mắt kính', 1, 73, 'active', DATE_SUB(@seed_now, INTERVAL 48 DAY), @seed_now),
    (14, 'Kính râm Clubmaster Noir', 1380000, 'products/product-14.jpg', 'Form Clubmaster cổ điển với phần viền trên đậm, tạo điểm nhấn lịch lãm.', 'Mắt kính', 0, 68, 'active', DATE_SUB(@seed_now, INTERVAL 47 DAY), @seed_now),
    (15, 'Kính mát Oval Seoul', 1058000, 'products/product-15.jpg', 'Kính oval mảnh nhẹ, hợp xu hướng tối giản và phong cách Hàn Quốc.', 'Mắt kính', 0, 61, 'active', DATE_SUB(@seed_now, INTERVAL 46 DAY), @seed_now),
    (16, 'Kính râm Square Amber', 1357000, 'products/product-16.jpg', 'Tròng màu hổ phách dịu mắt, form vuông cân đối và dễ phối đồ.', 'Mắt kính', 0, 55, 'active', DATE_SUB(@seed_now, INTERVAL 45 DAY), @seed_now),
    (17, 'Kính mát Round Havana', 1150000, 'products/product-17.jpg', 'Gọng vân đồi mồi phối tròng tròn, mang cảm giác mềm mại và nghệ thuật.', 'Mắt kính', 1, 49, 'active', DATE_SUB(@seed_now, INTERVAL 44 DAY), @seed_now),
    (18, 'Kính râm Minimal Slate', 529000, 'products/product-18.jpg', 'Thiết kế tối giản, trọng lượng nhẹ, phù hợp người thích phụ kiện gọn gàng.', 'Mắt kính', 0, 8, 'active', DATE_SUB(@seed_now, INTERVAL 43 DAY), @seed_now),
    (19, 'Kính mát Gradient Rose', 1219000, 'products/product-19.jpg', 'Tròng chuyển màu hồng nhẹ, tạo diện mạo mềm mại và nổi bật.', 'Mắt kính', 0, 5, 'active', DATE_SUB(@seed_now, INTERVAL 42 DAY), @seed_now),
    (20, 'Kính râm Pilot Steel', 2714000, 'products/product-20.jpg', 'Gọng kim loại chắc chắn, tròng lớn chống nắng tốt cho chuyến đi xa.', 'Mắt kính', 1, 40, 'active', DATE_SUB(@seed_now, INTERVAL 41 DAY), @seed_now),
    (21, 'Kính mát Sport Edge', 1242000, 'products/product-21.jpg', 'Dáng thể thao ôm mặt, hạn chế trượt khi vận động ngoài trời.', 'Mắt kính', 0, 38, 'active', DATE_SUB(@seed_now, INTERVAL 40 DAY), @seed_now),
    (22, 'Kính râm Luxe Brown', 2231000, 'products/product-22.jpg', 'Tông nâu sang trọng, hợp phong cách công sở và du lịch.', 'Mắt kính', 0, 34, 'active', DATE_SUB(@seed_now, INTERVAL 39 DAY), @seed_now),
    (23, 'Kính mát Clear Sky', 1679000, 'products/product-23.jpg', 'Tròng sáng dịu, thiết kế trong trẻo cho phong cách trẻ trung.', 'Mắt kính', 0, 30, 'active', DATE_SUB(@seed_now, INTERVAL 38 DAY), @seed_now),
    (24, 'Kính râm Fashion Metro', 2277000, 'products/product-24.jpg', 'Form thời trang thành thị, viền gọn và tạo điểm nhấn mạnh cho khuôn mặt.', 'Mắt kính', 1, 26, 'active', DATE_SUB(@seed_now, INTERVAL 37 DAY), @seed_now)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    price = VALUES(price),
    image = VALUES(image),
    description = VALUES(description),
    category = VALUES(category),
    is_best_seller = VALUES(is_best_seller),
    stock = VALUES(stock),
    status = VALUES(status),
    updated_at = VALUES(updated_at);

-- Orders follow the same calculation as OrderController:
-- subtotal = sum(price * quantity)
-- shipping_fee = 0 if subtotal > 500000 else 30000
-- tax = round(subtotal * 0.08)
-- discount = round(subtotal * 0.05) for logged-in users only
INSERT INTO orders (
    order_number,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    recipient_name,
    recipient_phone,
    recipient_address,
    status,
    payment_method,
    payment_status,
    subtotal,
    shipping_fee,
    tax,
    discount,
    total,
    note,
    created_at,
    updated_at
) VALUES
    ('DH-SEED-0001', @user_anh, 'Nguyễn Minh Anh', 'anh.nguyen@example.com', '0901000001', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', NULL, NULL, NULL, 'completed', 'cod', 'paid', 3197000, 0, 255760, 159850, 3292910, 'Giao giờ hành chính.', DATE_SUB(@seed_now, INTERVAL 20 DAY), DATE_SUB(@seed_now, INTERVAL 18 DAY)),
    ('DH-SEED-0002', @user_bao, 'Trần Quốc Bảo', 'bao.tran@example.com', '0901000002', '45 Lê Lợi, Quận Hải Châu, Đà Nẵng', 'Trần Quốc Bảo', '0901000002', '45 Lê Lợi, Quận Hải Châu, Đà Nẵng', 'shipping', 'bank_transfer', 'unpaid', 3312000, 0, 264960, 165600, 3411360, 'Gọi trước khi giao.', DATE_SUB(@seed_now, INTERVAL 15 DAY), DATE_SUB(@seed_now, INTERVAL 1 DAY)),
    ('DH-SEED-0003', @user_chi, 'Lê Phương Chi', 'chi.le@example.com', '0901000003', '78 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', NULL, NULL, NULL, 'processing', 'cod', 'unpaid', 1403000, 0, 112240, 70150, 1445090, NULL, DATE_SUB(@seed_now, INTERVAL 11 DAY), DATE_SUB(@seed_now, INTERVAL 10 DAY)),
    ('DH-SEED-0004', @user_dung, 'Phạm Gia Dũng', 'dung.pham@example.com', '0901000004', '23 Trần Phú, Nha Trang, Khánh Hòa', NULL, NULL, NULL, 'pending', 'cod', 'unpaid', 3105000, 0, 248400, 155250, 3198150, 'Khách đang chờ xác nhận.', DATE_SUB(@seed_now, INTERVAL 3 DAY), DATE_SUB(@seed_now, INTERVAL 3 DAY)),
    ('DH-SEED-0005', NULL, 'Mai Thanh Tú', 'tu.mai@example.com', '0901000105', '17 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh', 'Mai Thanh Tú', '0901000105', '17 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh', 'completed', 'momo', 'paid', 3427000, 0, 274160, 0, 3701160, 'Đơn khách vãng lai.', DATE_SUB(@seed_now, INTERVAL 9 DAY), DATE_SUB(@seed_now, INTERVAL 7 DAY)),
    ('DH-SEED-0006', @user_hanh, 'Hoàng Thu Hạnh', 'hanh.hoang@example.com', '0901000005', '9 Phan Đình Phùng, Đà Lạt, Lâm Đồng', NULL, NULL, NULL, 'cancelled', 'cod', 'refunded', 1748000, 0, 139840, 87400, 1800440, 'Khách hủy do đổi sản phẩm.', DATE_SUB(@seed_now, INTERVAL 8 DAY), DATE_SUB(@seed_now, INTERVAL 6 DAY)),
    ('DH-SEED-0007', @user_anh, 'Nguyễn Minh Anh', 'anh.nguyen@example.com', '0901000001', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', 'Nguyễn Minh Anh', '0901000001', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', 'completed', 'card', 'paid', 3749000, 0, 299920, 187450, 3861470, NULL, DATE_SUB(@seed_now, INTERVAL 5 DAY), DATE_SUB(@seed_now, INTERVAL 4 DAY)),
    ('DH-SEED-0008', @user_giang, 'Vũ Minh Giang', 'giang.vu@example.com', '0901000006', '101 Cầu Giấy, Hà Nội', NULL, NULL, NULL, 'completed', 'cod', 'paid', 5129000, 0, 410320, 256450, 5282870, 'Khách mua combo kính và phụ kiện.', DATE_SUB(@seed_now, INTERVAL 4 DAY), DATE_SUB(@seed_now, INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE
    user_id = VALUES(user_id),
    customer_name = VALUES(customer_name),
    customer_email = VALUES(customer_email),
    customer_phone = VALUES(customer_phone),
    customer_address = VALUES(customer_address),
    recipient_name = VALUES(recipient_name),
    recipient_phone = VALUES(recipient_phone),
    recipient_address = VALUES(recipient_address),
    status = VALUES(status),
    payment_method = VALUES(payment_method),
    payment_status = VALUES(payment_status),
    subtotal = VALUES(subtotal),
    shipping_fee = VALUES(shipping_fee),
    tax = VALUES(tax),
    discount = VALUES(discount),
    total = VALUES(total),
    note = VALUES(note),
    updated_at = VALUES(updated_at);

SET @order_1 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0001');
SET @order_2 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0002');
SET @order_3 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0003');
SET @order_4 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0004');
SET @order_5 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0005');
SET @order_6 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0006');
SET @order_7 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0007');
SET @order_8 = (SELECT id FROM orders WHERE order_number = 'DH-SEED-0008');

-- Order item ids use the 91000 range so reviews can reference stable rows.
INSERT INTO order_items (
    id,
    order_id,
    product_id,
    product_name,
    product_image,
    price,
    quantity,
    line_total,
    created_at,
    updated_at
) VALUES
    (91001, @order_1, 1, 'Kính râm Aviator Classic', 'products/product-01.jpg', 2047000, 1, 2047000, DATE_SUB(@seed_now, INTERVAL 20 DAY), DATE_SUB(@seed_now, INTERVAL 18 DAY)),
    (91002, @order_1, 9, 'Hộp đựng kính da cao cấp', 'products/product-09.jpg', 575000, 2, 1150000, DATE_SUB(@seed_now, INTERVAL 20 DAY), DATE_SUB(@seed_now, INTERVAL 18 DAY)),
    (91003, @order_2, 3, 'Kính thể thao Polarized', 'products/product-03.jpg', 2967000, 1, 2967000, DATE_SUB(@seed_now, INTERVAL 15 DAY), DATE_SUB(@seed_now, INTERVAL 1 DAY)),
    (91004, @order_2, 11, 'Bộ lau kính Nano Care', 'products/product-11.jpg', 345000, 1, 345000, DATE_SUB(@seed_now, INTERVAL 15 DAY), DATE_SUB(@seed_now, INTERVAL 1 DAY)),
    (91005, @order_3, 5, 'Gọng kính tròn Retro', 'products/product-05.jpg', 1127000, 1, 1127000, DATE_SUB(@seed_now, INTERVAL 11 DAY), DATE_SUB(@seed_now, INTERVAL 10 DAY)),
    (91006, @order_3, 12, 'Dây đeo kính Vintage', 'products/product-12.jpg', 276000, 1, 276000, DATE_SUB(@seed_now, INTERVAL 11 DAY), DATE_SUB(@seed_now, INTERVAL 10 DAY)),
    (91007, @order_4, 7, 'Gọng kính TR90 Flex', 'products/product-07.jpg', 805000, 2, 1610000, DATE_SUB(@seed_now, INTERVAL 3 DAY), DATE_SUB(@seed_now, INTERVAL 3 DAY)),
    (91008, @order_4, 10, 'Kính chống ánh sáng xanh', 'products/product-10.jpg', 1495000, 1, 1495000, DATE_SUB(@seed_now, INTERVAL 3 DAY), DATE_SUB(@seed_now, INTERVAL 3 DAY)),
    (91009, @order_5, 13, 'Kính mát Wayfarer Urban', 'products/product-13.jpg', 2369000, 1, 2369000, DATE_SUB(@seed_now, INTERVAL 9 DAY), DATE_SUB(@seed_now, INTERVAL 7 DAY)),
    (91010, @order_5, 15, 'Kính mát Oval Seoul', 'products/product-15.jpg', 1058000, 1, 1058000, DATE_SUB(@seed_now, INTERVAL 9 DAY), DATE_SUB(@seed_now, INTERVAL 7 DAY)),
    (91011, @order_6, 18, 'Kính râm Minimal Slate', 'products/product-18.jpg', 529000, 1, 529000, DATE_SUB(@seed_now, INTERVAL 8 DAY), DATE_SUB(@seed_now, INTERVAL 6 DAY)),
    (91012, @order_6, 19, 'Kính mát Gradient Rose', 'products/product-19.jpg', 1219000, 1, 1219000, DATE_SUB(@seed_now, INTERVAL 8 DAY), DATE_SUB(@seed_now, INTERVAL 6 DAY)),
    (91013, @order_7, 20, 'Kính râm Pilot Steel', 'products/product-20.jpg', 2714000, 1, 2714000, DATE_SUB(@seed_now, INTERVAL 5 DAY), DATE_SUB(@seed_now, INTERVAL 4 DAY)),
    (91014, @order_7, 11, 'Bộ lau kính Nano Care', 'products/product-11.jpg', 345000, 3, 1035000, DATE_SUB(@seed_now, INTERVAL 5 DAY), DATE_SUB(@seed_now, INTERVAL 4 DAY)),
    (91015, @order_8, 2, 'Kính mát Oversized Grace', 'products/product-02.jpg', 1817000, 1, 1817000, DATE_SUB(@seed_now, INTERVAL 4 DAY), DATE_SUB(@seed_now, INTERVAL 2 DAY)),
    (91016, @order_8, 6, 'Gọng kính Titanium Pro', 'products/product-06.jpg', 2737000, 1, 2737000, DATE_SUB(@seed_now, INTERVAL 4 DAY), DATE_SUB(@seed_now, INTERVAL 2 DAY)),
    (91017, @order_8, 9, 'Hộp đựng kính da cao cấp', 'products/product-09.jpg', 575000, 1, 575000, DATE_SUB(@seed_now, INTERVAL 4 DAY), DATE_SUB(@seed_now, INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE
    order_id = VALUES(order_id),
    product_id = VALUES(product_id),
    product_name = VALUES(product_name),
    product_image = VALUES(product_image),
    price = VALUES(price),
    quantity = VALUES(quantity),
    line_total = VALUES(line_total),
    updated_at = VALUES(updated_at);

-- Favorites respect the unique(user_id, product_id) constraint.
INSERT IGNORE INTO favorite_products (user_id, product_id, created_at, updated_at) VALUES
    (@user_anh, 1, DATE_SUB(@seed_now, INTERVAL 19 DAY), @seed_now),
    (@user_anh, 13, DATE_SUB(@seed_now, INTERVAL 19 DAY), @seed_now),
    (@user_anh, 20, DATE_SUB(@seed_now, INTERVAL 18 DAY), @seed_now),
    (@user_bao, 3, DATE_SUB(@seed_now, INTERVAL 14 DAY), @seed_now),
    (@user_bao, 7, DATE_SUB(@seed_now, INTERVAL 14 DAY), @seed_now),
    (@user_chi, 5, DATE_SUB(@seed_now, INTERVAL 10 DAY), @seed_now),
    (@user_chi, 12, DATE_SUB(@seed_now, INTERVAL 10 DAY), @seed_now),
    (@user_dung, 10, DATE_SUB(@seed_now, INTERVAL 3 DAY), @seed_now),
    (@user_hanh, 18, DATE_SUB(@seed_now, INTERVAL 6 DAY), @seed_now),
    (@user_giang, 2, DATE_SUB(@seed_now, INTERVAL 2 DAY), @seed_now),
    (@user_giang, 6, DATE_SUB(@seed_now, INTERVAL 2 DAY), @seed_now),
    (@user_giang, 9, DATE_SUB(@seed_now, INTERVAL 2 DAY), @seed_now);

-- Reviews are only attached to completed orders with matching user/order item/product.
INSERT INTO product_reviews (
    product_id,
    user_id,
    order_id,
    order_item_id,
    rating,
    content,
    created_at,
    updated_at
) VALUES
    (1, @user_anh, @order_1, 91001, 5, 'Kính rất chắc tay, đeo ngoài trời dịu mắt và hợp khuôn mặt.', DATE_SUB(@seed_now, INTERVAL 17 DAY), DATE_SUB(@seed_now, INTERVAL 17 DAY)),
    (9, @user_anh, @order_1, 91002, 4, 'Hộp đẹp, lớp lót mềm, đóng mở chắc chắn.', DATE_SUB(@seed_now, INTERVAL 17 DAY), DATE_SUB(@seed_now, INTERVAL 17 DAY)),
    (20, @user_anh, @order_7, 91013, 5, 'Mẫu pilot nhìn sang, tròng lớn chống nắng tốt.', DATE_SUB(@seed_now, INTERVAL 3 DAY), DATE_SUB(@seed_now, INTERVAL 3 DAY)),
    (2, @user_giang, @order_8, 91015, 4, 'Form lớn đúng ý, hơi nổi bật nhưng rất thời trang.', DATE_SUB(@seed_now, INTERVAL 1 DAY), DATE_SUB(@seed_now, INTERVAL 1 DAY)),
    (6, @user_giang, @order_8, 91016, 5, 'Gọng titanium nhẹ, đeo cả ngày không bị cấn.', DATE_SUB(@seed_now, INTERVAL 1 DAY), DATE_SUB(@seed_now, INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE
    order_id = VALUES(order_id),
    order_item_id = VALUES(order_item_id),
    rating = VALUES(rating),
    content = VALUES(content),
    updated_at = VALUES(updated_at);

-- Legacy/simple order table that exists in the current migrations.
INSERT INTO don_hangs (
    id,
    ten_khach_hang,
    dia_chi,
    so_dien_thoai,
    created_at,
    updated_at
) VALUES
    (92001, 'Nguyễn Minh Anh', '12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', '0901000001', DATE_SUB(@seed_now, INTERVAL 20 DAY), @seed_now),
    (92002, 'Trần Quốc Bảo', '45 Lê Lợi, Quận Hải Châu, Đà Nẵng', '0901000002', DATE_SUB(@seed_now, INTERVAL 15 DAY), @seed_now),
    (92003, 'Lê Phương Chi', '78 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', '0901000003', DATE_SUB(@seed_now, INTERVAL 11 DAY), @seed_now),
    (92004, 'Mai Thanh Tú', '17 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh', '0901000105', DATE_SUB(@seed_now, INTERVAL 9 DAY), @seed_now)
ON DUPLICATE KEY UPDATE
    ten_khach_hang = VALUES(ten_khach_hang),
    dia_chi = VALUES(dia_chi),
    so_dien_thoai = VALUES(so_dien_thoai),
    updated_at = VALUES(updated_at);

COMMIT;
