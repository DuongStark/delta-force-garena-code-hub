# Delta Code Hub — Garena

Web tĩnh và tiện ích Chrome (Manifest V3) hỗ trợ điền lần lượt mã trên trang đổi mã Garena. Không thu thập mật khẩu hoặc cookie. Chỉ chạy khi người dùng nhấn Run sau khi đăng nhập trực tiếp tại Garena.

## Chạy tại máy

```sh
python3 -m http.server 4173 --directory docs
```

Mở http://localhost:4173. Truy cập `chrome://extensions`, bật Developer mode, chọn Load unpacked và chọn thư mục `extension`. Tải lại trang web và trang Garena sau khi cài. Giữ một tab Garena duy nhất. Bấm Run trên web sau khi đăng nhập và chọn mã.

## Cập nhật kho

```sh
node scripts/update-codes.cjs
```

Script tải danh sách công khai từ DFLoadout.gg, lọc trùng và ký tự không hợp lệ, lưu nguồn cùng thời điểm thu thập vào `docs/codes.json`. Tất cả mã là **chưa xác minh**, có thể hết hạn hoặc không phù hợp khu vực/tài khoản. Script chỉ cập nhật khi được chạy; chưa có lịch chạy tự động. Cần xuất bản lại trang sau khi cập nhật kho đã triển khai.

## Kiểm tra

```sh
node --test tests/*.test.js
```

Tạo lại bản tải tiện ích sau khi thay đổi extension: `cd extension && zip -r ../docs/delta-code-hub-extension.zip manifest.json background.js bridge.js redeem.js`.

Kết quả được lưu cục bộ trong chrome.storage.local. Trang Garena có thể thay đổi giao diện hoặc đưa ra CAPTCHA/giới hạn, khi đó tiện ích dừng và không vượt qua các biện pháp kiểm tra. Chưa kiểm thử đổi mã với tài khoản thật.
