# Lotte Mart Backend

## Yêu cầu môi trường
- Node.js >= 18
- MongoDB

## Cài đặt
1. Mở folder `backend`
2. Chạy `npm install`
3. Tạo `.env` từ `.env.example` và cấu hình đầy đủ:
	- `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`
	- `GOOGLE_CLIENT_ID`
	- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL`
	- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

## Chạy Server
- Chạy Development (hot-reload): `npm run dev`
- Chạy Production: `npm start`
- Chạy Seed (Nhúng Dữ Liệu): `npm run seed`

## Cấu trúc
```text
backend/
├── config/
│   ├── cors.js       # CORS settings cho Frontend
│   └── db.js         # Mongoose DB connect
├── controllers/      # Xử lý logic từng domain
├── middlewares/      # Auth JWT, Error Handler
├── models/           # Mongoose schemas
├── routes/           # Định tuyến API
├── seed/             # Script nạp mockData vào DB
├── app.js            # Express app config
├── server.js         # Entry point 
└── package.json
```

## Các API chính
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/verify`
- `POST /api/auth/google`
- `GET  /api/auth/facebook`
- `GET  /api/auth/facebook/callback`
- `POST /api/auth/email/request-otp`
- `POST /api/auth/email/verify-otp`
- `GET  /api/products` (Có phân trang, search, filter)
- `GET  /api/cart/:userId`
- `POST /api/orders`
- `GET  /api/orders/:userId`
- Các API quản trị, phân quyền (user/admin) đã được setup sẵn.

## Gửi email
- Hệ thống dùng SMTP (Nodemailer) để:
	- Gửi OTP xác thực email
	- Gửi email thông báo đơn hàng thành công
- Nếu thiếu cấu hình email trong `.env`, API OTP sẽ trả lỗi rõ ràng và server không crash.
