# VANHPERFUME

VANHPERFUME là website bán nước hoa nguyên chai, gồm Laravel REST API ở backend và Next.js ở frontend. Dự án đã được cấu hình sẵn để chạy:

- Frontend: http://localhost:3002
- Backend API: http://localhost:8002/api
- Cơ sở dữ liệu: Amazon RDS MySQL `perfume`

## Công nghệ

Backend:

- Laravel 10
- PHP 8.2+
- MySQL / Amazon RDS
- Laravel Sanctum
- VNPay sandbox

Frontend:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn style components
- Framer Motion

## Cấu trúc thư mục

```text
perfume/
|-- backend/          # Laravel REST API
|-- frontend/         # Next.js app
|-- docker-compose.yml
|-- .env              # env tổng cho docker/payment/frontend URL
`-- README.md
```

## Cấu hình mặc định

| Thành phần | URL |
| --- | --- |
| Frontend | http://localhost:3002 |
| Backend API | http://localhost:8002/api |
| VNPay return | http://localhost:8002/api/payments/vnpay/return |

## Chạy từ thư mục root

Dự án có `package.json` ở root để gọi nhanh các lệnh:

```powershell
cd D:\perfume
npm run dev:backend    # Laravel API tại http://localhost:8002
npm run dev:frontend   # Next.js tại http://localhost:3002
```

## Chạy thủ công không dùng Docker

Mở 2 terminal riêng.

### 1. Backend Laravel trên port 8002

```powershell
cd D:\perfume\backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=AdminUserSeeder
php artisan serve --host=127.0.0.1 --port=8002
```

Có thể chạy bằng npm script đã thêm:

```powershell
cd D:\perfume\backend
npm run serve
```

Backend `.env` cần có các giá trị chính:

```env
APP_NAME=VANHPERFUME
APP_URL=http://localhost:8002
DB_CONNECTION=mysql
DB_DATABASE=perfume
FRONTEND_URL=http://localhost:3002
VNPAY_RETURN_URL=http://localhost:8002/api/payments/vnpay/return
```

### 2. Frontend Next.js trên port 3002

```powershell
cd D:\perfume\frontend
npm install
npm run dev
```

Frontend `.env.local` cần có:

```env
NEXT_PUBLIC_API_URL=http://localhost:8002/api
LARAVEL_API_URL=http://127.0.0.1:8002/api
```

`frontend/package.json` đã cấu hình:

```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "start": "next start -p 3002"
  }
}
```

## Chạy bằng Docker

Docker đã được cấu hình để container và host dùng cùng cổng:

- Frontend container: `3002`, publish ra host `3002`
- Backend container: `8002`, publish ra host `8002`

```powershell
cd D:\perfume
docker compose up -d --build
```

Sau khi chạy:

- Frontend: http://localhost:3002
- Backend API: http://localhost:8002/api
- Frontend trong Docker gọi backend qua `http://backend:8002/api`

Tắt Docker:

```powershell
docker compose down
```

Xem log:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
```

## Lệnh hữu ích

### Backend

```powershell
cd D:\perfume\backend
php artisan migrate
php artisan db:seed
php artisan products:sync-images
php artisan products:sync-catalog
```

### Frontend

```powershell
cd D:\perfume\frontend
npm run lint
npm run build
npm run dev
```

## Tài khoản admin

Admin là user có `role=admin` trong bảng `users`. Nếu dùng seeder mặc định:

```text
Email: admin@vanhperfume.local
Password: 123456
```

Trang admin:

```text
http://localhost:3002/admin
```

## API chính

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| POST | /api/register | Đăng ký tài khoản |
| POST | /api/login | Đăng nhập người dùng |
| POST | /api/logout | Đăng xuất |
| GET | /api/products | Danh sách nước hoa |
| GET | /api/products/{id} | Chi tiết sản phẩm |
| POST | /api/orders | Tạo đơn hàng |
| GET | /api/orders | Lịch sử đơn hàng của user đăng nhập |
| PATCH | /api/orders/{id}/status | Cập nhật trạng thái đơn hàng |
| GET | /api/favorites | Danh sách yêu thích |
| POST | /api/favorites/{product} | Thêm vào yêu thích |
| DELETE | /api/favorites/{product} | Xóa khỏi yêu thích |
| GET | /api/admin/dashboard | Dashboard admin |

## Ghi chu

- Website chi ban nuoc hoa nguyen chai.
- Checkout khong render footer/chat de tranh che nut thanh toan.
- Neu frontend khong goi duoc API, kiem tra backend dang chay tai `http://localhost:8002/api/products`.
- Neu doi env, hay restart lai server frontend/backend.

## Bao mat

Khong commit file env that neu dua project len repo public:

```text
.env
backend/.env
frontend/.env.local
```
