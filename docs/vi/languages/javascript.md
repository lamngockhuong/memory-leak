# Rò rỉ bộ nhớ trong JavaScript/TypeScript

Ứng dụng JavaScript và TypeScript đặc biệt dễ bị rò rỉ bộ nhớ do tính chất động và cách lập trình dựa trên closure. Hướng dẫn này bao gồm cả môi trường trình duyệt và Node.js.

## Hiểu về quản lý bộ nhớ trong JavaScript

### Cơ chế Garbage Collection trong V8

JavaScript sử dụng cơ chế quản lý bộ nhớ tự động thông qua bộ gom rác (garbage collector) của V8:

- **Mark and Sweep (Đánh dấu và quét)**: Xác định các đối tượng không thể truy cập và giải phóng bộ nhớ
- **Generational Collection**: Tối ưu cho đối tượng ngắn hạn và dài hạn
- **Incremental Collection**: Giảm thời gian tạm dừng bằng cách chia nhỏ công việc GC theo từng giai đoạn

### Khi GC không thể giúp

GC chỉ hoạt động khi đối tượng thực sự không còn tham chiếu. Rò rỉ bộ nhớ xảy ra khi:

- Đối tượng vẫn còn **tham chiếu** nhưng không còn **cần thiết**
- **Biến toàn cục** ngăn cản quá trình cleanup
- **Event listener** giữ tham chiếu đến đối tượng
- **Closure** vô tình giữ phạm vi lớn không cần thiết

## Các mẫu rò rỉ bộ nhớ phổ biến trong JavaScript

### 1. Biến toàn cục (Global Variables)

**Vấn đề**: Các biến trong phạm vi toàn cục sẽ tồn tại trong suốt vòng đời của ứng dụng.

```javascript
// SAI: Biến toàn cục tích lũy dữ liệu
var userData = [];
var cache = {};

function processUser(user) {
    userData.push(user);        // Không bao giờ được dọn dẹp (cleanup)
    cache[user.id] = user;      // Tăng trưởng vô hạn
}
```

**Giải pháp**: Sử dụng phạm vi module và triển khai cơ chế cleanup.

```javascript
// ĐÚNG: Giới hạn trong phạm vi module với ràng buộc
const UserManager = (function() {
    let userData = [];
    let cache = new Map();
    const MAX_CACHE_SIZE = 1000;

    return {
        processUser(user) {
            userData.push(user);
            cache.set(user.id, user);

            // Triển khai cleanup
            if (cache.size > MAX_CACHE_SIZE) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
        },

        cleanup() {
            userData = [];
            cache.clear();
        }
    };
})();
```

### 2. Event Listeners (Trình lắng nghe sự kiện)

**Vấn đề**: Event Listener giữ tham chiếu đến phần tử DOM và cả context của callback.

```javascript
// SAI: Event Listener không có cleanup
function setupComponent() {
  const element = document.getElementById('myButton');
  const largeData = new Array(1000000).fill('data');

  element.addEventListener('click', function() { // Hàm ẩn danh
    console.log('Clicked', largeData.length); // Giữ tham chiếu đến largeData
  });

  // Khi component bị loại bỏ, listener vẫn tồn tại!
}
```

**Giải pháp**: Luôn loại bỏ event listener khi không còn cần thiết

```javascript
// ĐÚNG: Dọn dẹp event listener đúng cách
function setupComponent() {
  const element = document.getElementById('myButton');
  const largeData = new Array(1000000).fill('data');

  function clickHandler() {
    console.log('Clicked', largeData.length);
  }

  element.addEventListener('click', clickHandler);

  // Trả về hàm cleanup
  return function cleanup() {
    element.removeEventListener('click', clickHandler);
    // largeData giờ có thể được GC thu gom
  };
}

// Cách sử dụng
const cleanup = setupComponent();
// Sau này...
cleanup();
```

### 3. Closure

**Vấn đề**: Closure giữ lại toàn bộ phạm vi từ vựng (lexical scope), bao gồm cả các đối tượng lớn không cần thiết

```javascript
// SAI: Closure giữ tham chiếu đến đối tượng lớn không cần thiết
function createHandler(largeObject) {
  const hugeArray = new Array(1000000).fill(largeObject);

  return function smallHandler(event) {
    // Chỉ sử dụng event, nhưng closure vẫn giữ hugeArray!
    console.log('Event:', event.type);
  };
}
```

**Giải pháp**: Giảm phạm vi closure xuống mức tối thiểu

```javascript
// ĐÚNG: Chỉ trích xuất dữ liệu cần thiết
function createHandler(largeObject) {
  {
    // khối xử lý tạm
    const hugeArray = new Array(1_000_000).fill(largeObject);
    // ... xử lý xong là rời scope
  }

  // Chỉ lấy dữ liệu cần dùng
  const eventType = largeObject.type;

  return function smallHandler(event) {
    console.log('Event:', event.type, 'Type:', eventType);
    // hugeArray không bị giữ trong closure
  };
}
```

### 4. Bộ hẹn giờ (Timers) và khoảng lặp (Intervals)

**Vấn đề**: Timer giữ callback và closure của nó sống mãi, không được thu hồi.

```javascript
// SAI: Timer giữ tham chiếu vô thời hạn
function startPolling(element) {
  const largeData = new Array(1000000).fill('polling');

  const interval = setInterval(function() {
    if (element.isConnected) {
      console.log('Polling...', largeData.length);
    }
    // Timer vẫn chạy ngay cả khi element đã bị loại bỏ!
  }, 1000);

  // Không có cơ chế dọn dẹp
}
```

**Giải pháp**: Luôn dọn dẹp timer đúng cách

```javascript
// ĐÚNG: Dọn dẹp timer đúng cách
function startPolling(element) {
  const largeData = new Array(1000000).fill('polling');

  const interval = setInterval(function() {
    if (!element.isConnected) {
      clearInterval(interval);
      return;
    }
    console.log('Polling...', largeData.length);
  }, 1000);

  return function stopPolling() {
    clearInterval(interval);
  };
}
```

### 5. Tham chiếu DOM (DOM References)

**Vấn đề**: JavaScript giữ tham chiếu đến các phần tử DOM đã bị loại bỏ

```javascript
// SAI: Giữ tham chiếu tới DOM đã bị tách ra
const elementCache = [];

function cacheElement(selector) {
  const element = document.querySelector(selector);
  elementCache.push(element);

  // Sau này, element có thể bị loại khỏi DOM
  // nhưng vẫn còn bị tham chiếu trong cache
}
```

**Giải pháp**: Sử dụng WeakMap hoặc dọn dẹp tham chiếu

```javascript
// ĐÚNG: Dùng WeakMap cho tham chiếu DOM
const elementMetadata = new WeakMap();

function attachMetadata(element, data) {
  elementMetadata.set(element, data);
  // Khi phần tử bị loại khỏi DOM và không còn tham chiếu nào khác,
  // nó sẽ được GC thu gom cùng với metadata
}

// HOẶC: Dọn dẹp thủ công
const elementCache = new Set();

function cacheElement(selector) {
  const element = document.querySelector(selector);
  elementCache.add(element);
}

function cleanupCache() {
  for (const element of elementCache) {
    if (!element.isConnected) {
      elementCache.delete(element);
    }
  }
}

// Chạy cleanup định kỳ
setInterval(cleanupCache, 60000);
```

## Các mẫu rò rỉ bộ nhớ trong Node.js

### 1. Stream Leaks (Rò rỉ do Stream)

**Vấn đề**: Stream không được đóng đúng cách

```javascript
// SAI: Stream không có cleanup hợp lý
const fs = require('fs');

function processFile(filename) {
  const stream = fs.createReadStream(filename);

  stream.on('data', (chunk) => {
    // Xử lý dữ liệu
  });

  // Không xử lý lỗi hoặc cleanup
}
```

**Giải pháp**: Luôn quản lý vòng đời của stream

```javascript
// ĐÚNG: Quản lý stream đúng cách
const fs = require('fs');

function processFile(filename) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filename);

    stream.on('data', (chunk) => {
      // Xử lý dữ liệu
    });

    stream.on('end', () => {
      stream.destroy();
      resolve();
    });

    stream.on('error', (error) => {
      stream.destroy();
      reject(error);
    });
  });
}
```

### 2. HTTP Request Leaks (Rò rỉ do HTTP Request)

**Vấn đề**: Các HTTP request không có timeout hoặc không được dọn dẹp đúng cách

```javascript
// SAI: HTTP request không giới hạn
const requests = [];

function makeRequest(url) {
  const req = http.get(url, (res) => {
    // Xử lý phản hồi
  });

  requests.push(req); // Tích lũy request
  // Không có timeout hoặc cleanup
}
```

**Giải pháp**: Thiết lập timeout và dọn dẹp request

```javascript
// ĐÚNG: Quản lý HTTP request hợp lý
const activeRequests = new Set();

function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        activeRequests.delete(req);
        resolve(data);
      });
    });

    req.setTimeout(timeout, () => {
      req.abort();
      activeRequests.delete(req);
      reject(new Error('Request timeout'));
    });

    req.on('error', (error) => {
      activeRequests.delete(req);
      reject(error);
    });

    activeRequests.add(req);
  });
}

// Hàm dọn dẹp
function abortAllRequests() {
  for (const req of activeRequests) {
    req.abort();
  }
  activeRequests.clear();
}
```

## Lưu ý riêng cho TypeScript

### 1. Đảm bảo an toàn kiểu (Type Safety) cho quản lý bộ nhớ

```typescript
// Sử dụng kiểu để bắt buộc phải dọn dẹp
interface Disposable {
  dispose(): void;
}

class ResourceManager implements Disposable {
  private resources: Set<Disposable> = new Set();

  addResource<T extends Disposable>(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  dispose(): void {
    for (const resource of this.resources) {
      resource.dispose();
    }
    this.resources.clear();
  }
}
```

### 2. Kiểu chặt chẽ cho Event Listener

```typescript
// Quản lý event listener an toàn kiểu dữ liệu
interface EventListenerManager {
  addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void;

  cleanup(): void;
}

class SafeEventManager implements EventListenerManager {
  private listeners: Array<{
    element: HTMLElement;
    type: string;
    listener: EventListener;
  }> = [];

  addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void {
    element.addEventListener(type, listener);
    this.listeners.push({ element, type, listener });
  }

  cleanup(): void {
    for (const { element, type, listener } of this.listeners) {
      element.removeEventListener(type, listener);
    }
    this.listeners = [];
  }
}
```

## Các mẫu rò rỉ bộ nhớ trong framework

### Rò rỉ bộ nhớ trong React

```jsx
// SAI: Rò rỉ bộ nhớ trong React
function BadComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => [...prev, Date.now()]);
    }, 1000);

    // Thiếu cleanup!
  }, []);

  return <div>{data.length} items</div>;
}

// ĐÚNG: Dọn dẹp đúng cách
function GoodComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => [...prev, Date.now()]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{data.length} items</div>;
}
```

### Rò rỉ bộ nhớ trong Vue.js

```javascript
// SAI: Rò rỉ bộ nhớ trong Vue
export default {
  created() {
    this.interval = setInterval(() => {
      this.data.push(Date.now());
    }, 1000);

    // Không dọn dẹp trong beforeDestroy/beforeUnmount
  },

  data() {
    return { data: [] };
  }
};

// ĐÚNG: Dọn dẹp đúng cách
export default {
  created() {
    this.interval = setInterval(() => {
      this.data.push(Date.now());
    }, 1000);
  },

  beforeDestroy() { // Vue 2
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  beforeUnmount() { // Vue 3
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  data() {
    return { data: [] };
  }
};
```

## Công cụ phát hiện rò rỉ bộ nhớ

### DevTools của trình duyệt

**Thẻ Memory**:

1. Chụp heap snapshot trước và sau khi thao tác
2. So sánh các snapshot để tìm đối tượng đang tăng trưởng
3. Sử dụng allocation timeline để theo dõi việc sử dụng bộ nhớ

**Thẻ Performance**:

1. Ghi lại mức sử dụng bộ nhớ theo thời gian
2. Xác định các đỉnh bộ nhớ (memory spike) và dấu hiệu rò rỉ
3. Phân tích tần suất hoạt động của garbage collection

### Công cụ Node.js

**Profiling tích hợp sẵn**:

```bash
# Bật heap profiling
node --inspect --expose-gc app.js

# Kết nối Chrome DevTools với Node.js
```

**Giám sát sử dụng bộ nhớ**:

```javascript
const used = process.memoryUsage();
console.log({
  rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`
});
```

**Tạo heap dump**:

```javascript
const v8 = require('v8');
const fs = require('fs');

// Tạo heap snapshot
const heapSnapshot = v8.writeHeapSnapshot();
console.log('Heap snapshot đã được ghi vào', heapSnapshot);
```

## Thực hành phòng tránh rò rỉ bộ nhớ

### 1. Sử dụng quy tắc ESLint

```json
{
  "rules": {
    "no-global-assign": "error", // Cấm gán lại biến toàn cục
    "no-implicit-globals": "error", // Cấm tạo biến toàn cục ngầm định
    "no-undef": "error" // Cấm sử dụng biến chưa được định nghĩa
  }
}
```

### 2. Triển khai quản lý tài nguyên

```typescript
// Mẫu quản lý tài nguyên
class ComponentManager {
  private cleanupTasks: Array<() => void> = [];

  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  setupEventListener(element: HTMLElement, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.addCleanupTask(() => element.removeEventListener(event, handler));
  }

  setupInterval(callback: () => void, ms: number): void {
    const interval = setInterval(callback, ms);
    this.addCleanupTask(() => clearInterval(interval));
  }

  destroy(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}
```

### 3. Giám sát việc sử dụng bộ nhớ

```javascript
// Giám sát bộ nhớ trong môi trường production
function setupMemoryMonitoring() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Môi trường trình duyệt
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    }, 30000);
  } else if (typeof process !== 'undefined') {
    // Môi trường Node.js
    setInterval(() => {
      const usage = process.memoryUsage();
      console.log('Memory usage:', {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024)
      });
    }, 30000);
  }
}
```

## Kiểm thử rò rỉ bộ nhớ

### Kiểm thử tự động (Automated Testing)

```javascript
// Kiểm thử rò rỉ bộ nhớ với Jest
describe('Memory Leak Tests', () => {
  let initialMemory;

  beforeEach(() => {
    if (global.gc) global.gc(); // Yêu cầu chạy Node với --expose-gc
    initialMemory = process.memoryUsage().heapUsed;
  });

  afterEach(() => {
    if (global.gc) global.gc();
    const finalMemory = process.memoryUsage().heapUsed;
    const growth = finalMemory - initialMemory;

    // Cho phép tăng nhẹ nhưng không quá mức
    expect(growth).toBeLessThan(10 * 1024 * 1024); // 10MB
  });

  test('should not leak memory during operation', () => {
    // Mã kiểm thử của bạn ở đây
    for (let i = 0; i < 1000; i++) {
      const component = createComponent();
      component.destroy();
    }
  });
});
```

### Kiểm thử tải (Load Testing)

```javascript
// Kiểm thử tải để phát hiện rò rỉ bộ nhớ
async function loadTest() {
  console.log('Bắt đầu kiểm thử tải...');

  for (let i = 0; i < 10000; i++) {
    await performOperation();

    if (i % 1000 === 0) {
      const usage = process.memoryUsage();
      console.log(`Lần lặp ${i}: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);

      if (global.gc) global.gc();
    }
  }

  console.log('Kiểm thử tải hoàn tất');
}
```

<!-- ## Tài nguyên liên quan

- [Mẫu biến toàn cục](/patterns/global-variables) - Phân tích chi tiết về rò rỉ do biến toàn cục
- [Mẫu trình lắng nghe sự kiện](/patterns/event-listeners) - Quản lý bộ nhớ cho event listener
- [Mẫu closure](/patterns/closures) - Hiểu về rò rỉ bộ nhớ do closure
- [Demo NestJS](/demos/nestjs) - Ví dụ thực tế về rò rỉ bộ nhớ Node.js
- [Hướng dẫn DevTools trình duyệt](/tools/browser-devtools) - Sử dụng Chrome DevTools để phân tích
- [Hướng dẫn profiling Node.js](/tools/nodejs-profiling) - Công cụ profiling chuyên biệt cho Node.js -->
