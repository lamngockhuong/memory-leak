# Memory Leak Guide

[![Documentation](https://img.shields.io/badge/docs-live-brightgreen)](https://lamngockhuong.github.io/memory-leak/)
[![Language](https://img.shields.io/badge/languages-JS%20%7C%20Java%20%7C%20Go%20%7C%20Kotlin-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

A comprehensive guide and demo project to understand, detect, and prevent memory leaks across multiple programming languages.

## 🎯 Overview

This project provides:

- **📚 Comprehensive documentation** on memory leak patterns and prevention
- **🛠️ Hands-on demo applications** in JavaScript/TypeScript, Java, Kotlin, and Go
- **🔧 Real-world tools and utilities** for memory leak detection
- **📊 Best practices** for production monitoring and prevention

## 🌐 Documentation

Visit our comprehensive guide: **[https://lamngockhuong.github.io/memory-leak/](https://lamngockhuong.github.io/memory-leak/)**

Available in:

- 🇺🇸 [English](https://lamngockhuong.github.io/memory-leak/)
- 🇻🇳 [Tiếng Việt](https://lamngockhuong.github.io/memory-leak/vi/)

## 🚀 Quick Start

### JavaScript/TypeScript (Node.js)

```bash
cd nodejs/nestjs-demo
pnpm install
HEAPDUMP_ENABLED=1 pnpm run start:dev

# Trigger a memory leak
curl -X POST http://localhost:3000/global-variable-leak
```

### Java (Coming Soon)

```bash
cd java/demo
./gradlew run
```

### Go (Coming Soon)

```bash
cd go/demo
go run main.go
```

### Kotlin (Coming Soon)

```bash
cd kotlin/demo
./gradlew run
```

## 📁 Project Structure

```
memory-leak/
├── docs/                    # Documentation website (VitePress)
│   ├── .vitepress/         # VitePress configuration
│   ├── introduction/       # Basic concepts
│   ├── patterns/           # Common leak patterns
│   ├── languages/          # Language-specific guides
│   ├── tools/              # Detection and analysis tools
│   ├── demos/              # Demo project documentation
│   └── vi/                 # Vietnamese documentation
├── nodejs/                  # Node.js/TypeScript demos
│   └── nestjs-demo/        # NestJS application with leak examples
│       ├── src/utils/      # Memory leak utilities
│       │   ├── leak-global.ts      # Global variable leaks
│       │   ├── leak-closure.ts     # Closure leaks
│       │   ├── leak-event.ts       # Event listener leaks
│       │   ├── leak-timer.ts       # Timer leaks
│       │   ├── leak-cache.ts       # Cache leaks
│       │   └── heapdump.ts         # Heap dump utilities
│       └── test/bruno/     # API test collections
├── java/                   # Java demo applications (planned)
├── kotlin/                 # Kotlin demo applications (planned)
├── go/                     # Go demo applications (planned)
└── README.md
```

## 💡 What You'll Learn

### Memory Leak Patterns

- **Global Variables** - Variables that accumulate data without bounds
- **Event Listeners** - Unremoved listeners preventing garbage collection
- **Closures** - Functions capturing large contexts unintentionally
- **Timers & Intervals** - Periodic tasks that never clean up
- **Caching** - Caches that grow without limits
- **DOM References** - Detached DOM nodes still referenced in JavaScript

### Detection Techniques

- **Heap Dump Analysis** - Taking and analyzing memory snapshots
- **Profiling Tools** - Using browser DevTools and Node.js profilers
- **Memory Monitoring** - Setting up production monitoring
- **Automated Testing** - Writing tests to catch memory leaks

### Language-Specific Guides

- **JavaScript/TypeScript** - Browser and Node.js environments
- **Java** - JVM memory management and tools
- **Kotlin** - Both JVM and Native considerations
- **Go** - Goroutines and garbage collection

## 🛠️ Featured Tools

### NestJS Demo Features

- **Multiple leak patterns** with real examples
- **Heap dump utilities** for memory analysis
- **Production-ready monitoring** examples
- **API endpoints** to trigger leaks manually
- **Bruno API tests** for automated testing

### Heap Dump Utilities

```typescript
import { Heapdump } from './utils/heapdump';

// Take a single snapshot
await Heapdump.writeSnapshot('analysis');

// Compare multiple snapshots
const files = await Heapdump.snapEvery(3, {
  intervalMs: 5000,
  beforeGc: true
});

// Continuous monitoring
const controller = Heapdump.startAutoSnapshot({
  intervalMs: 10000,
  label: 'monitoring'
});
```

## 📊 Demo Examples

### Global Variable Leak

```typescript
// This will cause an OOM crash!
global.leakedArray = [];

export function leakMemory(): void {
  const largeArray = new Array(1e6).fill('leak');
  global.leakedArray.push(largeArray);
  console.log('Leaked 1MB+');
}

setInterval(leakMemory, 1000);
```

### Event Listener Leak

```typescript
const emitter = new EventEmitter();

function createListener() {
  const bigData = new Array(1e6).fill('event');
  return () => console.log('Data length:', bigData.length);
}

// This accumulates listeners without cleanup
setInterval(() => {
  emitter.on('data', createListener());
}, 1000);
```

## 🎓 Learning Path

1. **Start with basics**: [What is Memory Leak?](https://lamngockhuong.github.io/memory-leak/introduction/what-is-memory-leak)
2. **Understand patterns**: [Common Leak Patterns](https://lamngockhuong.github.io/memory-leak/patterns/global-variables)
3. **Learn detection**: [Detection Strategies](https://lamngockhuong.github.io/memory-leak/detection/strategies)
4. **Practice with demos**: [NestJS Demo](https://lamngockhuong.github.io/memory-leak/demos/nestjs)
5. **Apply best practices**: [Prevention & Monitoring](https://lamngockhuong.github.io/memory-leak/best-practices/prevention)

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

## 🙏 Acknowledgments

- **V8 Engine Team** for excellent memory profiling tools
- **Chrome DevTools Team** for memory analysis capabilities
- **NestJS Community** for the robust framework used in our demos
- **Open Source Community** for the tools and libraries that made this project possible

---

**Ready to dive deep into memory management?** Start with our [comprehensive guide](https://lamngockhuong.github.io/memory-leak/) or jump straight into the [NestJS demo](./nodejs/nestjs-demo/) to see memory leaks in action!
