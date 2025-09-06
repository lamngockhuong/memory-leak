# Hướng dẫn Memory Leak

[![Documentation](https://img.shields.io/badge/docs-live-brightgreen)](https://memory-leak.khuong.dev/)
[![Language](https://img.shields.io/badge/languages-JS%20%7C%20TS%20%7C%20Java%20%7C%20Go%20%7C%20Kotlin-blue)](https://memory-leak.khuong.dev/languages/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Hướng dẫn toàn diện và dự án demo để hiểu, phát hiện và ngăn chặn memory leak trên nhiều ngôn ngữ lập trình.

## 🎯 Tổng quan

Dự án này cung cấp:

- **📚 Tài liệu toàn diện** về các pattern memory leak và cách phòng chống
- **🛠️ Demo NestJS production-ready** với 5 pattern memory leak
- **🐳 Hỗ trợ Docker** với multi-stage builds được tối ưu
- **🔧 REST API endpoints** cho việc mô phỏng leak tương tác
- **📊 Kiểm thử Bruno API** cho việc phát hiện leak tự động
- **🎯 Tạo heap dump** thông qua API và signals
- **📈 Giám sát bộ nhớ** với thống kê thời gian thực
- **🛡️ Best practices** cho giám sát và phòng chống trong production

## 🌐 Tài liệu

Truy cập hướng dẫn toàn diện của chúng tôi: **[https://memory-leak.khuong.dev/](https://memory-leak.khuong.dev/)**

Có sẵn bằng:

- 🇺🇸 [Tiếng Anh](https://memory-leak.khuong.dev/)
- 🇻🇳 [Tiếng Việt](https://memory-leak.khuong.dev/vi/)

## 🚀 Bắt đầu nhanh

### JavaScript/TypeScript (Node.js) - Có sẵn ngay ✅

```bash
cd nodejs/nestjs-demo
pnpm install
pnpm run start:dev

# Test các pattern memory leak thông qua REST API
curl -X POST http://localhost:3000/memory-leak/timer/start
curl -X POST http://localhost:3000/memory-leak/cache/start
curl -X POST http://localhost:3000/memory-leak/global-variable/start

# Kiểm tra trạng thái
curl http://localhost:3000/memory-leak/status

# Tạo heap dump để phân tích
curl -X POST http://localhost:3000/debug/heapdump
```

### Hỗ trợ Docker

```bash
cd nodejs/nestjs-demo
docker-compose up -d

# Truy cập APIs tại http://localhost:3000
# Copy heap dumps: docker cp memory-leak-app:/app/heapdumps ./local-heapdumps
```

### Java (Sắp ra mắt) 🚧

```bash
cd java/demo
./gradlew run
```

### Go (Sắp ra mắt) 🚧

```bash
cd go/demo
go run main.go
```

### Kotlin (Sắp ra mắt) 🚧

```bash
cd kotlin/demo
./gradlew run
```

## 📁 Cấu trúc dự án

```text
memory-leak/
├── docs/                           # Website tài liệu (VitePress)
│   ├── .vitepress/                # Cấu hình VitePress
│   ├── introduction/              # Khái niệm cơ bản và lý thuyết
│   ├── patterns/                  # Các pattern memory leak phổ biến
│   ├── languages/                 # Hướng dẫn theo ngôn ngữ
│   ├── tools/                     # Công cụ phát hiện và phân tích
│   ├── demos/                     # Tài liệu dự án demo
│   └── vi/                        # Tài liệu tiếng Việt
├── nodejs/                         # Demo Node.js/TypeScript ✅
│   └── nestjs-demo/               # NestJS REST API với ví dụ leak
│       ├── src/
│       │   ├── modules/
│       │   │   ├── memory-leak/   # Module demo memory leak
│       │   │   │   ├── memory-leak.controller.ts  # REST API endpoints
│       │   │   │   ├── patterns/                  # Các service leak riêng lẻ
│       │   │   │   │   ├── timer.service.ts       # Pattern timer leak
│       │   │   │   │   ├── cache.service.ts       # Pattern cache leak
│       │   │   │   │   ├── closure.service.ts     # Pattern closure leak
│       │   │   │   │   ├── event.service.ts       # Event listener leaks
│       │   │   │   │   └── global-variable.service.ts
│       │   │   │   └── types.ts                   # TypeScript interfaces
│       │   │   └── debug/                         # Tiện ích debugging
│       │   │       ├── debug.controller.ts        # Heap dump endpoints
│       │   │       └── health.controller.ts       # Health checks
│       │   └── utils/                             # Core leak implementations
│       │       ├── leak-timer.ts                  # Logic timer leak
│       │       ├── leak-cache.ts                  # Logic cache leak
│       │       ├── leak-closure.ts                # Logic closure leak
│       │       ├── leak-event.ts                  # Logic event leak
│       │       ├── leak-global.ts                 # Global variable leaks
│       │       └── heapdump.ts                    # Tiện ích heap dump
│       ├── test/bruno/                            # Bộ sưu tập API test
│       ├── heapdumps/                            # Heap dumps được tạo
│       ├── Dockerfile                            # Cấu hình Docker
│       └── docker-compose.yml                    # Thiết lập Docker Compose
├── java/                          # Ứng dụng demo Java (dự kiến) 🚧
├── kotlin/                        # Ứng dụng demo Kotlin (dự kiến) 🚧
├── go/                           # Ứng dụng demo Go (dự kiến) 🚧
└── README.md
```

## 💡 Bạn sẽ học được gì

### Các Pattern Memory Leak (Có sẵn trong NestJS Demo)

- **Timer Leaks** ✅ - Các object setTimeout/setInterval tích lũy mà không được dọn dẹp
- **Cache Leaks** ✅ - Cache tăng trưởng không giới hạn mà không có chính sách loại bỏ (~8MB mỗi entry)
- **Closure Leaks** ✅ - Functions capture large contexts (10MB buffers)
- **Event Listener Leaks** ✅ - EventEmitter listeners với large closure data (8MB mỗi listener)
- **Global Variable Leaks** ✅ - Objects gắn vào global scope tăng trưởng vô hạn

### REST API Endpoints

Mỗi pattern cung cấp các endpoints nhất quán:

```bash
POST /memory-leak/{pattern}/start  # Bắt đầu mô phỏng leak
POST /memory-leak/{pattern}/stop   # Dừng và dọn dẹp resources
GET  /memory-leak/{pattern}/status # Lấy thống kê hiện tại
GET  /memory-leak/status           # Tổng quan tất cả patterns
```

### Kỹ thuật phát hiện

- **Tạo Heap Dump** ✅ - Hỗ trợ REST API và USR2 signal
- **Giám sát bộ nhớ** ✅ - Theo dõi process.memoryUsage() tích hợp
- **Kiểm thử API** ✅ - Bộ sưu tập test Bruno cho kiểm thử tự động
- **Tích hợp Docker** ✅ - Môi trường container cho kiểm thử nhất quán
- **Giám sát Production** ✅ - Health checks và readiness probes

### Tích hợp công cụ phân tích

- **Chrome DevTools** - Phân tích heap dump (files .heapsnapshot)
- **Node.js Built-in** - Giám sát process.memoryUsage()
- **Bruno API Client** - Tự động hóa kiểm thử toàn diện
- **Docker Commands** - Workflow debugging dựa trên container

### Hướng dẫn theo ngôn ngữ

- **JavaScript/TypeScript** ✅ - Implementation Node.js hoàn chỉnh với NestJS
- **Java** 🚧 - Quản lý bộ nhớ JVM và công cụ (dự kiến)
- **Kotlin** 🚧 - Cả JVM và Native considerations (dự kiến)
- **Go** 🚧 - Goroutines và garbage collection (dự kiến)

## 🐳 Tính năng Docker

- **Multi-stage builds** - Images production được tối ưu (177MB)
- **Thu thập heap dump** - `docker cp` cho files phân tích
- **Health checks** - Readiness và liveness probes tích hợp
- **Resource limits** - Ràng buộc memory và CPU để an toàn
- **Signal handling** - USR2 để tạo heap dump

## 🤝 Đóng góp

Chúng tôi hoan nghênh sự đóng góp! Có thể là:

- 📝 Cải thiện tài liệu
- 🐛 Sửa bugs trong ứng dụng demo
- 💡 Thêm pattern memory leak mới
- 🌐 Dịch nội dung
- 🛠️ Thêm hỗ trợ cho ngôn ngữ mới

Vui lòng xem [Hướng dẫn đóng góp](CONTRIBUTING.md) để biết chi tiết.

## 📄 Giấy phép

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.
