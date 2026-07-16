# Bloom Frontend

Frontend Next.js cho website bán kính Bloom.

## Dữ liệu

- Sản phẩm, ảnh sản phẩm, tồn kho, đơn hàng và khách hàng được lấy từ Laravel API.
- Frontend không còn dùng dữ liệu mẫu trong `frontend/data`.
- API proxy nội bộ nằm trong `app/api/*` để frontend gọi backend ổn định hơn.

## Chạy dự án

```bash
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

Backend Laravel mặc định:

```text
http://127.0.0.1:8000/api
```

Nếu cần đổi backend URL cho Next proxy, đặt trong `.env.local`:

```env
LARAVEL_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```
