-- Fake demo data for Bloom / VANHPERFUME.
-- MySQL 8+, utf8mb4.
-- Import by hand after running migrations.
-- Demo passwords for generated users/admin: password

SET NAMES utf8mb4;
SET @seed_now = NOW();
SET @demo_password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

START TRANSACTION;

CREATE TEMPORARY TABLE IF NOT EXISTS tmp_demo_numbers (
  n INT PRIMARY KEY
) ENGINE=MEMORY;

TRUNCATE TABLE tmp_demo_numbers;

INSERT INTO tmp_demo_numbers (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
  (21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
  (31),(32),(33),(34),(35),(36),(37),(38),(39),(40),
  (41),(42),(43),(44),(45),(46),(47),(48),(49),(50),
  (51),(52),(53),(54),(55),(56),(57),(58),(59),(60);

-- Admin account.
INSERT INTO users (
  name, email, phone, address, address_detail, province_code, province_name, ward_code, ward_name,
  email_verified_at, password, role, must_change_password, remember_token, created_at, updated_at
) VALUES (
  'Bloom Admin',
  'admin@bloom.local',
  '0900000000',
  'Văn phòng Bloom, Quận 1, TP. Hồ Chí Minh',
  'Tầng 5, 28 Đồng Khởi',
  '79',
  'Thành phố Hồ Chí Minh',
  '26734',
  'Phường Bến Nghé',
  @seed_now,
  @demo_password,
  'admin',
  0,
  NULL,
  DATE_SUB(@seed_now, INTERVAL 90 DAY),
  @seed_now
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  phone = VALUES(phone),
  address = VALUES(address),
  address_detail = VALUES(address_detail),
  province_code = VALUES(province_code),
  province_name = VALUES(province_name),
  ward_code = VALUES(ward_code),
  ward_name = VALUES(ward_name),
  email_verified_at = VALUES(email_verified_at),
  password = VALUES(password),
  role = VALUES(role),
  must_change_password = VALUES(must_change_password),
  updated_at = VALUES(updated_at);

-- 30 customer accounts.
INSERT INTO users (
  name, email, phone, address, address_detail, province_code, province_name, ward_code, ward_name,
  email_verified_at, password, role, must_change_password, remember_token, created_at, updated_at
)
SELECT
  CASE n
    WHEN 1 THEN 'Nguyễn Minh Anh'
    WHEN 2 THEN 'Trần Quốc Bảo'
    WHEN 3 THEN 'Lê Phương Chi'
    WHEN 4 THEN 'Phạm Gia Dũng'
    WHEN 5 THEN 'Hoàng Thu Hạnh'
    WHEN 6 THEN 'Vũ Minh Giang'
    WHEN 7 THEN 'Đặng Khánh Linh'
    WHEN 8 THEN 'Bùi Nhật Nam'
    WHEN 9 THEN 'Đỗ Hải Yến'
    WHEN 10 THEN 'Tạ Quang Huy'
    WHEN 11 THEN 'Mai Thanh Tú'
    WHEN 12 THEN 'Phan Ngọc Mai'
    WHEN 13 THEN 'Lý Tuấn Kiệt'
    WHEN 14 THEN 'Cao Bảo Ngọc'
    WHEN 15 THEN 'Hồ Đức Long'
    WHEN 16 THEN 'Trương Hà My'
    WHEN 17 THEN 'Ngô Gia Bảo'
    WHEN 18 THEN 'Đinh Thảo Nhi'
    WHEN 19 THEN 'Võ Anh Khoa'
    WHEN 20 THEN 'Dương Bích Ngân'
    WHEN 21 THEN 'Lâm Quốc Thịnh'
    WHEN 22 THEN 'Phùng Diệu Linh'
    WHEN 23 THEN 'Huỳnh Minh Quân'
    WHEN 24 THEN 'Châu Kim Oanh'
    WHEN 25 THEN 'Đào Nhật Minh'
    WHEN 26 THEN 'Nguyễn Hoài An'
    WHEN 27 THEN 'Trần Bảo Trâm'
    WHEN 28 THEN 'Lê Hoàng Phúc'
    WHEN 29 THEN 'Phạm Hải Đăng'
    ELSE 'Vũ Ngọc Ánh'
  END AS name,
  CONCAT('khach', LPAD(n, 2, '0'), '@bloom.test') AS email,
  CONCAT('09', LPAD(10000000 + n * 1379, 8, '0')) AS phone,
  CASE n % 6
    WHEN 0 THEN '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
    WHEN 1 THEN '45 Lê Lợi, Quận Hải Châu, Đà Nẵng'
    WHEN 2 THEN '78 Hai Bà Trưng, Hoàn Kiếm, Hà Nội'
    WHEN 3 THEN '23 Trần Phú, Nha Trang, Khánh Hòa'
    WHEN 4 THEN '9 Phan Đình Phùng, Đà Lạt, Lâm Đồng'
    ELSE '101 Cầu Giấy, Hà Nội'
  END AS address,
  CASE n % 6
    WHEN 0 THEN 'Căn hộ A1208'
    WHEN 1 THEN 'Nhà riêng, gần cầu Rồng'
    WHEN 2 THEN 'Tầng 3, tòa nhà Indochina'
    WHEN 3 THEN 'Gần quảng trường biển'
    WHEN 4 THEN 'Biệt thự số 9'
    ELSE 'Tòa C, phòng 808'
  END AS address_detail,
  CASE n % 6 WHEN 0 THEN '79' WHEN 1 THEN '48' WHEN 2 THEN '01' WHEN 3 THEN '56' WHEN 4 THEN '68' ELSE '01' END AS province_code,
  CASE n % 6
    WHEN 0 THEN 'Thành phố Hồ Chí Minh'
    WHEN 1 THEN 'Thành phố Đà Nẵng'
    WHEN 2 THEN 'Thành phố Hà Nội'
    WHEN 3 THEN 'Tỉnh Khánh Hòa'
    WHEN 4 THEN 'Tỉnh Lâm Đồng'
    ELSE 'Thành phố Hà Nội'
  END AS province_name,
  CASE n % 6 WHEN 0 THEN '26734' WHEN 1 THEN '20194' WHEN 2 THEN '00001' WHEN 3 THEN '22531' WHEN 4 THEN '24778' ELSE '00163' END AS ward_code,
  CASE n % 6
    WHEN 0 THEN 'Phường Bến Nghé'
    WHEN 1 THEN 'Phường Hải Châu I'
    WHEN 2 THEN 'Phường Phúc Xá'
    WHEN 3 THEN 'Phường Lộc Thọ'
    WHEN 4 THEN 'Phường 1'
    ELSE 'Phường Dịch Vọng'
  END AS ward_name,
  @seed_now AS email_verified_at,
  @demo_password AS password,
  'customer' AS role,
  0 AS must_change_password,
  NULL AS remember_token,
  DATE_SUB(@seed_now, INTERVAL (80 - n) DAY) AS created_at,
  @seed_now AS updated_at
FROM tmp_demo_numbers
WHERE n <= 30
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  phone = VALUES(phone),
  address = VALUES(address),
  address_detail = VALUES(address_detail),
  province_code = VALUES(province_code),
  province_name = VALUES(province_name),
  ward_code = VALUES(ward_code),
  ward_name = VALUES(ward_name),
  email_verified_at = VALUES(email_verified_at),
  password = VALUES(password),
  role = VALUES(role),
  must_change_password = VALUES(must_change_password),
  updated_at = VALUES(updated_at);

-- 60 perfume products. Image paths match storage/app/public/products/product-XX.jpg.
INSERT INTO products (
  id, name, price, image, description, category, is_best_seller, stock, status, created_at, updated_at
)
SELECT
  n AS id,
  CONCAT(
    CASE n % 12
      WHEN 0 THEN 'Aurora Rose'
      WHEN 1 THEN 'Velvet Iris'
      WHEN 2 THEN 'Jasmine Silk'
      WHEN 3 THEN 'Amber Bloom'
      WHEN 4 THEN 'Noir Cedar'
      WHEN 5 THEN 'Aqua Vetiver'
      WHEN 6 THEN 'Saffron Oud'
      WHEN 7 THEN 'White Tea Neroli'
      WHEN 8 THEN 'Santal Cloud'
      WHEN 9 THEN 'Hinoki Linen'
      WHEN 10 THEN 'Rose Oud Soft'
      ELSE 'Royal Amber'
    END,
    ' Eau de Parfum ',
    CASE n % 4 WHEN 0 THEN '75ml' WHEN 1 THEN '80ml' WHEN 2 THEN '90ml' ELSE '100ml' END
  ) AS name,
  1850000 + ((n * 173000) % 2100000) AS price,
  CONCAT('products/product-', LPAD(n, 2, '0'), '.jpg') AS image,
  CONCAT(
    'Chai nước hoa fullsize nguyên seal. Nhóm hương ',
    CASE n % 12
      WHEN 0 THEN 'hoa hồng, mẫu đơn và xạ hương trắng'
      WHEN 1 THEN 'iris mịn, violet và gỗ đàn hương'
      WHEN 2 THEN 'hoa nhài, bergamot và vanilla dịu'
      WHEN 3 THEN 'hổ phách ấm, hoa trắng và mật ong nhẹ'
      WHEN 4 THEN 'tuyết tùng, tiêu đen và da thuộc sạch'
      WHEN 5 THEN 'vetiver, muối biển và bưởi chùm'
      WHEN 6 THEN 'nghệ tây, trầm hương và nhựa thơm'
      WHEN 7 THEN 'trà trắng, neroli và musk sạch'
      WHEN 8 THEN 'gỗ đàn hương kem, cardamom và iris'
      WHEN 9 THEN 'gỗ hinoki, linen và cam yuzu'
      WHEN 10 THEN 'hoa hồng Thổ Nhĩ Kỳ, oud sạch và hổ phách'
      ELSE 'amber, labdanum và gỗ guaiac'
    END,
    '. Phù hợp làm quà tặng hoặc dùng hằng ngày theo phong cách boutique luxury.'
  ) AS description,
  CASE n % 3 WHEN 0 THEN 'Nước hoa nữ' WHEN 1 THEN 'Nước hoa nam' ELSE 'Unisex' END AS category,
  IF(n IN (1,3,5,8,10,13,14,16,20,23,25,27,30,33,40,45,50,55,60), 1, 0) AS is_best_seller,
  CASE
    WHEN n IN (12,18,24,36,48) THEN 5 + (n % 4)
    WHEN n IN (7,19,31,43,57) THEN 0
    ELSE 18 + ((n * 7) % 82)
  END AS stock,
  CASE WHEN n IN (7,31,57) THEN 'inactive' ELSE 'active' END AS status,
  DATE_SUB(@seed_now, INTERVAL (75 - n) DAY) AS created_at,
  @seed_now AS updated_at
FROM tmp_demo_numbers
WHERE n <= 60
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

-- 45 orders spread across statuses, provinces, and payment methods.
INSERT INTO orders (
  order_number, user_id,
  customer_name, customer_email, customer_phone, customer_address, customer_address_detail,
  customer_province_code, customer_province_name, customer_ward_code, customer_ward_name,
  recipient_name, recipient_phone, recipient_address, recipient_address_detail,
  recipient_province_code, recipient_province_name, recipient_ward_code, recipient_ward_name,
  status, payment_method, payment_status,
  vnpay_transaction_no, vnpay_bank_code, vnpay_response_code, vnpay_transaction_status, vnpay_paid_at,
  subtotal, shipping_fee, tax, discount, total, note, created_at, updated_at
)
SELECT
  CONCAT('BL-DEMO-', LPAD(o.n, 4, '0')) AS order_number,
  u.id AS user_id,
  u.name AS customer_name,
  u.email AS customer_email,
  u.phone AS customer_phone,
  u.address AS customer_address,
  u.address_detail AS customer_address_detail,
  u.province_code AS customer_province_code,
  u.province_name AS customer_province_name,
  u.ward_code AS customer_ward_code,
  u.ward_name AS customer_ward_name,
  IF(o.n % 5 = 0, CONCAT('Người nhận ', LPAD(o.n, 2, '0')), NULL) AS recipient_name,
  IF(o.n % 5 = 0, CONCAT('08', LPAD(70000000 + o.n * 2468, 8, '0')), NULL) AS recipient_phone,
  IF(o.n % 5 = 0, 'Địa chỉ giao thay thế, trung tâm thành phố', NULL) AS recipient_address,
  IF(o.n % 5 = 0, CONCAT('Ghi chú cổng ', o.n), NULL) AS recipient_address_detail,
  IF(o.n % 5 = 0, u.province_code, NULL) AS recipient_province_code,
  IF(o.n % 5 = 0, u.province_name, NULL) AS recipient_province_name,
  IF(o.n % 5 = 0, u.ward_code, NULL) AS recipient_ward_code,
  IF(o.n % 5 = 0, u.ward_name, NULL) AS recipient_ward_name,
  CASE o.n % 6
    WHEN 0 THEN 'completed'
    WHEN 1 THEN 'pending'
    WHEN 2 THEN 'processing'
    WHEN 3 THEN 'shipping'
    WHEN 4 THEN 'completed'
    ELSE 'cancelled'
  END AS status,
  CASE o.n % 4 WHEN 0 THEN 'cod' WHEN 1 THEN 'vnpay' WHEN 2 THEN 'bank_transfer' ELSE 'card' END AS payment_method,
  CASE
    WHEN o.n % 6 IN (0,4) THEN 'paid'
    WHEN o.n % 6 = 5 THEN 'refunded'
    ELSE 'unpaid'
  END AS payment_status,
  IF(o.n % 4 = 1, CONCAT('VNP', DATE_FORMAT(@seed_now, '%Y%m%d'), LPAD(o.n, 6, '0')), NULL) AS vnpay_transaction_no,
  IF(o.n % 4 = 1, CASE o.n % 3 WHEN 0 THEN 'NCB' WHEN 1 THEN 'VCB' ELSE 'TCB' END, NULL) AS vnpay_bank_code,
  IF(o.n % 4 = 1, '00', NULL) AS vnpay_response_code,
  IF(o.n % 4 = 1, '00', NULL) AS vnpay_transaction_status,
  IF(o.n % 4 = 1 AND o.n % 6 IN (0,4), DATE_SUB(@seed_now, INTERVAL (45 - o.n) DAY), NULL) AS vnpay_paid_at,
  (p1.price * (1 + (o.n % 2))) + (p2.price * (1 + ((o.n + 1) % 2))) AS subtotal,
  0 AS shipping_fee,
  ROUND(((p1.price * (1 + (o.n % 2))) + (p2.price * (1 + ((o.n + 1) % 2)))) * 0.08) AS tax,
  ROUND(((p1.price * (1 + (o.n % 2))) + (p2.price * (1 + ((o.n + 1) % 2)))) * 0.05) AS discount,
  (
    (p1.price * (1 + (o.n % 2))) + (p2.price * (1 + ((o.n + 1) % 2))) +
    ROUND(((p1.price * (1 + (o.n % 2))) + (p2.price * (1 + ((o.n + 1) % 2)))) * 0.08) -
    ROUND(((p1.price * (1 + (o.n % 2))) + (p2.price * (1 + ((o.n + 1) % 2)))) * 0.05)
  ) AS total,
  CASE o.n % 5
    WHEN 0 THEN 'Gói quà sang trọng, kèm thiệp.'
    WHEN 1 THEN 'Giao giờ hành chính.'
    WHEN 2 THEN 'Khách cần gọi trước khi giao.'
    WHEN 3 THEN 'Ưu tiên giao buổi tối.'
    ELSE NULL
  END AS note,
  DATE_SUB(@seed_now, INTERVAL (50 - o.n) DAY) AS created_at,
  DATE_SUB(@seed_now, INTERVAL GREATEST(0, 48 - o.n) DAY) AS updated_at
FROM tmp_demo_numbers o
JOIN users u ON u.email = CONCAT('khach', LPAD((((o.n - 1) % 30) + 1), 2, '0'), '@bloom.test')
JOIN products p1 ON p1.id = (((o.n * 3) % 60) + 1)
JOIN products p2 ON p2.id = (((o.n * 7) % 60) + 1)
WHERE o.n <= 45
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  customer_name = VALUES(customer_name),
  customer_email = VALUES(customer_email),
  customer_phone = VALUES(customer_phone),
  customer_address = VALUES(customer_address),
  customer_address_detail = VALUES(customer_address_detail),
  customer_province_code = VALUES(customer_province_code),
  customer_province_name = VALUES(customer_province_name),
  customer_ward_code = VALUES(customer_ward_code),
  customer_ward_name = VALUES(customer_ward_name),
  recipient_name = VALUES(recipient_name),
  recipient_phone = VALUES(recipient_phone),
  recipient_address = VALUES(recipient_address),
  recipient_address_detail = VALUES(recipient_address_detail),
  recipient_province_code = VALUES(recipient_province_code),
  recipient_province_name = VALUES(recipient_province_name),
  recipient_ward_code = VALUES(recipient_ward_code),
  recipient_ward_name = VALUES(recipient_ward_name),
  status = VALUES(status),
  payment_method = VALUES(payment_method),
  payment_status = VALUES(payment_status),
  vnpay_transaction_no = VALUES(vnpay_transaction_no),
  vnpay_bank_code = VALUES(vnpay_bank_code),
  vnpay_response_code = VALUES(vnpay_response_code),
  vnpay_transaction_status = VALUES(vnpay_transaction_status),
  vnpay_paid_at = VALUES(vnpay_paid_at),
  subtotal = VALUES(subtotal),
  shipping_fee = VALUES(shipping_fee),
  tax = VALUES(tax),
  discount = VALUES(discount),
  total = VALUES(total),
  note = VALUES(note),
  updated_at = VALUES(updated_at);

-- 90 order items, two per order.
INSERT INTO order_items (
  id, order_id, product_id, product_name, product_image, price, quantity, line_total, created_at, updated_at
)
SELECT
  95000 + (o.n * 10) + item_slot.n AS id,
  ord.id AS order_id,
  p.id AS product_id,
  p.name AS product_name,
  CONCAT('products/product-', LPAD(p.id, 2, '0'), '.jpg') AS product_image,
  p.price AS price,
  CASE item_slot.n
    WHEN 1 THEN 1 + (o.n % 2)
    ELSE 1 + ((o.n + 1) % 2)
  END AS quantity,
  p.price * CASE item_slot.n
    WHEN 1 THEN 1 + (o.n % 2)
    ELSE 1 + ((o.n + 1) % 2)
  END AS line_total,
  DATE_SUB(@seed_now, INTERVAL (50 - o.n) DAY) AS created_at,
  DATE_SUB(@seed_now, INTERVAL GREATEST(0, 48 - o.n) DAY) AS updated_at
FROM tmp_demo_numbers o
JOIN orders ord ON ord.order_number = CONCAT('BL-DEMO-', LPAD(o.n, 4, '0'))
JOIN (
  SELECT 1 AS n
  UNION ALL SELECT 2
) item_slot ON item_slot.n IN (1, 2)
JOIN products p ON p.id = CASE item_slot.n
  WHEN 1 THEN (((o.n * 3) % 60) + 1)
  ELSE (((o.n * 7) % 60) + 1)
END
WHERE o.n <= 45
ON DUPLICATE KEY UPDATE
  order_id = VALUES(order_id),
  product_id = VALUES(product_id),
  product_name = VALUES(product_name),
  product_image = VALUES(product_image),
  price = VALUES(price),
  quantity = VALUES(quantity),
  line_total = VALUES(line_total),
  updated_at = VALUES(updated_at);

-- 60 favorites, two per customer.
INSERT IGNORE INTO favorite_products (user_id, product_id, created_at, updated_at)
SELECT
  u.id,
  CASE fav_slot.n
    WHEN 1 THEN (((c.n * 5) % 60) + 1)
    ELSE (((c.n * 11) % 60) + 1)
  END AS product_id,
  DATE_SUB(@seed_now, INTERVAL (35 - c.n) DAY) AS created_at,
  @seed_now AS updated_at
FROM tmp_demo_numbers c
JOIN users u ON u.email = CONCAT('khach', LPAD(c.n, 2, '0'), '@bloom.test')
JOIN (
  SELECT 1 AS n
  UNION ALL SELECT 2
) fav_slot ON fav_slot.n IN (1, 2)
WHERE c.n <= 30;

-- Reviews for completed orders. INSERT IGNORE respects unique(product_id, user_id).
INSERT IGNORE INTO product_reviews (
  product_id, user_id, order_id, order_item_id, rating, content, created_at, updated_at
)
SELECT
  oi.product_id,
  ord.user_id,
  ord.id,
  oi.id,
  CASE oi.id % 5 WHEN 0 THEN 5 WHEN 1 THEN 4 WHEN 2 THEN 5 WHEN 3 THEN 4 ELSE 5 END AS rating,
  CASE oi.id % 6
    WHEN 0 THEN 'Mùi hương sang, giữ hương tốt và đóng gói rất chỉn chu.'
    WHEN 1 THEN 'Chai đẹp, hương mở đầu dễ chịu, hợp dùng đi làm.'
    WHEN 2 THEN 'Mình mua làm quà, người nhận rất thích.'
    WHEN 3 THEN 'Hương tinh tế, không bị nồng, cảm giác cao cấp.'
    WHEN 4 THEN 'Tư vấn đúng gu, giao nhanh và seal nguyên vẹn.'
    ELSE 'Sẽ quay lại mua thêm các mùi khác của Bloom.'
  END AS content,
  DATE_ADD(ord.updated_at, INTERVAL 1 DAY) AS created_at,
  DATE_ADD(ord.updated_at, INTERVAL 1 DAY) AS updated_at
FROM order_items oi
JOIN orders ord ON ord.id = oi.order_id
WHERE ord.order_number LIKE 'BL-DEMO-%'
  AND ord.status = 'completed'
  AND ord.user_id IS NOT NULL
  AND oi.id % 2 = 1;

DROP TEMPORARY TABLE IF EXISTS tmp_demo_numbers;

COMMIT;
