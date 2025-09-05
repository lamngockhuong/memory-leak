# Java Memory Leak Demo

> 🚧 **Coming Soon** - This demo is under development

## Overview

The Java demo will provide examples and tools for detecting and preventing memory leaks in Java applications, including:

## Planned Features

### Common Java Memory Leak Patterns

- **Static Collections**: Collections that grow without bounds
- **Listeners & Callbacks**: Event listeners not properly removed
- **Thread Local Variables**: ThreadLocal variables not cleaned up
- **ClassLoader Leaks**: Classes not properly unloaded
- **JDBC Resources**: Unclosed connections, statements, and result sets
- **JNI Memory Leaks**: Native memory not freed

### Demo Application

- Spring Boot REST API with leak simulation endpoints
- JVM monitoring integration (JVisualVM, JProfiler)
- Heap dump generation and analysis
- Memory leak detection tools

### Technologies

- **Framework**: Spring Boot 3.x
- **Build Tool**: Maven or Gradle
- **Monitoring**: Micrometer, Actuator
- **Testing**: JUnit 5, TestContainers

## Quick Start (When Available)

```bash
cd java/spring-boot-demo
./mvnw spring-boot:run
```

## Related Resources

- [Java Memory Management Guide](../languages/java.md)
- [JVM Memory Leak Patterns](../patterns/jvm-leaks.md)

---

📝 **Want to contribute?** This demo is part of our roadmap. Check out our [contributing guide](../../CONTRIBUTING.md) to help build this demo.
