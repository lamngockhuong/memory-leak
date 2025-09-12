# Timer Memory Leaks

Timer-based memory leaks are among the most common and dangerous types of memory leaks across programming languages. They occur when timers, periodic tasks, or scheduled operations are not properly managed, causing continuous memory allocation and preventing garbage collection.

## What are Timer Memory Leaks?

Timer memory leaks happen when:

1. **Timers/scheduled tasks are created** but never stopped or cleared
2. **Timer callbacks reference large objects** that can't be garbage collected
3. **Recursive timers** create infinite chains of timer calls
4. **Timer contexts capture large data** preventing memory cleanup

## Language-Specific Timer Mechanisms

### JavaScript/Node.js

- `setInterval()`, `setTimeout()`
- Web APIs: `requestAnimationFrame()`
- Node.js: `setImmediate()`

### Java

- `java.util.Timer`, `TimerTask`
- `ScheduledExecutorService`
- Spring `@Scheduled` annotations

### Python

- `threading.Timer`
- `asyncio` scheduled tasks
- `APScheduler` (Advanced Python Scheduler)

### Go

- `time.Timer`, `time.Ticker`
- Goroutines with `time.Sleep()`
- `context.WithTimeout()`

### C#/.NET

- `System.Timers.Timer`
- `System.Threading.Timer`
- `Task.Delay()` with cancellation tokens

## How Timer Leaks Occur

### JavaScript/Node.js Example

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

### Java Example

```java
// BAD: Timer not properly cancelled
public class DataProcessor {
    private Timer timer = new Timer();

    public void startProcessing() {
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                byte[] largeData = new byte[5 * 1024 * 1024]; // 5MB
                processData(largeData);
                // largeData referenced by timer, can't be GC'd
            }
        }, 0, 1000);
    }
    // Missing: timer.cancel() in cleanup
}
```

### Python Example

```python
# BAD: Timer not properly cancelled
import threading
import time

def start_processing():
    large_data = bytearray(5 * 1024 * 1024)  # 5MB

    def process():
        # large_data captured in closure, preventing GC
        print(f"Processing {len(large_data)} bytes")
        # Schedule next execution
        timer = threading.Timer(1.0, process)
        timer.start()  # Never cancelled!

    process()
```

### Go Example

```go
// BAD: Ticker not properly stopped
package main

import (
    "time"
)

func startProcessing() {
    ticker := time.NewTicker(1 * time.Second)
    largeData := make([]byte, 5*1024*1024) // 5MB

    go func() {
        for range ticker.C {
            processData(largeData) // largeData never released
        }
    }()
    // Missing: ticker.Stop()
}
```

### Timer with Closure Context

```javascript
// BAD: Timer captures large context (JavaScript example)
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

**Node.js:**

```bash
node --inspect your-app.js
process.memoryUsage()
```

**Java:**

```bash
jstat -gc <pid>
jmap -histo <pid>
```

**Python:**

```python
import psutil
process = psutil.Process()
print(process.memory_info())
```

**Go:**

```go
import "runtime"
var m runtime.MemStats
runtime.GC()
runtime.ReadMemStats(&m)
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

**JavaScript:**

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

**Java:**

```java
// GOOD: Proper timer cleanup
public class TimerManager {
    private final Set<Timer> timers = new HashSet<>();

    public Timer createTimer() {
        Timer timer = new Timer();
        timers.add(timer);
        return timer;
    }

    public void cleanup() {
        timers.forEach(Timer::cancel);
        timers.clear();
    }
}
```

**Python:**

```python
# GOOD: Timer cancellation
import threading

class TimerManager:
    def __init__(self):
        self.timers = []

    def create_timer(self, callback, interval):
        timer = threading.Timer(interval, callback)
        self.timers.append(timer)
        timer.start()
        return timer

    def cleanup(self):
        for timer in self.timers:
            timer.cancel()
        self.timers.clear()
```

**Go:**

```go
// GOOD: Proper ticker cleanup
type TimerManager struct {
    tickers []*time.Ticker
    done    chan bool
}

func (tm *TimerManager) CreateTicker(interval time.Duration, callback func()) {
    ticker := time.NewTicker(interval)
    tm.tickers = append(tm.tickers, ticker)

    go func() {
        defer ticker.Stop()
        for {
            select {
            case <-ticker.C:
                callback()
            case <-tm.done:
                return
            }
        }
    }()
}

func (tm *TimerManager) Cleanup() {
    close(tm.done)
    for _, ticker := range tm.tickers {
        ticker.Stop()
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
# Start timer leak (each call creates 1 new timer)
curl -X POST http://localhost:3000/memory-leak/timer/start
curl -X POST http://localhost:3000/memory-leak/timer/start
curl -X POST http://localhost:3000/memory-leak/timer/start

# Check active timers count
curl http://localhost:3000/memory-leak/timer/status

# Stop all timer leaks
curl -X POST http://localhost:3000/memory-leak/timer/stop
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

- **Always pair creation with cleanup** (timer start with timer stop)
- **Track timer references** in collections or management objects
- **Clear timers** in cleanup/destructor functions
- **Use try/finally** blocks for guaranteed cleanup
- **Implement timeouts** for long-running timers

### 2. Avoid Large Context Capture

**JavaScript:**

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

**Java:**

```java
// BAD: Anonymous class captures large context
public void createTimer(List<byte[]> largeDataList) {
    timer.scheduleAtFixedRate(new TimerTask() {
        @Override
        public void run() {
            System.out.println(largeDataList.size()); // Captures entire list
        }
    }, 0, 1000);
}

// GOOD: Extract needed values
public void createTimer(List<byte[]> largeDataList) {
    final int size = largeDataList.size(); // Extract only what's needed
    timer.scheduleAtFixedRate(new TimerTask() {
        @Override
        public void run() {
            System.out.println(size);
        }
    }, 0, 1000);
}
```

### 3. Use Modern Cancellation Patterns

**JavaScript - AbortController:**

```javascript
function createCancellableTimer(callback, interval) {
    const controller = new AbortController();
    const timer = setInterval(callback, interval);

    controller.signal.addEventListener('abort', () => {
        clearInterval(timer);
    });

    return controller;
}
```

**Java - CompletableFuture:**

```java
public CompletableFuture<Void> createCancellableTimer(Runnable callback, long interval) {
    return CompletableFuture.runAsync(() -> {
        try {
            while (!Thread.currentThread().isInterrupted()) {
                Thread.sleep(interval);
                callback.run();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
}
```

**Go - Context:**

```go
func createCancellableTimer(ctx context.Context, callback func(), interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            callback()
        case <-ctx.Done():
            return
        }
    }
}
```

## Related Topics

- [Global Variable Leaks](./global-variables.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Try the interactive timer leak demo in our [NestJS Demo](../demos/nestjs.md) to see these concepts in action.
