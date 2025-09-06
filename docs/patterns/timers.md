# Timer Memory Leaks

Timer-based memory leaks are among the most common and dangerous types of memory leaks in JavaScript/Node.js applications. They occur when timers (`setInterval`, `setTimeout`) are not properly cleared, causing continuous memory allocation and preventing garbage collection.

## What are Timer Memory Leaks?

Timer memory leaks happen when:

1. **Intervals/timeouts are created** but never cleared
2. **Timer callbacks reference large objects** that can't be garbage collected
3. **Recursive timers** create infinite chains of timer calls
4. **Anonymous timer functions** capture large closure contexts

## How Timer Leaks Occur

### Example: Uncleaned setInterval

```javascript
// BAD: Timer never cleared
function startDataProcessing() {
    setInterval(() => {
        const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB every second
        processData(largeBuffer);
    }, 1000);
}

startDataProcessing(); // Memory grows by 5MB every second forever
```

### Example: Timer with Closure Context

```javascript
// BAD: Timer captures large context
function processLargeDataset(dataset) {
    const hugeArray = new Array(1000000).fill(dataset);

    setInterval(() => {
        console.log('Processing...'); // Captures hugeArray via closure
    }, 1000);
}
```

## Impact of Timer Leaks

Timer leaks are particularly dangerous because:

- **Continuous Growth**: Memory usage increases linearly over time
- **Predictable Patterns**: Easy to identify in monitoring tools
- **Cascading Effects**: Can trigger other memory issues
- **Application Crashes**: Eventually lead to out-of-memory errors

## Detection Methods

### 1. Memory Monitoring

```bash
# Monitor Node.js memory usage
node --inspect your-app.js

# Check memory growth over time
process.memoryUsage()
```

### 2. Performance Timeline

```javascript
// Track timer creation/cleanup
console.time('timer-leak-test');
const timerId = setInterval(() => {
    // Timer logic
}, 1000);

// Later...
clearInterval(timerId);
console.timeEnd('timer-leak-test');
```

### 3. Process Monitoring

```bash
# Monitor memory usage in production
top -p $(pgrep node)
ps aux | grep node
```

## Prevention Strategies

### 1. Always Clear Timers

```javascript
// GOOD: Proper timer management
class TimerManager {
    constructor() {
        this.timers = new Set();
    }

    createInterval(callback, interval) {
        const timerId = setInterval(callback, interval);
        this.timers.add(timerId);
        return timerId;
    }

    clearTimer(timerId) {
        clearInterval(timerId);
        this.timers.delete(timerId);
    }

    clearAllTimers() {
        this.timers.forEach(timerId => clearInterval(timerId));
        this.timers.clear();
    }
}
```

### 2. Use WeakRef for Large Objects

```javascript
// GOOD: Avoid capturing large objects
function createTimer(largeObject) {
    const weakRef = new WeakRef(largeObject);

    return setInterval(() => {
        const obj = weakRef.deref();
        if (obj) {
            // Process object
        } else {
            // Object was garbage collected
            clearInterval(this);
        }
    }, 1000);
}
```

### 3. Implement Timer Limits

```javascript
// GOOD: Self-limiting timer
function createLimitedTimer(callback, interval, maxRuns = 100) {
    let runs = 0;

    const timerId = setInterval(() => {
        callback();
        runs++;

        if (runs >= maxRuns) {
            clearInterval(timerId);
        }
    }, interval);

    return timerId;
}
```

## Testing Timer Leaks

### Manual Testing

Use our demo API to simulate timer leaks:

```bash
# Start timer leak (5MB/second)
curl http://localhost:3000/timer-leak

# Check active timers
curl http://localhost:3000/timer-leak/status

# Stop all timer leaks
curl http://localhost:3000/timer-leak/stop
```

### Automated Testing

```javascript
// Jest test for timer leaks
describe('Timer Leak Prevention', () => {
    let timerManager;

    beforeEach(() => {
        timerManager = new TimerManager();
    });

    afterEach(() => {
        timerManager.clearAllTimers();
    });

    test('should clean up timers properly', () => {
        const timerId = timerManager.createInterval(() => {}, 100);
        expect(timerManager.timers.size).toBe(1);

        timerManager.clearTimer(timerId);
        expect(timerManager.timers.size).toBe(0);
    });
});
```

## Best Practices

### 1. Timer Lifecycle Management

- **Always pair** `setInterval` with `clearInterval`
- **Track timer IDs** in arrays or sets
- **Clear timers** in cleanup functions
- **Use try/finally** blocks for guaranteed cleanup

### 2. Avoid Large Closures

```javascript
// BAD: Large closure context
function createTimer(largeData) {
    return setInterval(() => {
        console.log(largeData.length); // Captures entire largeData
    }, 1000);
}

// GOOD: Extract needed values
function createTimer(largeData) {
    const dataLength = largeData.length; // Extract only what's needed
    return setInterval(() => {
        console.log(dataLength);
    }, 1000);
}
```

### 3. Use Modern Alternatives

```javascript
// Modern: AbortController for cancellation
function createCancellableTimer(callback, interval) {
    const controller = new AbortController();

    const timer = setInterval(callback, interval);

    controller.signal.addEventListener('abort', () => {
        clearInterval(timer);
    });

    return controller;
}

// Usage
const controller = createCancellableTimer(() => {}, 1000);
// Later: controller.abort();
```

## Related Topics

- [Global Variable Leaks](./global-variables.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Try the interactive timer leak demo in our [NestJS Demo](../demos/nestjs.md) to see these concepts in action.
