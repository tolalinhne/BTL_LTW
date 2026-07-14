# 👗 LiLi Fashion - Nền Tảng Thương Mại Điện Tử Thời Trang Hiện Đại

[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.3-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg?style=for-the-badge&logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

> **LiLi Fashion** là một dự án website thương mại điện tử chuyên biệt cho ngành thời trang, được xây dựng trên kiến trúc **Client-Server (3-Tier)** chuyên nghiệp. Hệ thống tích hợp các công nghệ tiên tiến nhất như **AI Chatbot (RAG)** tư vấn sản phẩm ngữ nghĩa, **thanh toán tự động VietQR qua SePay Webhook**, và hệ thống lưu trữ ảnh đám mây **Cloudinary**.

---

## I. Các Tính Năng Công Nghệ Trọng Tâm

### 1. Trợ Lý Ảo Chatbot AI (RAG + Supabase Vector DB)

- **Kiến trúc RAG (Retrieval-Augmented Generation)**: Chuyển đổi toàn bộ thông tin sản phẩm (bao gồm danh mục, giá bán, size, màu sắc, chương trình sale hiện hành, số lượng tồn kho) thành các vector ngữ nghĩa thông qua mô hình `gemini-embedding-001`.
- **Supabase Vector DB**: Lưu trữ vector trong PostgreSQL (`pgvector`) và thực hiện so khớp ngữ nghĩa thời gian thực thông qua RPC function `match_documents` (sử dụng độ tương đồng Cosine).
- **LLM Integration & Guardrails**: Tích hợp mô hình `gemini-2.0-flash`. Hệ thống sử dụng prompt hướng dẫn nghiêm ngặt để AI chỉ định dạng gợi ý theo cấu trúc `RECOMMEND:[id1,id2,...]`. Backend sẽ parse tag này bằng Regex, lấy thông tin sản phẩm mới nhất từ MySQL và hiển thị dưới dạng thẻ sản phẩm (Product Cards) trực quan cho người dùng.
- **Quản Lý Lịch Sử Chat & Rate Limiting**:
  - Tự động lưu lịch sử hội thoại dài hạn vào MySQL phân theo `session_id` để khôi phục giao diện khi người dùng tải lại trang.
  - Duy trì bộ nhớ đệm ngắn hạn (RAM) phục vụ ngữ cảnh cho LLM. Tự động tóm tắt (`summarizeAndTruncate`) khi số lượng tin nhắn vượt quá 20 để tối ưu token.
  - Áp dụng **Bucket4j Rate Limiter** & fallback tự động sang `gemini-2.0-flash-lite` khi gặp lỗi `429 Too Many Requests`.

### 2. Thanh Toán Tự Động VietQR & SePay Webhook

- **Mã QR Động**: Frontend tự động sinh mã VietQR theo chuẩn SePay:
  `https://qr.sepay.vn/img?acc=[ACCOUNT]&bank=[BANK]&amount=[total]&des=[orderCode]`
- **Xử Lý Webhook Bất Đồng Bộ**: Ngay khi khách hàng chuyển khoản thành công, SePay gửi dữ liệu (Payload POST) về Endpoint Webhook (`/api/webhook/sepay`).
- **Bảo Mật & Robustness**:
  - Xác thực nguồn Webhook bằng static API Key thông qua Authorization Header.
  - Sử dụng biểu thức chính quy (Regex) `extractOrderCodeFromContent` để bóc tách mã đơn hàng (định dạng `LILIxxxx`) ngay cả khi khách hàng ghi sai nội dung chuyển khoản.
  - Kiểm tra khớp số tiền, cập nhật trạng thái đơn hàng thành `CONFIRMED`, tự động trừ số lượng tồn kho và dừng quét QR ở phía Client qua cơ chế Polling.

### 3. Lưu Trữ Media & CDN với Cloudinary

- Xóa bỏ phương pháp lưu ảnh trực tiếp trên Disk server làm tiêu hao dung lượng lưu trữ tĩnh.
- Tích hợp Cloudinary Java SDK để upload trực tiếp luồng `MultipartFile` từ admin dashboard.
- Lưu trữ ảnh phân loại theo cấu trúc folder dự án (`lili-fashion/categories`, `lili-fashion/products`).
- Quản lý vòng đời ảnh (Lifecycle Management): Tự động xóa ảnh trên Cloudinary qua `public_id` khi Admin xóa sản phẩm hoặc danh mục trong hệ thống.

---

## II. Công Nghệ Sử Dụng (Tech Stack)

### 1. Backend (Spring Boot REST API)

- **Core**: Java 17, Spring Boot 3.2.3, Lombok.
- **Security**: Spring Security, JJWT (v0.12.5) cho xác thực JWT (Access Token & Refresh Token), BCrypt Password Encoder.
- **Database & ORM**: Hibernate/Spring Data JPA, MySQL Driver.
- **AI & HTTP Client**: Spring WebFlux (WebClient) cho non-blocking API calls.
- **API Documentation**: Springdoc OpenAPI / Swagger UI.
- **Utilities**: Bucket4j (Rate Limit), Jakarta Bean Validation (Ràng buộc dữ liệu DTO), Cloudinary Java SDK.

### 2. Frontend (TypeScript SPA)

- **Core**: React 19, TypeScript 5.8, Vite 6.2.
- **Styling & Icons**: Tailwind CSS v4, Lucide React, React Icons.
- **Routing**: React Router DOM v7.
- **State Management**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`, `SaleContext`, `ChatContext`).
- **HTTP Client**: Axios (với Interceptors tự động refresh token).
- **Animations**: Motion (Framer Motion) cho các hiệu ứng chuyển động mượt mà.

---

## III. Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### 1. Cài đặt Database

1. Tạo một cơ sở dữ liệu MySQL mới:
   ```sql
   CREATE DATABASE lili_fashion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Đăng ký tài khoản Supabase, tạo cơ sở dữ liệu mới và kích hoạt extension `vector`:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Tạo bảng lưu trữ vector cho RAG:
   ```sql
   CREATE TABLE knowledge_documents (
       id BIGSERIAL PRIMARY KEY,
       title VARCHAR(255) UNIQUE NOT NULL,
       content TEXT NOT NULL,
       embedding VECTOR(768), -- Vector 768 chiều tương ứng với gemini-embedding-001
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```
4. Tạo hàm RPC tìm kiếm tương đồng Cosine trong Supabase SQL Editor:
   ```sql
   CREATE OR REPLACE FUNCTION match_documents (
     query_embedding VECTOR(768),
     match_threshold FLOAT,
     match_count INT
   )
     RETURNS TABLE (
     id BIGINT,
     title VARCHAR(255),
     content TEXT,
     similarity FLOAT
   )
     LANGUAGE plpgsql AS $$
   BEGIN
     RETURN QUERY
     SELECT
       kd.id,
       kd.title,
       kd.content,
       1 - (kd.embedding <=> query_embedding) AS similarity
     FROM knowledge_documents kd
     WHERE 1 - (kd.embedding <=> query_embedding) > match_threshold
     ORDER BY kd.embedding <=> query_embedding
     LIMIT match_count;
   END;
   $$;
   ```

### 2. Cấu hình Backend

Tạo file `Code/backend/lili-fashion-api/src/main/resources/application.properties` (hoặc sửa đổi file hiện tại) với các cấu hình sau:

```properties
# Server Port
server.port=8080

# Database MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/lili_fashion?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Config
app.jwt.secret=YOUR_JWT_SUPER_SECRET_KEY_MINIMUM_256_BITS_FOR_SECURITY_REASONS
app.jwt.access-token-expiration=900000
app.jwt.refresh-token-expiration=604800000

# Google Gemini API
app.gemini.api-key=YOUR_GEMINI_API_KEY
app.gemini.api-key-secondary=YOUR_BACKUP_GEMINI_KEY
app.gemini.api-url=https://generativelanguage.googleapis.com

# Supabase Vector DB API
app.supabase.url=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
app.supabase.key=YOUR_SUPABASE_ANON_PUBLIC_KEY

# Cloudinary CDN
cloudinary.cloud-name=YOUR_CLOUDINARY_CLOUD_NAME
cloudinary.api-key=YOUR_CLOUDINARY_API_KEY
cloudinary.api-secret=YOUR_CLOUDINARY_API_SECRET

# SePay Webhook Authentication Key
sepay.api-key=YOUR_SEPAY_STATIC_TOKEN
```

Khởi chạy Spring Boot project qua Maven:

```bash
cd Code/backend/lili-fashion-api
mvn clean spring-boot:run
```

### 3. Cấu hình Frontend

1. Truy cập vào folder frontend:
   ```bash
   cd Code/frontend/app
   ```
2. Tạo file `.env` dựa theo file `.env.example`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
3. Cài đặt các thư viện phụ thuộc và chạy môi trường dev:
   ```bash
   npm install
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ `http://localhost:5173`.
