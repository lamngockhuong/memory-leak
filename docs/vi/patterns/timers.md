# Timer Memory Leaks - Rò rỉ bộ nhớ từ Timer

Timer memory leaks là một trong những loại rò rỉ bộ nhớ phổ biến và nguy hiểm nhất trong các ngôn ngữ lập trình. Chúng xảy ra khi các timer, tác vụ định kỳ, hoặc các hoạt động được lên lịch không được quản lý đúng cách, gây ra việc cấp phát bộ nhớ liên tục và ngăn cản garbage collection.

## Timer Memory Leaks là gì?

Timer memory leaks xảy ra khi:

1. **Timers/tác vụ được lên lịch được tạo** nhưng không bao giờ được dừng hoặc xóa
2. **Timer callbacks tham chiếu đến các object lớn** không thể được garbage collected
3. **Recursive timers** tạo ra chuỗi vô hạn các timer calls
4. **Timer contexts capture large data** ngăn cản memory cleanup

## Cơ chế Timer theo ngôn ngữ

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
- Goroutines với `time.Sleep()`
- `context.WithTimeout()`

### C#/.NET

- `System.Timers.Timer`
- `System.Threading.Timer`
- `Task.Delay()` với cancellation tokens

## Cách Timer Leaks xảy ra

### Ví dụ JavaScript/Node.js

```javascript
// SAI: Timer không bao giờ được cleared
function startDataProcessing() {
    setInterval(() => {
        const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB mỗi giây
        processData(largeBuffer);
    }, 1000);
}

startDataProcessing(); // Bộ nhớ tăng 5MB mỗi giây mãi mãi
```

### Ví dụ Java

```java
// SAI: Timer không được cancel đúng cách
public class DataProcessor {
    private Timer timer = new Timer();

    public void startProcessing() {
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                byte[] largeData = new byte[5 * 1024 * 1024]; // 5MB
                processData(largeData);
                // largeData được tham chiếu bởi timer, không thể GC
            }
        }, 0, 1000);
    }
    // Thiếu: timer.cancel() trong cleanup
}
```

### Ví dụ Python

```python
# SAI: Timer không được cancel đúng cách
import threading
import time

def start_processing():
    large_data = bytearray(5 * 1024 * 1024)  # 5MB

    def process():
        # large_data bị capture trong closure, ngăn cản GC
        print(f"Processing {len(large_data)} bytes")
        # Lên lịch execution tiếp theo
        timer = threading.Timer(1.0, process)
        timer.start()  # Không bao giờ được cancelled!

    process()
```

### Ví dụ Go

```go
// SAI: Ticker không được stop đúng cách
package main

import (
    "time"
)

func startProcessing() {
    ticker := time.NewTicker(1 * time.Second)
    largeData := make([]byte, 5*1024*1024) // 5MB

    go func() {
        for range ticker.C {
            processData(largeData) // largeData không bao giờ được release
        }
    }()
    // Thiếu: ticker.Stop()
}
```

### Timer với Closure Context

```javascript
// SAI: Timer capture large context (ví dụ JavaScript)
function processLargeDataset(dataset) {
    const hugeArray = new Array(1000000).fill(dataset);

    setInterval(() => {
        console.log('Processing...'); // Captures hugeArray via closure
    }, 1000);
}
```

## Tác động của Timer Leaks

Timer leaks đặc biệt nguy hiểm vì:

- **Tăng trưởng liên tục**: Sử dụng bộ nhớ tăng tuyến tính theo thời gian
- **Patterns có thể dự đoán**: Dễ dàng nhận biết trong các monitoring tools
- **Hiệu ứng dây chuyền**: Có thể kích hoạt các vấn đề bộ nhớ khác
- **Crashes ứng dụng**: Cuối cùng dẫn đến lỗi out-of-memory

## Phương pháp phát hiện

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

// Sau đó...
clearInterval(timerId);
console.timeEnd('timer-leak-test');
```

### 3. Process Monitoring

```bash
# Monitor memory usage trong production
top -p $(pgrep node)
ps aux | grep node
```

## Chiến lược phòng ngừa

### 1. Luôn luôn Clear Timers

**JavaScript:**

```javascript
// ĐÚNG: Quản lý timer đúng cách
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
// ĐÚNG: Timer cleanup đúng cách
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
# ĐÚNG: Timer cancellation
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
// ĐÚNG: Ticker cleanup đúng cách
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

### 2. Sử dụng WeakRef cho Large Objects

```javascript
// ĐÚNG: Tránh capture large objects
function createTimer(largeObject) {
    const weakRef = new WeakRef(largeObject);

    return setInterval(() => {
        const obj = weakRef.deref();
        if (obj) {
            // Process object
        } else {
            // Object đã được garbage collected
            clearInterval(this);
        }
    }, 1000);
}
```

### 3. Implement Timer Limits

```javascript
// ĐÚNG: Self-limiting timer
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

Sử dụng demo API của chúng tôi để mô phỏng timer leaks:

```bash
# Bắt đầu timer leak (mỗi lần gọi tạo 1 timer mới)
curl -X POST http://localhost:3000/memory-leak/timer/start
curl -X POST http://localhost:3000/memory-leak/timer/start
curl -X POST http://localhost:3000/memory-leak/timer/start

# Kiểm tra số lượng active timers
curl http://localhost:3000/memory-leak/timer/status

# Dừng tất cả timer leaks
curl -X POST http://localhost:3000/memory-leak/timer/stop
```

### Automated Testing

```javascript
// Jest test cho timer leaks
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

- **Luôn ghép đôi creation với cleanup** (timer start với timer stop)
- **Track timer references** trong collections hoặc management objects
- **Clear timers** trong cleanup/destructor functions
- **Sử dụng try/finally** blocks để đảm bảo cleanup
- **Implement timeouts** cho long-running timers

### 2. Tránh Large Context Capture

**JavaScript:**

```javascript
// SAI: Large closure context
function createTimer(largeData) {
    return setInterval(() => {
        console.log(largeData.length); // Captures toàn bộ largeData
    }, 1000);
}

// ĐÚNG: Extract những gì cần thiết
function createTimer(largeData) {
    const dataLength = largeData.length; // Chỉ extract những gì cần
    return setInterval(() => {
        console.log(dataLength);
    }, 1000);
}
```

**Java:**

```java
// SAI: Anonymous class captures large context
public void createTimer(List<byte[]> largeDataList) {
    timer.scheduleAtFixedRate(new TimerTask() {
        @Override
        public void run() {
            System.out.println(largeDataList.size()); // Captures toàn bộ list
        }
    }, 0, 1000);
}

// ĐÚNG: Extract những gì cần thiết
public void createTimer(List<byte[]> largeDataList) {
    final int size = largeDataList.size(); // Chỉ extract những gì cần
    timer.scheduleAtFixedRate(new TimerTask() {
        @Override
        public void run() {
            System.out.println(size);
        }
    }, 0, 1000);
}
```

### 3. Sử dụng Modern Cancellation Patterns

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

## Chủ đề liên quan

- [Global Variable Leaks](./global-variables.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Thử interactive timer leak demo trong [NestJS Demo](../demos/nestjs.md) để xem các khái niệm này hoạt động thực tế.
