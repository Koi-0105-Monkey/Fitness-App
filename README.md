# 🏋️ FITBODY — Fitness Mobile App

> React Native (Expo) + Node.js + MongoDB Atlas + Cloudinary

---

## 📁 Project Structure

```
Fitness-App/
├── mobile/     # React Native Expo app (FE)
└── server/     # Node.js Express API (BE)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Expo Go app (iOS/Android) hoặc simulator

---

### 📱 Mobile (FE)

```bash
cd mobile
cp .env.example .env        # điền EXPO_PUBLIC_API_URL
npm install
npm run start               # hoặc npm run ios / npm run android
```

### 🛠️ Server (BE)

```bash
cd server
cp .env.example .env        # điền MONGODB_URI, JWT_SECRET, CLOUDINARY_*
npm install
npm run dev                 # chạy dev với nodemon
```

---

## 🌿 Git Workflow

```
main        ← chỉ merge khi app sẵn sàng release
  └── develop ← nhánh làm việc chính
        ├── feature/be-[tên]
        └── feature/fe-[tên]
```

**Quy tắc:**
1. Tạo branch từ `develop` (không phải `main`)
2. PR về `develop`
3. Merge `develop` → `main` chỉ khi milestone hoàn chỉnh

---

## 🔗 API

- Base URL: `http://localhost:5000/api`
- Health check: `GET /health`
- Postman Collection: `./postman_collection.json` *(BE cập nhật)*

---

## 👥 Team

| Role | Branch prefix |
|------|--------------|
| Frontend (React Native) | `feature/fe-*` |
| Backend (Node.js) | `feature/be-*` |