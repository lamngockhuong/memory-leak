# Common Memory Leak Patterns

This section covers the most common memory leak patterns found across different programming languages and environments. Understanding these patterns is crucial for both preventing and detecting memory leaks in your applications.

## Overview

Memory leaks often follow predictable patterns. By learning to recognize these patterns, you can:

- **Prevent leaks** during development
- **Identify suspicious code** during code reviews
- **Debug existing leaks** more effectively
- **Design better architectures** that avoid common pitfalls

## Pattern Categories

### 📊 Data Structure Leaks
- [Global Variables](/patterns/global-variables) - Variables that persist and accumulate data
- [Caching](/patterns/caching) - Caches that grow without bounds

### 🎯 Event & Callback Leaks
- [Event Listeners](/patterns/event-listeners) - Unremoved event handlers
- [Closures](/patterns/closures) - Functions capturing large contexts

### ⏰ Time-based Leaks
- [Timers & Intervals](/patterns/timers) - Periodic tasks without cleanup

### 🌐 DOM & UI Leaks
- [DOM References](/patterns/dom-references) - Detached DOM nodes still referenced

## Pattern Comparison

| Pattern | Severity | Detection Difficulty | Common Languages |
|---------|----------|---------------------|------------------|
| Global Variables | High | Easy | All |
| Event Listeners | Medium | Medium | JS, Java, C# |
| Closures | Medium | Hard | JS, Python, Ruby |
| Timers | Low | Easy | All |
| Caching | High | Medium | All |
| DOM References | Medium | Medium | JS (Browser) |

## How to Use This Section

1. **Start with your environment**: If you're working with JavaScript, focus on DOM References and Event Listeners first
2. **Learn the patterns**: Each pattern page includes examples of both problematic and correct code
3. **Practice with demos**: Use our demo applications to see these patterns in action
4. **Apply detection techniques**: Learn to spot these patterns using profiling tools

## Quick Pattern Recognition

### 🚨 Red Flags in Code

```javascript
// Global variables that grow
window.dataCache = [];
global.connections = {};

// Event listeners without removal
element.addEventListener('click', handler);
// Missing: element.removeEventListener('click', handler);

// Timers without cleanup
setInterval(() => { /* ... */ }, 1000);
// Missing: clearInterval(intervalId);

// Unbounded collections
const cache = {};
cache[key] = value; // Never removed

// Closures capturing large objects
function createHandler(largeObject) {
  return function() {
    // Uses largeObject but also captures it entirely
  };
}
```

### ✅ Good Patterns

```javascript
// Bounded global variables
const DataCache = {
  data: [],
  maxSize: 1000,
  add(item) {
    this.data.push(item);
    if (this.data.length > this.maxSize) {
      this.data.shift();
    }
  }
};

// Proper event cleanup
function setupComponent() {
  const handler = () => { /* ... */ };
  element.addEventListener('click', handler);

  return () => {
    element.removeEventListener('click', handler);
  };
}

// Timer with cleanup
function startPolling() {
  const interval = setInterval(() => { /* ... */ }, 1000);

  return () => clearInterval(interval);
}
```

## Language-Specific Considerations

### JavaScript/TypeScript
- **DOM references** are unique to browser environments
- **Closures** are very common and easy to create accidentally
- **Event listeners** are everywhere in web development

### Java/Kotlin
- **Collection leaks** are very common
- **Listener patterns** (Observer pattern) often leak
- **ThreadLocal** variables need explicit cleanup

### Go
- **Goroutine leaks** are the most common
- **Channel leaks** when channels aren't closed
- **Global variables** similar to other languages

## Detection Strategy by Pattern

### Global Variables
- Monitor global object size over time
- Use linting rules to catch implicit globals
- Regular auditing of global namespace

### Event Listeners
- Track listener registration/removal
- Use WeakMap for automatic cleanup
- Audit component lifecycle methods

### Closures
- Profile memory during function creation
- Use heap snapshots to find retained objects
- Minimize closure scope

### Timers
- Track timer creation/cleanup ratios
- Use development warnings for uncleaned timers
- Implement timeout patterns

## Next Steps

1. **Choose a pattern** that's relevant to your current work
2. **Read the detailed guide** for that pattern
3. **Try the examples** in our demo applications
4. **Apply detection techniques** using our tools guides
5. **Implement prevention** using our best practices

## Related Resources

- [Detection Strategies](/detection/strategies) - How to find these patterns
- [Language-Specific Guides](/languages/javascript) - Deep dives by programming language
- [Demo Applications](/demos/nestjs) - Hands-on practice with real examples
- [Best Practices](/best-practices/prevention) - How to avoid these patterns
