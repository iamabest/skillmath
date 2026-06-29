# SkillMath9 – Trực quan hóa Toán THCS 📐

Hệ thống mô phỏng Toán học tương tác theo chương trình SGK **Kết nối tri thức với cuộc sống**, dành cho học sinh lớp 6–9.

## ✨ Tính năng

| Lớp | Mô phỏng |
|-----|----------|
| **6** | Trục số nguyên động · Đối xứng hình phẳng |
| **7** | Trải phẳng 3D (React Three Fiber) · Ba đường đồng quy |
| **8** | Hằng đẳng thức (a+b)² · Đồ thị hàm số bậc nhất |
| **9** | Bắn bóng Parabol · Góc nội tiếp – cung bị chắn |
| **6–12** | Xác suất thực nghiệm · Thống kê mô tả |

## 🚀 Khởi động phát triển

```bash
npm install
npm run dev
```

## 🏗️ Build sản phẩm

```bash
npm run build
npm run preview   # xem trước bản build
```

## 📦 Triển khai

### GitHub Pages (khuyến nghị)
Push lên nhánh `main` → GitHub Actions tự động build & deploy.

### Vercel / Netlify
Import repo, chọn framework **Vite**, lệnh build `npm run build`, thư mục output `dist`.

### Azure Web App
Kích hoạt workflow `azure-webapps-node.yml` thủ công sau khi cấu hình secret `AZURE_WEBAPP_PUBLISH_PROFILE`.

## 🗂️ Cấu trúc thư mục

```
src/
├── components/        # React components dùng chung
├── data/              # Dữ liệu danh sách mô phỏng
├── simulations/       # Từng module mô phỏng
│   ├── lop6-*/        # Mô phỏng lớp 6 (vanilla JS + Canvas)
│   ├── lop7-*/        # Mô phỏng lớp 7
│   ├── lop8-*/        # Mô phỏng lớp 8
│   ├── lop9-*/        # Mô phỏng lớp 9
│   ├── spatial-nets/  # Hình trải phẳng 3D (React Three Fiber)
│   └── xac-suat-*/    # Xác suất & Thống kê
└── css/               # Global styles
```

## 🛠️ Công nghệ

- **React 19** + **Vite 6**
- **React Router v7** – client-side routing
- **React Three Fiber / Three.js** – mô phỏng 3D
- **Vanilla Canvas API** – các mô phỏng legacy
