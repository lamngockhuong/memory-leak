# Global Variable Memory Leaks - Rò rỉ bộ nhớ từ Biến toàn cục

Global variable memory leaks là một trong những loại rò rỉ bộ nhớ phổ biến và dai dẳng nhất trong các ứng dụng JavaScript. Chúng xảy ra khi các biến trong global scope tích lũy dữ liệu mà không được dọn dẹp đúng cách, ngăn cản garbage collector giải phóng bộ nhớ.

## Global Variable Leaks là gì?

Global variable leaks xảy ra khi:

1. **Variables được khai báo trong global scope** tích lũy dữ liệu theo thời gian
2. **Implicit global variables** được tạo ra một cách vô tình
3. **Module-level variables** tăng trưởng không giới hạn
4. **Window/global object properties** được thêm vào nhưng không bao giờ được xóa

## Cách Global Variable Leaks xảy ra

### Ví dụ: Accidental Global Variables

```javascript
// SAI: Implicit global variable
function processUser(user) {
    userData = user; // Thiếu 'var', 'let', hoặc 'const'
    // Tạo ra window.userData hoặc global.userData
}
```

### Ví dụ: Growing Global Arrays

```javascript
// SAI: Global array không bao giờ được dọn dẹp
var globalCache = [];
var userSessions = [];

function addToCache(item) {
    globalCache.push(item); // Tăng trưởng vô hạn
}

function trackUser(user) {
    userSessions.push(user); // Không bao giờ xóa sessions cũ
}
```

### Ví dụ: Global Object Properties

```javascript
// SAI: Global object tích lũy properties
window.appData = window.appData || {};

function storeData(key, value) {
    window.appData[key] = value; // Properties không bao giờ được xóa
}
```

## Tác động của Global Variable Leaks

Global variable leaks nguy hiểm vì:

- **Persistent References**: Global variables không bao giờ được garbage collected
- **Memory Accumulation**: Dữ liệu tăng tuyến tính theo việc sử dụng ứng dụng
- **Performance Degradation**: Global objects lớn làm chậm property access
- **Memory Pressure**: Có thể dẫn đến browser/Node.js crashes

## Phương pháp phát hiện

### 1. Global Scope Inspection

```javascript
// Browser: Kiểm tra window object
console.log(Object.keys(window).filter(key =>
    typeof window[key] === 'object' && window[key] !== null
));

// Node.js: Kiểm tra global object
console.log(Object.keys(global).filter(key =>
    typeof global[key] === 'object' && global[key] !== null
));
```

### 2. Memory Usage Monitoring

```javascript
// Track memory usage theo thời gian
function checkMemoryUsage() {
    if (typeof process !== 'undefined') {
        // Node.js
        const usage = process.memoryUsage();
        console.log('Memory Usage:', {
            rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
        });
    } else if ('performance' in window && 'memory' in performance) {
        // Chrome browser
        console.log('Memory Usage:', {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`
        });
    }
}
```

## Chiến lược phòng ngừa

### 1. Sử dụng Module Patterns

```javascript
// ĐÚNG: Module pattern với controlled scope
const UserManager = (function() {
    let userData = []; // Private cho module
    let cache = new Map();
    const MAX_CACHE_SIZE = 1000;

    return {
        addUser(user) {
            userData.push(user);
            if (userData.length > MAX_CACHE_SIZE) {
                userData.shift(); // Xóa cái cũ nhất
            }
        },

        clearCache() {
            cache.clear();
            userData.length = 0;
        },

        getStats() {
            return {
                users: userData.length,
                cacheSize: cache.size
            };
        }
    };
})();
```

### 2. Implement Size Limits

```javascript
// ĐÚNG: Self-limiting global cache
class GlobalCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Xóa entry cũ nhất
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}

// Sử dụng
window.globalCache = new GlobalCache(500);
```

### 3. Sử dụng WeakMap cho References

```javascript
// ĐÚNG: WeakMap cho object references
const objectMetadata = new WeakMap();

function attachMetadata(obj, metadata) {
    objectMetadata.set(obj, metadata);
    // Metadata được tự động dọn dẹp khi obj được garbage collected
}
```

## Testing Global Variable Leaks

### Manual Testing

Sử dụng demo API của chúng tôi để mô phỏng global variable leaks:

```bash
# Bắt đầu global variable leak
curl http://localhost:3000/global-variable-leak

# Monitor memory trong 10 giây
# Mong đợi: Memory usage tăng tạm thời
```

## Best Practices

### 1. Luôn sử dụng Strict Mode

```javascript
'use strict';

function processData() {
    userData = {}; // Sẽ throw error trong strict mode
}
```

### 2. Namespace Your Globals

```javascript
// ĐÚNG: Single global namespace
window.MyApp = window.MyApp || {
    data: new Map(),
    cache: new Map(),

    init() {
        // Initialize application
    },

    cleanup() {
        this.data.clear();
        this.cache.clear();
    }
};
```

## Chủ đề liên quan

- [Timer Memory Leaks](./timers.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)
