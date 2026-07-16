-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: bloom
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `don_hangs`
--

DROP TABLE IF EXISTS `don_hangs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_hangs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ten_khach_hang` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_hangs`
--

LOCK TABLES `don_hangs` WRITE;
/*!40000 ALTER TABLE `don_hangs` DISABLE KEYS */;
/*!40000 ALTER TABLE `don_hangs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite_products`
--

DROP TABLE IF EXISTS `favorite_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite_products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorite_products_user_id_product_id_unique` (`user_id`,`product_id`),
  KEY `favorite_products_product_id_foreign` (`product_id`),
  CONSTRAINT `favorite_products_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorite_products_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite_products`
--

LOCK TABLES `favorite_products` WRITE;
/*!40000 ALTER TABLE `favorite_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorite_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_reset_tokens_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2026_05_15_084025_create_products_table',1),(6,'2026_05_15_103519_create_don_hangs_table',1),(7,'2026_07_01_140917_add_phone_to_users_table',1),(8,'2026_07_01_142139_complete_shop_database_schema',1),(9,'2026_07_01_144139_create_favorite_products_table',1),(10,'2026_07_02_000001_create_product_reviews_table',2),(11,'2026_07_02_000002_add_role_to_users_table',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` text COLLATE utf8mb4_unicode_ci,
  `price` bigint unsigned NOT NULL,
  `quantity` int unsigned NOT NULL,
  `line_total` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_address` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `payment_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `subtotal` bigint unsigned NOT NULL DEFAULT '0',
  `shipping_fee` bigint unsigned NOT NULL DEFAULT '0',
  `tax` bigint unsigned NOT NULL DEFAULT '0',
  `discount` bigint unsigned NOT NULL DEFAULT '0',
  `total` bigint unsigned NOT NULL DEFAULT '0',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_foreign` (`user_id`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'admin-token','dd03535c079d4366edeb607c59e60378f922fe77ab98785502a6dfb0e3829f6e','[\"admin\"]',NULL,NULL,'2026-07-02 12:46:58','2026-07-02 12:46:58'),(2,'App\\Models\\User',1,'admin-token','a5d4bf47fdfcb8cde6def5b56a9928ac6f32caa993aaf0854e1288038b16511a','[\"admin\"]',NULL,NULL,'2026-07-02 12:47:56','2026-07-02 12:47:56'),(3,'App\\Models\\User',1,'admin-token','549eaa2f8d207a9b4412f243294e6a75fb51dbd18cce61fe481f8cb7daa4cdf0','[\"admin\"]','2026-07-02 12:48:44',NULL,'2026-07-02 12:48:43','2026-07-02 12:48:44');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `order_id` bigint unsigned NOT NULL,
  `order_item_id` bigint unsigned DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_reviews_product_id_user_id_unique` (`product_id`,`user_id`),
  KEY `product_reviews_user_id_foreign` (`user_id`),
  KEY `product_reviews_order_id_foreign` (`order_id`),
  KEY `product_reviews_order_item_id_foreign` (`order_item_id`),
  CONSTRAINT `product_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Uncategorized',
  `is_best_seller` tinyint(1) NOT NULL DEFAULT '0',
  `stock` int unsigned NOT NULL DEFAULT '100',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_index` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Kính râm Aviator Classic',2047000,'products/product-01.jpg','Kính râm kiểu phi công cổ điển, tròng kính chống tia UV phù hợp đi nắng hằng ngày.','Mắt kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(2,'Kính mát Oversized Grace',1817000,'products/product-02.jpg','Kính mát bản lớn, tạo vẻ thanh lịch và che phủ tốt khi di chuyển ngoài trời.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(3,'Kính thể thao Polarized',2967000,'products/product-03.jpg','Tròng kính phân cực giảm chói, phù hợp chạy bộ, đạp xe và hoạt động ngoài trời.','Mắt kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(4,'Kính râm nữ Cat-Eye',1955000,'products/product-04.jpg','Thiết kế mắt mèo sắc nét, nhẹ mặt và dễ phối với trang phục hiện đại.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(5,'Gọng kính tròn Retro',1127000,'products/product-05.jpg','Gọng tròn phong cách hoài cổ, hợp khuôn mặt nhỏ và trung bình.','Gọng kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(6,'Gọng kính Titanium Pro',2737000,'products/product-06.jpg','Chất liệu titanium nhẹ, bền và chống gỉ tốt cho nhu cầu đeo lâu.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(7,'Gọng kính TR90 Flex',805000,'products/product-07.jpg','Gọng nhựa TR90 dẻo nhẹ, ôm mặt và ít gây đau sống mũi.','Gọng kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(8,'Gọng kính kim loại Basic',1035000,'products/product-08.jpg','Thiết kế kim loại tối giản, phù hợp dùng đi học, đi làm mỗi ngày.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(9,'Hộp đựng kính da cao cấp',575000,'products/product-09.jpg','Hộp đựng kính bọc da, lót mềm giúp hạn chế trầy xước khi mang theo.','Phụ kiện',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(10,'Kính chống ánh sáng xanh',1495000,'products/product-10.jpg','Tròng lọc ánh sáng xanh hỗ trợ mắt khi làm việc lâu với máy tính.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(11,'Bộ lau kính Nano Care',345000,'products/product-11.jpg','Dung dịch lau kính và khăn nano mềm, làm sạch nhanh mà không để lại vệt.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(12,'Dây đeo kính Vintage',276000,'products/product-12.jpg','Dây đeo kính phong cách vintage, chắc chắn và tiện khi di chuyển.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(13,'Kính mát Wayfarer Urban',2369000,'products/product-13.jpg','Dáng Wayfarer hiện đại, dễ đeo và nổi bật trong phong cách thường ngày.','Mắt kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(14,'Kính râm Clubmaster Noir',1380000,'products/product-14.jpg','Form Clubmaster cổ điển với phần viền trên đậm, tạo điểm nhấn lịch lãm.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(15,'Kính mát Oval Seoul',1058000,'products/product-15.jpg','Kính oval mảnh nhẹ, hợp xu hướng tối giản và phong cách Hàn Quốc.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(16,'Kính râm Square Amber',1357000,'products/product-16.jpg','Tròng màu hổ phách dịu mắt, form vuông cân đối và dễ phối đồ.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(17,'Kính mát Round Havana',1150000,'products/product-17.jpg','Gọng vân đồi mồi phối tròng tròn, mang cảm giác mềm mại và nghệ thuật.','Mắt kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(18,'Kính râm Minimal Slate',529000,'products/product-18.jpg','Thiết kế tối giản, trọng lượng nhẹ, phù hợp người thích phụ kiện gọn gàng.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(19,'Kính mát Gradient Rose',1219000,'products/product-19.jpg','Tròng chuyển màu hồng nhẹ, tạo diện mạo mềm mại và nổi bật.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(20,'Kính râm Pilot Steel',2714000,'products/product-20.jpg','Gọng kim loại chắc chắn, tròng lớn chống nắng tốt cho chuyến đi xa.','Mắt kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(21,'Kính mát Sport Edge',1242000,'products/product-21.jpg','Dáng thể thao ôm mặt, hạn chế trượt khi vận động ngoài trời.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(22,'Kính râm Luxe Brown',2231000,'products/product-22.jpg','Tông nâu sang trọng, hợp phong cách công sở và du lịch.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(23,'Kính mát Clear Sky',1679000,'products/product-23.jpg','Tròng sáng dịu, thiết kế trong trẻo cho phong cách trẻ trung.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(24,'Kính râm Fashion Metro',2277000,'products/product-24.jpg','Form thời trang thành thị, viền gọn và tạo điểm nhấn mạnh cho khuôn mặt.','Mắt kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(25,'Kính mát Breeze Light',667000,'products/product-25.jpg','Kính nhẹ, dễ mang theo và phù hợp nhu cầu chống nắng cơ bản.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(26,'Kính râm Mirror Silver',897000,'products/product-26.jpg','Tròng gương bạc cá tính, giảm chói tốt khi đi dưới nắng mạnh.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(27,'Kính mát Sunset Gold',2254000,'products/product-27.jpg','Tông vàng ấm nổi bật, hợp outfit nghỉ dưỡng và dạo phố.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(28,'Kính râm Daily Black',1035000,'products/product-28.jpg','Màu đen cơ bản, dễ dùng mỗi ngày và phù hợp nhiều dáng mặt.','Mắt kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(29,'Gọng kính Acetate Classic',2645000,'products/product-29.jpg','Gọng acetate dày dặn, bề mặt bóng đẹp và giữ form tốt.','Gọng kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(30,'Gọng kính AirLite Silver',2369000,'products/product-30.jpg','Gọng bạc mảnh nhẹ, tạo cảm giác tinh tế và thoải mái khi đeo lâu.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(31,'Gọng kính Browline Elite',1426000,'products/product-31.jpg','Thiết kế browline nhấn phần chân mày, hợp phong cách trưởng thành.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(32,'Gọng kính Oval Comfort',828000,'products/product-32.jpg','Gọng oval gọn nhẹ, dễ đeo cho khuôn mặt nhỏ và trung bình.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(33,'Gọng kính Square Office',1311000,'products/product-33.jpg','Dáng vuông gọn, phù hợp môi trường văn phòng và học tập.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(34,'Gọng kính Titanium Matte',2691000,'products/product-34.jpg','Bề mặt mờ sang trọng, titanium nhẹ và bền bỉ cho sử dụng lâu dài.','Gọng kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(35,'Gọng kính Round Scholar',1817000,'products/product-35.jpg','Form tròn tri thức, hợp phong cách nhẹ nhàng và sáng mặt.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(36,'Gọng kính Transparent Clear',1518000,'products/product-36.jpg','Gọng trong suốt hiện đại, tạo cảm giác trẻ trung và ít kén trang phục.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(37,'Gọng kính Hexagon Modern',1035000,'products/product-37.jpg','Dáng lục giác cá tính, khác biệt nhưng vẫn dễ dùng hằng ngày.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(38,'Gọng kính Slim Gold',2346000,'products/product-38.jpg','Viền vàng mảnh, nhẹ mặt và tạo vẻ thanh lịch.','Gọng kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(39,'Gọng kính Carbon Flex',2001000,'products/product-39.jpg','Chất liệu carbon nhẹ, linh hoạt và phù hợp người vận động nhiều.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(40,'Gọng kính Navy Line',2323000,'products/product-40.jpg','Tông xanh navy trầm, tạo vẻ chuyên nghiệp và hiện đại.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(41,'Gọng kính Rose Metal',2737000,'products/product-41.jpg','Gọng kim loại ánh hồng nhẹ, thanh thoát và nữ tính.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(42,'Gọng kính Kids Safe',1058000,'products/product-42.jpg','Gọng dẻo cho trẻ em, ôm vừa và hạn chế gãy khi va chạm nhẹ.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(43,'Gọng kính Urban Black',575000,'products/product-43.jpg','Gọng đen đơn giản, giá dễ tiếp cận và phù hợp nhiều độ tuổi.','Gọng kính',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(44,'Gọng kính Premium Wood',2231000,'products/product-44.jpg','Chi tiết vân gỗ ấm mắt, tạo phong cách riêng mà vẫn tinh tế.','Gọng kính',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(45,'Khăn lau kính Microfiber',506000,'products/product-45.jpg','Khăn microfiber mềm, lau sạch bụi và dầu mà không làm xước tròng kính.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(46,'Bao da đựng kính Slim',1035000,'products/product-46.jpg','Bao da mỏng gọn, bảo vệ kính khi để trong túi xách hoặc balo.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(47,'Hộp kính Hardcase Travel',2369000,'products/product-47.jpg','Hộp cứng chống va đập, thích hợp mang kính theo khi đi du lịch.','Phụ kiện',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(48,'Dây đeo kính Sport Grip',1541000,'products/product-48.jpg','Dây đeo có độ bám tốt, giúp giữ kính ổn định khi vận động.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(49,'Dung dịch vệ sinh Lens Clean',1035000,'products/product-49.jpg','Dung dịch làm sạch tròng kính, loại bỏ vân tay và bụi mịn nhanh chóng.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(50,'Bộ tua vít sửa kính Mini',1610000,'products/product-50.jpg','Bộ tua vít nhỏ gọn để siết ốc và chỉnh kính cơ bản tại nhà.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(51,'Miếng đệm mũi Silicone',1932000,'products/product-51.jpg','Đệm mũi silicone mềm, giúp kính bám tốt hơn và giảm cấn.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(52,'Hộp kính trong suốt',529000,'products/product-52.jpg','Hộp đựng trong suốt gọn nhẹ, dễ nhìn thấy kính bên trong.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(53,'Dây giữ kính Pearl',713000,'products/product-53.jpg','Dây giữ kính phối hạt ngọc, vừa tiện dụng vừa là phụ kiện thời trang.','Phụ kiện',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(54,'Khay trưng bày kính',2645000,'products/product-54.jpg','Khay trưng bày nhiều ngăn, giữ kính gọn gàng trên bàn hoặc tủ.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(55,'Túi vải bảo vệ kính',529000,'products/product-55.jpg','Túi vải mềm giúp chống bụi và hạn chế trầy xước khi cất kính.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(56,'Kẹp kính ô tô Clip-On',506000,'products/product-56.jpg','Kẹp giữ kính trên xe hơi, tiện lấy nhanh khi cần sử dụng.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(57,'Dây đeo kính da Braided',2369000,'products/product-57.jpg','Dây da bện chắc chắn, tạo cảm giác cổ điển và bền khi dùng lâu.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(58,'Set chăm sóc kính Deluxe',2116000,'products/product-58.jpg','Bộ phụ kiện vệ sinh và bảo quản kính đầy đủ cho người dùng thường xuyên.','Phụ kiện',1,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(59,'Móc treo kính để bàn',690000,'products/product-59.jpg','Móc treo nhỏ gọn giúp đặt kính ngăn nắp trên bàn làm việc.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24'),(60,'Hộp kính đôi Travel Duo',2599000,'products/product-60.jpg','Hộp đựng hai kính cùng lúc, phù hợp người mang cả kính mát và kính cận.','Phụ kiện',0,100,'active','2026-07-02 12:47:24','2026-07-02 12:47:24');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@bloom.local',NULL,NULL,'admin','2026-07-02 12:46:46','$2y$12$PuEdNe2OdMQi5ONHDJaD8OaHvtpnhXu.w.hjOs9rBgBHrzlEWASpm',NULL,'2026-07-02 12:31:17','2026-07-02 12:46:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-02 12:53:18
