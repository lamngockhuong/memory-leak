# Timer Memory Leaks - Rò rỉ bộ nhớ từ Timer

Timer memory leaks là một trong những loại rò rỉ bộ nhớ phổ biến và nguy hiểm nhất trong các ứng dụng JavaScript/Node.js. Chúng xảy ra khi các timer (`setInterval`, `setTimeout`) không được dọn dẹp đúng cách, gây ra việc cấp phát bộ nhớ liên tục và ngăn cản garbage collection.

## Timer Memory Leaks là gì?

Timer memory leaks xảy ra khi:

1. **Intervals/timeouts được tạo** nhưng không bao giờ được xóa
2. **Timer callbacks tham chiếu đến các object lớn** không thể được garbage collected
3. **Recursive timers** tạo ra chuỗi vô hạn các timer calls
4. **Anonymous timer functions** capture large closure contexts

## Cách Timer Leaks xảy ra

### Ví dụ: setInterval không được dọn dẹp

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

### Ví dụ: Timer với Closure Context

```javascript
// SAI: Timer capture large context
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

```bash
# Monitor Node.js memory usage
node --inspect your-app.js

# Kiểm tra sự tăng trưởng bộ nhớ theo thời gian
process.memoryUsage()
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
# Bắt đầu timer leak (5MB/giây)
curl http://localhost:3000/timer-leak

# Kiểm tra active timers
curl http://localhost:3000/timer-leak/status

# Dừng tất cả timer leaks
curl http://localhost:3000/timer-leak/stop
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

- **Luôn ghép đôi** `setInterval` với `clearInterval`
- **Track timer IDs** trong arrays hoặc sets
- **Clear timers** trong cleanup functions
- **Sử dụng try/finally** blocks để đảm bảo cleanup

### 2. Tránh Large Closures

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

### 3. Sử dụng Modern Alternatives

```javascript
// Modern: AbortController cho cancellation
function createCancellableTimer(callback, interval) {
    const controller = new AbortController();

    const timer = setInterval(callback, interval);

    controller.signal.addEventListener('abort', () => {
        clearInterval(timer);
    });

    return controller;
}

// Sử dụng
const controller = createCancellableTimer(() => {}, 1000);
// Sau đó: controller.abort();
```

## Chủ đề liên quan

- [Global Variable Leaks](./global-variables.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Thử interactive timer leak demo trong [NestJS Demo](../demos/nestjs.md) để xem các khái niệm này hoạt động thực tế.
