# Memory Leak Guide

[![Documentation](https://img.shields.io/badge/docs-live-brightgreen)](https://memory-leak.khuong.dev/)
[![Language](https://img.shields.io/badge/languages-JS%20%7C%20TS%20%7C%20Java%20%7C%20Go%20%7C%20Kotlin-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

A comprehensive guide and demo project to understand, detect, and prevent memory leaks across multiple programming languages.

## 🎯 Overview

This project provides:

- **📚 Comprehensive documentation** on memory leak patterns and prevention
- **🛠️ Production-ready NestJS demo** with 5 memory leak patterns
- **🐳 Docker support** with optimized multi-stage builds
- **🔧 REST API endpoints** for interactive leak simulation
- **📊 Bruno API testing** for automated leak detection
- **🎯 Heap dump generation** via API and signals
- **📈 Memory monitoring** with real-time statistics
- **🛡️ Best practices** for production monitoring and prevention

## 🌐 Documentation

Visit our comprehensive guide: **[https://memory-leak.khuong.dev/](https://memory-leak.khuong.dev/)**

Available in:

- 🇺🇸 [English](https://memory-leak.khuong.dev/)
- 🇻🇳 [Tiếng Việt](https://memory-leak.khuong.dev/vi/)

## 🚀 Quick Start

### JavaScript/TypeScript (Node.js) - Available Now ✅

```bash
cd nodejs/nestjs-demo
pnpm install
pnpm run start:dev

# Test memory leak patterns via REST API
curl -X POST http://localhost:3000/memory-leak/timer/start
curl -X POST http://localhost:3000/memory-leak/cache/start
curl -X POST http://localhost:3000/memory-leak/global-variable/start

# Check status
curl http://localhost:3000/memory-leak/status

# Generate heap dump for analysis
curl -X POST http://localhost:3000/internal/debug/heapdump
```

### Docker Support

```bash
cd nodejs/nestjs-demo
docker-compose up -d

# Access APIs at http://localhost:3000
# Copy heap dumps: docker cp memory-leak-app:/app/heapdumps ./local-heapdumps
```

### Java (Coming Soon) 🚧

```bash
cd java/demo
./gradlew run
```

### Go (Coming Soon) 🚧

```bash
cd go/demo
go run main.go
```

### Kotlin (Coming Soon) 🚧

```bash
cd kotlin/demo
./gradlew run
```

## 📁 Project Structure

```text
memory-leak/
├── docs/                           # Documentation website (VitePress)
│   ├── .vitepress/                # VitePress configuration
│   ├── introduction/              # Basic concepts and theory
│   ├── patterns/                  # Common memory leak patterns
│   ├── languages/                 # Language-specific guides
│   ├── tools/                     # Detection and analysis tools
│   ├── demos/                     # Demo project documentation
│   └── vi/                        # Vietnamese documentation
├── nodejs/                         # Node.js/TypeScript demos ✅
│   └── nestjs-demo/               # NestJS REST API with leak examples
│       ├── src/
│       │   ├── modules/
│       │   │   ├── memory-leak/   # Memory leak demonstration module
│       │   │   │   ├── memory-leak.controller.ts  # REST API endpoints
│       │   │   │   ├── patterns/                  # Individual leak services
│       │   │   │   │   ├── timer.service.ts       # Timer leak patterns
│       │   │   │   │   ├── cache.service.ts       # Cache leak patterns
│       │   │   │   │   ├── closure.service.ts     # Closure leak patterns
│       │   │   │   │   ├── event.service.ts       # Event listener leaks
│       │   │   │   │   └── global-variable.service.ts
│       │   │   │   └── types.ts                   # TypeScript interfaces
│       │   │   └── debug/                         # Debugging utilities
│       │   │       ├── debug.controller.ts        # Heap dump endpoints
│       │   │       └── health.controller.ts       # Health checks
│       │   └── utils/                             # Core leak implementations
│       │       ├── leak-timer.ts                  # Timer leak logic
│       │       ├── leak-cache.ts                  # Cache leak logic
│       │       ├── leak-closure.ts                # Closure leak logic
│       │       ├── leak-event.ts                  # Event leak logic
│       │       ├── leak-global.ts                 # Global variable leaks
│       │       └── heapdump.ts                    # Heap dump utilities
│       ├── test/bruno/                            # API test collections
│       ├── heapdumps/                            # Generated heap dumps
│       ├── Dockerfile                            # Docker configuration
│       └── docker-compose.yml                    # Docker Compose setup
├── java/                          # Java demo applications (planned) 🚧
├── kotlin/                        # Kotlin demo applications (planned) 🚧
├── go/                           # Go demo applications (planned) 🚧
└── README.md
```

## 💡 What You'll Learn

### Memory Leak Patterns (Available in NestJS Demo)

- **Timer Leaks** ✅ - setTimeout/setInterval objects that accumulate without cleanup
- **Cache Leaks** ✅ - Unlimited cache growth without eviction policy (~8MB per entry)
- **Closure Leaks** ✅ - Functions capturing large contexts (10MB buffers)
- **Event Listener Leaks** ✅ - EventEmitter listeners with large closure data (8MB per listener)
- **Global Variable Leaks** ✅ - Objects attached to global scope that grow indefinitely

### REST API Endpoints

Each pattern provides consistent endpoints:

```bash
POST /memory-leak/{pattern}/start  # Start the leak simulation
POST /memory-leak/{pattern}/stop   # Stop and cleanup resources
GET  /memory-leak/{pattern}/status # Get current statistics
GET  /memory-leak/status           # Overview of all patterns
```

### Detection Techniques

- **Heap Dump Generation** ✅ - REST API and USR2 signal support
- **Memory Monitoring** ✅ - Built-in process.memoryUsage() tracking
- **API Testing** ✅ - Bruno test collections for automated testing
- **Docker Integration** ✅ - Containerized environment for consistent testing
- **Production Monitoring** ✅ - Health checks and readiness probes

### Analysis Tools Integration

- **Chrome DevTools** - Heap dump analysis (.heapsnapshot files)
- **Node.js Built-in** - process.memoryUsage() monitoring
- **Bruno API Client** - Comprehensive test automation
- **Docker Commands** - Container-based debugging workflow

### Language-Specific Guides

- **JavaScript/TypeScript** ✅ - Complete Node.js implementation with NestJS
- **Java** 🚧 - JVM memory management and tools (planned)
- **Kotlin** 🚧 - Both JVM and Native considerations (planned)
- **Go** 🚧 - Goroutines and garbage collection (planned)

## 🐳 Docker Features

- **Multi-stage builds** - Optimized production images (177MB)
- **Heap dump collection** - `docker cp` for analysis files
- **Health checks** - Built-in readiness and liveness probes
- **Resource limits** - Memory and CPU constraints for safety
- **Signal handling** - USR2 for heap dump generation

## 🤝 Contributing

We welcome contributions! Whether it's:

- 📝 Improving documentation
- 🐛 Fixing bugs in demo applications
- 💡 Adding new memory leak patterns
- 🌐 Translating content
- 🛠️ Adding support for new languages

Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
