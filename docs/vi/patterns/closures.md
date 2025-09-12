# Rò Rỉ Bộ Nhớ Closure

Rò rỉ bộ nhớ closure xảy ra khi các closure giữ tham chiếu đến các biến trong phạm vi bên ngoài lâu hơn mức cần thiết, ngăn cản việc thu gom rác của các đối tượng có thể lớn. Điều này đặc biệt có vấn đề khi các closure được lưu trữ trong các cấu trúc dữ liệu tồn tại lâu dài hoặc được truyền như callback.

## Rò Rỉ Bộ Nhớ Closure Là Gì?

Rò rỉ bộ nhớ closure xảy ra khi:

1. **Closure nắm bắt các đối tượng lớn** từ phạm vi bên ngoài
2. **Event handler duy trì tham chiếu** đến các phần tử DOM hoặc dữ liệu lớn
3. **Callback function giữ phạm vi cha** một cách không cần thiết
4. **Nested function tạo tham chiếu vòng**
5. **Module pattern giữ dữ liệu private** vô thời hạn

## Cách Rò Rỉ Bộ Nhớ Closure Xảy Ra

### Ví Dụ JavaScript/Node.js

```javascript
// TỆ: Closure giữ đối tượng lớn
function createHandler() {
    const largeData = new Array(1000000).fill('data');
    const metadata = { info: 'small data' };

    return function handler(event) {
        // Chỉ sử dụng metadata, nhưng closure giữ largeData sống
        console.log(metadata.info, event.type);
    };
}

// TỐT: Giảm thiểu phạm vi closure
function createHandler() {
    const largeData = new Array(1000000).fill('data');
    const info = { info: 'small data' }.info; // Chỉ trích xuất dữ liệu cần thiết

    return function handler(event) {
        console.log(info, event.type);
        // largeData có thể được thu gom rác
    };
}
```

```javascript
// TỆ: Giữ phần tử DOM
function attachListeners() {
    const elements = document.querySelectorAll('.item');
    const data = fetchLargeDataset(); // Đối tượng lớn

    elements.forEach(element => {
        element.addEventListener('click', function() {
            // Closure giữ tham chiếu đến 'elements' và 'data'
            processClick(element, data);
        });
    });
}

// TỐT: Giảm thiểu tham chiếu được giữ
function attachListeners() {
    const elements = document.querySelectorAll('.item');
    const data = fetchLargeDataset();

    elements.forEach(element => {
        const elementData = extractNeededData(data, element);
        element.addEventListener('click', function() {
            // Chỉ giữ elementData nhỏ, không phải toàn bộ data
            processClick(element, elementData);
        });
    });
}
```

### Ví Dụ Python

```python
# TỆ: Closure giữ đối tượng lớn
def create_processor():
    large_data = list(range(1000000))
    config = {'mode': 'fast'}

    def process(item):
        # Function giữ tham chiếu đến large_data dù không sử dụng
        return item * 2 if config['mode'] == 'fast' else item

    return process

# TỐT: Chỉ trích xuất giá trị cần thiết
def create_processor():
    large_data = list(range(1000000))
    mode = {'mode': 'fast'}['mode']  # Chỉ trích xuất giá trị cần thiết

    def process(item):
        return item * 2 if mode == 'fast' else item

    return process
```

### Ví Dụ Java

```java
// TỆ: Lambda nắm bắt đối tượng lớn
public class DataProcessor {
    public Function<String, String> createProcessor() {
        List<String> largeDataset = generateLargeDataset();
        String config = "fast";

        return item -> {
            // Lambda giữ tham chiếu đến largeDataset
            return config.equals("fast") ? item.toUpperCase() : item;
        };
    }
}

// TỐT: Trích xuất giá trị cần thiết
public class DataProcessor {
    public Function<String, String> createProcessor() {
        List<String> largeDataset = generateLargeDataset();
        final String config = "fast"; // Chỉ nắm bắt những gì cần thiết

        return item -> config.equals("fast") ? item.toUpperCase() : item;
    }
}
```

### Ví Dụ Go

```go
// TỆ: Closure nắm bắt slice lớn
func createHandler() func(string) string {
    largeData := make([]string, 1000000)
    config := "fast"

    return func(input string) string {
        // Function giữ tham chiếu đến largeData
        if config == "fast" {
            return strings.ToUpper(input)
        }
        return input
    }
}

// TỐT: Giảm thiểu biến bị nắm bắt
func createHandler() func(string) string {
    largeData := make([]string, 1000000)
    isFast := "fast" == "fast" // Trích xuất boolean thay vì string

    return func(input string) string {
        // largeData có thể được thu gom rác
        if isFast {
            return strings.ToUpper(input)
        }
        return input
    }
}
```

### Ví Dụ C#/.NET

```csharp
// TỆ: Anonymous function nắm bắt đối tượng lớn
public Func<string, string> CreateProcessor()
{
    var largeData = new List<string>(1000000);
    var config = new { Mode = "fast", Debug = false };

    return item =>
    {
        // Nắm bắt toàn bộ config object và largeData
        return config.Mode == "fast" ? item.ToUpper() : item;
    };
}

// TỐT: Chỉ trích xuất giá trị cần thiết
public Func<string, string> CreateProcessor()
{
    var largeData = new List<string>(1000000);
    var isFastMode = new { Mode = "fast" }.Mode == "fast";

    return item =>
    {
        // Chỉ nắm bắt boolean, largeData có thể được thu thập
        return isFastMode ? item.ToUpper() : item;
    };
}
```

## Tác Động Của Rò Rỉ Bộ Nhớ Closure

Rò rỉ bộ nhớ closure đặc biệt nguy hiểm vì:

- **Tham Chiếu Ẩn**: Closure vô hình giữ tham chiếu đến toàn bộ phạm vi lexical
- **Giữ Liên Hoàn**: Một closure nhỏ có thể ngăn thu gom rác của các đối tượng lớn
- **Tích Lũy Event Handler**: DOM event handler với closure ngăn việc dọn dẹp element
- **Suy Giảm Hiệu Suất**: Quá nhiều closure làm chậm thực thi JavaScript và thu gom rác
- **Áp Lực Bộ Nhớ**: Có thể dẫn đến crash browser tab hoặc tắt tiến trình Node.js

## Các Mẫu Rò Rỉ Closure Phổ Biến

### 1. Event Handler Closures

```javascript
// TỆ: Event handler giữ tham chiếu DOM
class ComponentManager {
    constructor() {
        this.components = [];
        this.data = new Array(100000).fill('large data');
    }

    attachHandlers() {
        this.components.forEach(component => {
            component.addEventListener('click', (event) => {
                // Closure giữ 'this' và tất cả thuộc tính của nó
                this.handleClick(event, component);
            });
        });
    }

    handleClick(event, component) {
        // Xử lý click
    }
}

// TỐT: Giảm thiểu phạm vi closure
class ComponentManager {
    constructor() {
        this.components = [];
        this.data = new Array(100000).fill('large data');
    }

    attachHandlers() {
        const handleClick = this.handleClick.bind(this);

        this.components.forEach(component => {
            const componentId = component.id; // Chỉ trích xuất dữ liệu cần thiết

            component.addEventListener('click', (event) => {
                handleClick(event, componentId);
            });
        });
    }

    handleClick(event, componentId) {
        const component = document.getElementById(componentId);
        // Xử lý click
    }
}
```

### 2. Timer Closures

```javascript
// TỆ: Timer giữ phạm vi lớn
function startProcessing() {
    const largeDataSet = loadLargeDataSet();
    const config = loadConfiguration();
    let counter = 0;

    const timer = setInterval(() => {
        // Closure giữ largeDataSet dù không sử dụng
        counter++;
        if (counter > config.maxIterations) {
            clearInterval(timer);
        }
    }, 1000);

    return timer;
}

// TỐT: Chỉ trích xuất giá trị cần thiết
function startProcessing() {
    const largeDataSet = loadLargeDataSet();
    const maxIterations = loadConfiguration().maxIterations;
    let counter = 0;

    const timer = setInterval(() => {
        counter++;
        if (counter > maxIterations) {
            clearInterval(timer);
        }
        // largeDataSet có thể được thu gom rác
    }, 1000);

    return timer;
}
```

### 3. Module Pattern Closures

```javascript
// TỆ: Module giữ dữ liệu không cần thiết
const UserModule = (function() {
    const allUsers = loadAllUsers(); // Dataset lớn
    const config = loadConfig();
    const cache = new Map();

    return {
        findUser(id) {
            // Module closure giữ allUsers mãi mãi
            return allUsers.find(user => user.id === id);
        },

        clearCache() {
            cache.clear();
        }
    };
})();

// TỐT: Lazy loading và dọn dẹp
const UserModule = (function() {
    let allUsers = null;
    const config = loadConfig();
    const cache = new Map();

    return {
        findUser(id) {
            if (!allUsers) {
                allUsers = loadAllUsers(); // Chỉ tải khi cần
            }
            return allUsers.find(user => user.id === id);
        },

        clearCache() {
            cache.clear();
            allUsers = null; // Cho phép thu gom rác
        }
    };
})();
```

### 4. Circular Reference Closures

```javascript
// TỆ: Tham chiếu vòng ngăn GC
function createCircularRef() {
    const parent = {
        name: 'parent',
        children: []
    };

    const child = {
        name: 'child',
        getParent() {
            return parent; // Closure nắm bắt parent
        }
    };

    parent.children.push(child);
    return { parent, child }; // Tham chiếu vòng
}

// TỐT: Sử dụng WeakRef hoặc phá vỡ chu trình
function createNonCircularRef() {
    const parent = {
        name: 'parent',
        children: []
    };

    const child = {
        name: 'child',
        parentRef: new WeakRef(parent), // Tham chiếu yếu
        getParent() {
            return this.parentRef.deref();
        }
    };

    parent.children.push(child);
    return { parent, child };
}
```

## Phương Pháp Phát Hiện

### 1. Phân Tích Phạm Vi Closure

```javascript
// Công cụ phát triển để phân tích phạm vi closure
function analyzeClosure(fn) {
    const fnString = fn.toString();
    const scopeVars = [];

    // Regex đơn giản để tìm tham chiếu biến
    const variablePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;

    while ((match = variablePattern.exec(fnString)) !== null) {
        const varName = match[1];
        if (!['function', 'return', 'if', 'else', 'for', 'while'].includes(varName)) {
            scopeVars.push(varName);
        }
    }

    console.log('Biến closure tiềm năng:', [...new Set(scopeVars)]);
}

// Sử dụng
const handler = createHandler();
analyzeClosure(handler);
```

### 2. Theo Dõi Sử Dụng Bộ Nhớ

```javascript
class ClosureTracker {
    constructor() {
        this.closures = new WeakSet();
        this.creationStats = new Map();
    }

    trackClosure(closure, name) {
        this.closures.add(closure);
        this.creationStats.set(name, {
            created: Date.now(),
            memoryUsage: this.getMemoryUsage()
        });
    }

    getMemoryUsage() {
        if (typeof process !== 'undefined') {
            return process.memoryUsage().heapUsed;
        } else if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    reportStats() {
        console.table(Array.from(this.creationStats.entries()).map(([name, stats]) => ({
            name,
            age: Date.now() - stats.created,
            memoryAtCreation: Math.round(stats.memoryUsage / 1024 / 1024) + ' MB'
        })));
    }
}

const tracker = new ClosureTracker();

function createTrackedHandler(name) {
    const handler = createHandler();
    tracker.trackClosure(handler, name);
    return handler;
}
```

### 3. Phân Tích Heap Chrome DevTools

```javascript
// Đánh dấu đối tượng để phân tích heap
function createMarkableClosures() {
    const largeData = new Array(100000).fill('data');
    largeData.__closureMarker = 'LargeDataInClosure';

    return function handler() {
        // Sử dụng largeData
        return largeData.length;
    };
}

// Trong DevTools Console:
// 1. Chụp heap snapshot
// 2. Tìm kiếm "__closureMarker"
// 3. Phân tích retaining paths
```

## Chiến Lược Phòng Ngừa

### 1. Giảm Thiểu Phạm Vi Closure

```javascript
// Chiến lược: Chỉ trích xuất những gì bạn cần
function createOptimizedHandler(largeDataset, config) {
    // Chỉ trích xuất giá trị cần thiết
    const isEnabled = config.enabled;
    const processingMode = config.mode;
    const requiredDataPoint = largeDataset.summary;

    return function handler(event) {
        if (!isEnabled) return;

        if (processingMode === 'fast') {
            return processFast(event, requiredDataPoint);
        }
        return processSlow(event, requiredDataPoint);
    };
}
```

### 2. Sử Dụng WeakMap Cho Liên Kết Đối Tượng

```javascript
// Thay vì closure, sử dụng WeakMap cho liên kết object-data
const elementData = new WeakMap();

function attachOptimizedHandlers(elements, largeDataset) {
    elements.forEach(element => {
        const relevantData = extractRelevantData(largeDataset, element);
        elementData.set(element, relevantData);

        element.addEventListener('click', function handleClick(event) {
            const data = elementData.get(event.target);
            processClick(event, data);
        });
    });
}
```

### 3. Triển Khai Dọn Dẹp Closure

```javascript
class CleanableClosures {
    constructor() {
        this.activeClosures = new Set();
    }

    createClosure(factory, data) {
        const cleanup = new Set();

        const closure = factory(data, cleanup);
        this.activeClosures.add({ closure, cleanup });

        return closure;
    }

    cleanup() {
        for (const { cleanup } of this.activeClosures) {
            cleanup.forEach(cleanupFn => cleanupFn());
        }
        this.activeClosures.clear();
    }
}

// Sử dụng
const manager = new CleanableClosures();

const handler = manager.createClosure((data, cleanup) => {
    const timer = setInterval(() => {
        console.log(data.message);
    }, 1000);

    cleanup.add(() => clearInterval(timer));

    return function() {
        // Logic handler
    };
}, { message: 'Hello' });

// Sau này: dọn dẹp tất cả closure
manager.cleanup();
```

### 4. Sử Dụng Factory Functions

```javascript
// Factory pattern để tránh giữ closure
class HandlerFactory {
    static createClickHandler(config) {
        const { mode, enabled } = config; // Trích xuất primitives

        return function clickHandler(event) {
            if (!enabled) return;

            if (mode === 'fast') {
                return this.handleFast(event);
            }
            return this.handleSlow(event);
        };
    }

    static createTimerHandler(interval) {
        return function timerHandler() {
            setTimeout(() => {
                this.process();
            }, interval);
        };
    }
}
```

## Kiểm Thử Rò Rỉ Bộ Nhớ Closure

### Kiểm Thử Thủ Công

Sử dụng API demo của chúng tôi để mô phỏng rò rỉ closure:

```bash
# Bắt đầu rò rỉ closure
curl -X POST http://localhost:3000/memory-leak/closure/start

# Kiểm tra trạng thái
curl http://localhost:3000/memory-leak/closure/status

# Dừng rò rỉ
curl -X POST http://localhost:3000/memory-leak/closure/stop
```

### Kiểm Thử Tự Động

```javascript
describe('Kiểm Thử Rò Rỉ Bộ Nhớ Closure', () => {
    test('không nên giữ các đối tượng lớn trong closure', () => {
        const initialMemory = process.memoryUsage().heapUsed;
        const handlers = [];

        // Tạo closure không nên giữ các đối tượng lớn
        for (let i = 0; i < 1000; i++) {
            const largeData = new Array(1000).fill(i);
            const small = largeData.length; // Chỉ trích xuất kích thước

            handlers.push(() => small * 2); // Không nên giữ largeData
        }

        // Buộc thu gom rác
        if (global.gc) {
            global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;

        // Tăng bộ nhớ nên tối thiểu (ít hơn 1MB)
        expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    test('closure nên giải phóng tham chiếu sau khi dọn dẹp', () => {
        let released = false;

        function createClosure() {
            const resource = {
                data: new Array(1000).fill('data'),
                release() { released = true; }
            };

            return {
                handler: () => resource.data.length,
                cleanup: () => resource.release()
            };
        }

        const { handler, cleanup } = createClosure();
        expect(handler()).toBe(1000);

        cleanup();
        expect(released).toBe(true);
    });
});
```

## Giám Sát Hiệu Suất

```javascript
class ClosurePerformanceMonitor {
    constructor() {
        this.metrics = {
            closuresCreated: 0,
            averageCreationTime: 0,
            memoryBaseline: this.getMemoryUsage()
        };
    }

    measureClosureCreation(factory, ...args) {
        const start = performance.now();
        const memoryBefore = this.getMemoryUsage();

        const closure = factory(...args);

        const end = performance.now();
        const memoryAfter = this.getMemoryUsage();

        this.metrics.closuresCreated++;
        this.metrics.averageCreationTime =
            (this.metrics.averageCreationTime + (end - start)) / 2;

        console.log(`Closure được tạo trong ${(end - start).toFixed(2)}ms, delta bộ nhớ: ${memoryAfter - memoryBefore} bytes`);

        return closure;
    }

    getMemoryUsage() {
        if (typeof process !== 'undefined') {
            return process.memoryUsage().heapUsed;
        } else if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    getReport() {
        return {
            ...this.metrics,
            currentMemory: this.getMemoryUsage(),
            memoryIncrease: this.getMemoryUsage() - this.metrics.memoryBaseline
        };
    }
}
```

## Thực Hành Tốt Nhất

### 1. Giữ Phạm Vi Closure Tối Thiểu

```javascript
// TỐT: Chỉ nắm bắt những gì bạn cần
function createProcessor(largeConfig, largeDataset) {
    // Chỉ trích xuất giá trị cần thiết
    const timeout = largeConfig.timeout;
    const retries = largeConfig.retries;
    const summary = largeDataset.summary;

    return function process(item) {
        // Closure không giữ largeConfig hoặc largeDataset
        return processWithTimeout(item, timeout, retries, summary);
    };
}
```

### 2. Sử Dụng Arrow Function Cẩn Thận

```javascript
// Arrow function nắm bắt 'this' - chú ý context
class DataProcessor {
    constructor() {
        this.largeData = new Array(1000000);
        this.config = { mode: 'fast' };
    }

    // TỆ: Arrow function nắm bắt toàn bộ 'this'
    createBadHandler() {
        return (item) => {
            return this.config.mode === 'fast' ? item * 2 : item;
            // Giữ tham chiếu đến this.largeData không cần thiết
        };
    }

    // TỐT: Trích xuất giá trị cần thiết
    createGoodHandler() {
        const isFast = this.config.mode === 'fast';
        return (item) => {
            return isFast ? item * 2 : item;
            // this.largeData có thể được thu gom rác
        };
    }
}
```

### 3. Triển Khai Registry Closure

```javascript
class ClosureRegistry {
    constructor() {
        this.registry = new Map();
        this.nextId = 0;
    }

    register(closure, metadata = {}) {
        const id = this.nextId++;
        this.registry.set(id, {
            closure,
            created: Date.now(),
            ...metadata
        });
        return id;
    }

    unregister(id) {
        return this.registry.delete(id);
    }

    cleanup(olderThan = 5 * 60 * 1000) { // 5 phút
        const cutoff = Date.now() - olderThan;

        for (const [id, entry] of this.registry) {
            if (entry.created < cutoff) {
                this.registry.delete(id);
            }
        }
    }

    getStats() {
        return {
            total: this.registry.size,
            oldest: Math.min(...Array.from(this.registry.values()).map(e => e.created)),
            newest: Math.max(...Array.from(this.registry.values()).map(e => e.created))
        };
    }
}
```

## Chủ Đề Liên Quan

- [Rò Rỉ Bộ Nhớ Biến Toàn Cục](./global-variables.md)
- [Rò Rỉ Event Listener](./event-listeners.md)
- [Rò Rỉ Bộ Nhớ Timer](./timers.md)
- [Rò Rỉ Bộ Nhớ Cache](./caching.md)

## Demo

Hãy thử demo tương tác về rò rỉ closure trong [NestJS Demo](../demos/nestjs.md) để xem các khái niệm này trong thực tế.
