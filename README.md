# Thiệp Xuân

App tạo lời chúc và thiệp Tết bằng AI cho người Việt. Bản MVP cho Tết Đinh Mùi (mùng 1 Tết: thứ Bảy 6/2/2027).

Người dùng chọn người nhận (ông bà, bố mẹ, sếp, khách hàng...), giọng điệu (ấm áp, trang trọng, hài hước, có vần), có thể thêm tên và một ghi chú. AI viết 4 lời chúc và 1 câu đối. Người dùng sửa lại, chọn 1 trong 4 mẫu thiệp (Mai vàng, Đào hồng, Đèn lồng, Câu đối), có thể ghép ảnh gia đình vào khung ảnh trên thiệp (kéo để căn, phóng to thu nhỏ), rồi gửi qua Zalo, Messenger, Facebook bằng bảng chia sẻ của máy hoặc lưu ảnh 1080 x 1350 vào máy.

## Cấu trúc

```
mobile/   App Expo (React Native, TypeScript): Android, iOS, và chạy được trên web
server/   API Node + Express gọi Claude để viết lời chúc
```

## Chạy thử

Máy chủ:

```bash
cd server
npm install
cp .env.example .env      # điền ANTHROPIC_API_KEY nếu muốn dùng AI
npm run dev               # http://localhost:8787
```

Không có khóa API thì máy chủ vẫn chạy, trả lời chúc soạn sẵn. Tiện để làm giao diện mà không tốn tiền.

App:

```bash
cd mobile
npm install
cp .env.example .env      # sửa EXPO_PUBLIC_API_URL thành IP máy tính của bạn
npx expo start            # quét mã QR bằng Expo Go, hoặc nhấn w để mở trên web
```

Lưu ảnh vào thư viện cần bản build riêng (development build), vì Expo Go bị giới hạn quyền ảnh: `npx expo run:android` hoặc `npx eas-cli@latest build --profile development`.

## Kiểm soát chi phí AI

- Mỗi thiết bị có `FREE_AI_PER_DAY` lượt AI miễn phí mỗi ngày (mặc định 5). Hết lượt thì trả lời chúc soạn sẵn thay vì báo lỗi.
- Yêu cầu giống nhau được lưu đệm 6 giờ, không gọi AI lần hai và không trừ lượt.
- Lời nhắc hệ thống được cache phía Claude (prompt caching).
- Effort mặc định `low` vì lời chúc là việc ngắn. Model và effort đổi được qua `AI_MODEL`, `AI_EFFORT`.
- AI lỗi hoặc từ chối thì hoàn lượt và trả lời chúc soạn sẵn.

Lượt và bộ đệm hiện nằm trong bộ nhớ tiến trình, đủ cho 1 máy chủ. Khi chạy nhiều máy chủ, chuyển `server/src/store.ts` sang Redis.

## Việc tiếp theo

1. Thanh toán gói Tết (29k đến 49k): bỏ watermark, ảnh độ phân giải cao, mẫu cao cấp. Cổng PayOS hoặc SePay để tự xác nhận chuyển khoản.
2. Gói doanh nghiệp: logo, điền tên khách hàng hàng loạt, gửi qua Zalo OA.
3. Thêm dịp khác: 8/3, 20/10, sinh nhật, khai trương (máy chủ đã có sẵn tham số `occasion`).
