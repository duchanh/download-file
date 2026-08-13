# React Mobile Download Test

Ứng dụng độc lập để thử tải file trên Safari và Chrome iOS.

## Chạy local

```powershell
cd D:\Sources\proxy-meeyland\artifacts\react-mobile-download-test
npm install
npm run dev
```

Vite chạy HTTPS trên `0.0.0.0`. Mở địa chỉ IP LAN được in trong terminal từ điện thoại cùng mạng Wi-Fi, ví dụ:

```text
https://192.168.1.10:5173
```

Chấp nhận cảnh báo chứng chỉ self-signed trên thiết bị test. Web Share API cần secure context; nếu trình duyệt vẫn báo `secureContext: false`, hãy dùng một HTTPS tunnel tin cậy.

## Các bài test

1. **Mở link trực tiếp:** xác nhận hành vi server/CDN và tên từ URL/header.
2. **Blob download:** kiểm tra `<a download>` với Blob URL.
3. **Fetch rồi Share:** mô phỏng luồng fetch + `navigator.share()` trong một lần nhấn.
4. **Web Share hai bước:** tải file trước, sau đó nhấn lần hai để mở share sheet trong user gesture mới.

Trang hiển thị `userAgent`, hỗ trợ `navigator.share`, `navigator.canShare` và nhật ký lỗi để so sánh các phiên bản trình duyệt.
