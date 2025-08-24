# Getting Started

Welcome to the Memory Leak Guide - your comprehensive resource for understanding, detecting, and preventing memory leaks across multiple programming languages.

## What You'll Learn

This guide covers memory leak patterns and prevention techniques for:

- **JavaScript/TypeScript** - Browser and Node.js environments
- **Java** - JVM-based applications
- **Kotlin** - Native and JVM applications
- **Go** - Garbage-collected Go applications

## Quick Start

### 1. Understanding the Basics

Start with our [Introduction section](/introduction/what-is-memory-leak) to understand:
- What memory leaks are
- Why they matter for your applications
- Common patterns that cause leaks

### 2. Choose Your Language

Navigate to the language-specific guide that matches your project:

- [JavaScript/TypeScript Guide](/languages/javascript)
- [Java Guide](/languages/java)
- [Kotlin Guide](/languages/kotlin)
- [Go Guide](/languages/go)

### 3. Explore Demo Projects

Our repository includes hands-on demo projects that showcase real memory leak scenarios:

- [NestJS Demo](/demos/nestjs) - Node.js/TypeScript memory leaks
- [Java Demo](/demos/java) - JVM memory management
- [Go Demo](/demos/go) - Goroutine and memory leaks
- [Kotlin Demo](/demos/kotlin) - Kotlin-specific patterns

### 4. Set Up Detection Tools

Learn how to use profiling and monitoring tools:

- [Browser Developer Tools](/tools/browser-devtools)
- [Node.js Profiling Tools](/tools/nodejs-profiling)
- [Java Profiling Tools](/tools/java-tools)
- [Go Profiling Tools](/tools/go-tools)

## Repository Structure

```
memory-leak/
├── docs/                 # Documentation (this site)
├── nodejs/              # Node.js/TypeScript demos
│   └── nestjs-demo/     # NestJS application with leak examples
├── java/                # Java demo applications
├── kotlin/              # Kotlin demo applications
├── go/                  # Go demo applications
└── README.md
```

## Prerequisites

To follow along with the demos, you'll need:

- **Node.js** (v18+) for JavaScript/TypeScript examples
- **Java JDK** (11+) for Java examples
- **Go** (1.19+) for Go examples
- **Kotlin** (1.8+) for Kotlin examples

## Next Steps

1. **Beginners**: Start with [What is Memory Leak?](/introduction/what-is-memory-leak)
2. **Experienced developers**: Jump to [Detection Strategies](/detection/strategies)
3. **Hands-on learners**: Explore our [Demo Projects](/demos/nestjs)
4. **Tool-focused**: Check out [Profiling Tools](/detection/profiling-tools)

## Community and Support

- 📖 **Documentation**: Browse this comprehensive guide
- 🐛 **Issues**: Report bugs or request features on [GitHub](https://github.com/lamngockhuong/memory-leak/issues)
- 💬 **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/lamngockhuong/memory-leak/discussions)

Ready to dive in? Let's start with understanding [what memory leaks are](/introduction/what-is-memory-leak)!
