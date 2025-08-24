# Hướng dẫn bắt đầu

Chào mừng đến với Hướng dẫn Memory Leak - tài nguyên toàn diện giúp bạn hiểu, phát hiện và ngăn chặn rò rỉ bộ nhớ trong nhiều ngôn ngữ lập trình.

## Bạn sẽ học được gì

Hướng dẫn này bao gồm các mẫu rò rỉ bộ nhớ và kỹ thuật phòng ngừa cho:

- **JavaScript/TypeScript** - Môi trường trình duyệt và Node.js
- **Java** - Ứng dụng dựa trên JVM
- **Kotlin** - Ứng dụng Native và JVM
- **Go** - Ứng dụng Go có garbage collection

## Bắt đầu nhanh

### 1. Hiểu về cơ bản

Bắt đầu với [phần Giới thiệu](/vi/introduction/what-is-memory-leak) để hiểu:

- Memory leak là gì
- Tại sao chúng quan trọng đối với ứng dụng của bạn
- Các mẫu phổ biến gây ra rò rỉ

### 2. Chọn ngôn ngữ của bạn

Chuyển đến hướng dẫn theo ngôn ngữ phù hợp với dự án của bạn:

- [Hướng dẫn JavaScript/TypeScript](/vi/languages/javascript)
- [Hướng dẫn Java](/vi/languages/java)
- [Hướng dẫn Kotlin](/vi/languages/kotlin)
- [Hướng dẫn Go](/vi/languages/go)

### 3. Khám phá các dự án Demo

Repository của chúng tôi bao gồm các dự án demo thực tế giới thiệu các tình huống rò rỉ bộ nhớ thực tế:

- [NestJS Demo](/vi/demos/nestjs) - Rò rỉ bộ nhớ Node.js/TypeScript
- [Java Demo](/vi/demos/java) - Quản lý bộ nhớ JVM
- [Go Demo](/vi/demos/go) - Goroutine và rò rỉ bộ nhớ
- [Kotlin Demo](/vi/demos/kotlin) - Các mẫu đặc thù của Kotlin

### 4. Thiết lập công cụ phát hiện

Tìm hiểu cách sử dụng các công cụ profiling và monitoring:

- [Browser Developer Tools](/vi/tools/browser-devtools)
- [Node.js Profiling Tools](/vi/tools/nodejs-profiling)
- [Java Profiling Tools](/vi/tools/java-tools)
- [Go Profiling Tools](/vi/tools/go-tools)

## Cấu trúc Repository

```text
memory-leak/
├── docs/                 # Tài liệu (trang web này)
├── nodejs/              # Demo Node.js/TypeScript
│   └── nestjs-demo/     # Ứng dụng NestJS với ví dụ rò rỉ
├── java/                # Ứng dụng demo Java
├── kotlin/              # Ứng dụng demo Kotlin
├── go/                  # Ứng dụng demo Go
└── README.md
```

## Yêu cầu tiên quyết

Để theo dõi các demo, bạn cần:

- **Node.js** (v18+) cho ví dụ JavaScript/TypeScript
- **Java JDK** (11+) cho ví dụ Java
- **Go** (1.19+) cho ví dụ Go
- **Kotlin** (1.8+) cho ví dụ Kotlin

## Các bước tiếp theo

1. **Người mới bắt đầu**: Bắt đầu với [Memory Leak là gì?](/vi/introduction/what-is-memory-leak)
2. **Lập trình viên có kinh nghiệm**: Chuyển đến [Chiến lược phát hiện](/vi/detection/strategies)
3. **Người học thực hành**: Khám phá [Dự án Demo](/vi/demos/nestjs)
4. **Tập trung vào công cụ**: Xem [Công cụ Profiling](/vi/detection/profiling-tools)

## Cộng đồng và hỗ trợ

- 📖 **Tài liệu**: Duyệt qua hướng dẫn toàn diện này
- 🐛 **Issues**: Báo cáo lỗi hoặc yêu cầu tính năng trên [GitHub](https://github.com/lamngockhuong/memory-leak/issues)
- 💬 **Thảo luận**: Tham gia cuộc trò chuyện trong [GitHub Discussions](https://github.com/lamngockhuong/memory-leak/discussions)

Sẵn sàng để bắt đầu? Hãy bắt đầu với việc hiểu [memory leak là gì](/vi/introduction/what-is-memory-leak)!
