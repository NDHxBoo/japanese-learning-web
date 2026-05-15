# Deploy lên Vercel

Hướng dẫn deploy website Japanese Vocabulary Learning lên Vercel.

> Dự án này là **static site** (HTML + CSS + JS thuần), không cần build step.

---

## Cách 1: Deploy qua giao diện Vercel (Nhanh nhất)

### Bước 1 — Tạo tài khoản Vercel

1. Truy cập [https://vercel.com](https://vercel.com)
2. Đăng ký bằng GitHub, GitLab hoặc email

### Bước 2 — Push code lên GitHub

```bash
# Khởi tạo git repo (nếu chưa có)
git init
git add .
git commit -m "Initial commit"

# Tạo repo trên GitHub, sau đó push
git remote add origin https://github.com/<username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### Bước 3 — Import project trên Vercel

1. Vào [https://vercel.com/new](https://vercel.com/new)
2. Chọn **Import Git Repository**
3. Chọn repo vừa push lên GitHub
4. Cấu hình như sau:

| Mục | Giá trị |
|-----|---------|
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (hoặc `japanese-learning-web` nếu repo chứa thư mục con) |
| **Build Command** | _(để trống)_ |
| **Output Directory** | `./` |

5. Bấm **Deploy**
6. Đợi khoảng 30 giây, Vercel sẽ cấp cho bạn URL dạng `https://<project>.vercel.app`

### Bước 4 — Truy cập website

Sau khi deploy thành công, bạn sẽ nhận được link như:

```
https://japanese-learning-web.vercel.app
```

Mỗi lần push code mới lên GitHub, Vercel sẽ **tự động deploy lại**.

---

## Cách 2: Deploy bằng Vercel CLI

### Bước 1 — Cài Vercel CLI

```bash
npm install -g vercel
```

### Bước 2 — Đăng nhập

```bash
vercel login
```

Chọn phương thức đăng nhập (GitHub, Email, ...) và xác thực.

### Bước 3 — Deploy

Mở terminal tại thư mục dự án và chạy:

```bash
vercel
```

Vercel sẽ hỏi một số câu hỏi:

```
? Set up and deploy? [Y/n]                        → Y
? Which scope?                                     → Chọn tài khoản của bạn
? Link to existing project?                        → N
? What's your project's name?                      → japanese-learning-web
? In which directory is your code located?          → ./
? Want to modify these settings? [y/N]             → N
```

Sau khi hoàn tất, bạn sẽ nhận được link preview.

### Bước 4 — Deploy production

```bash
vercel --prod
```

---

## Cách 3: Kéo thả (không cần GitHub)

1. Truy cập [https://vercel.com/new](https://vercel.com/new)
2. Kéo thả **toàn bộ thư mục dự án** vào vùng upload trên trang
3. Vercel sẽ tự nhận diện static site và deploy
4. Nhận link sau khoảng 30 giây

---

## Cấu hình nâng cao (tuỳ chọn)

### Tạo file `vercel.json`

Nếu muốn cấu hình thêm headers, redirects, hoặc clean URLs:

```json
{
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Custom domain

1. Vào **Project Settings** → **Domains** trên Vercel Dashboard
2. Thêm domain của bạn (ví dụ: `nihongo.example.com`)
3. Cập nhật DNS theo hướng dẫn Vercel:
   - **CNAME**: `cname.vercel-dns.com`
   - Hoặc **A record**: `76.76.21.21`

---

## Lưu ý quan trọng

- **SheetJS CDN**: Website sử dụng SheetJS từ CDN (`cdn.sheetjs.com`), cần kết nối internet để hoạt động.
- **LocalStorage**: Dữ liệu từ vựng và tiến độ lưu trên trình duyệt người dùng, không mất khi deploy lại.
- **Gemini API Key**: Nếu dùng tính năng AI, API key được lưu trong LocalStorage của trình duyệt. Không lưu API key trong code.
- **HTTPS**: Vercel tự động cấp chứng chỉ SSL. Clipboard API (`navigator.clipboard`) hoạt động bình thường trên HTTPS.

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|------------|----------|
| 404 Not Found | Sai Root Directory | Kiểm tra lại Root Directory trong Project Settings |
| Trang trắng | File `index.html` không nằm ở root | Đảm bảo `index.html` nằm đúng thư mục gốc của Root Directory |
| SheetJS không load | CDN bị chặn | Kiểm tra mạng hoặc tải SheetJS về thư mục `js/` |
| Import Excel không hoạt động | Trình duyệt chặn file input | Dùng HTTPS (Vercel tự cấp) |
