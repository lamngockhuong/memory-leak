# Rò Rỉ Bộ Nhớ Cache

Rò rỉ bộ nhớ cache xảy ra khi các cơ chế cache tích lũy dữ liệu mà không có chính sách loại bỏ phù hợp, dẫn đến tăng trưởng bộ nhớ không giới hạn. Điều này đặc biệt phổ biến trong các ứng dụng triển khai các giải pháp cache tùy chỉnh hoặc sử dụng sai các thư viện cache.

## Rò Rỉ Bộ Nhớ Cache Là Gì?

Rò rỉ bộ nhớ cache xảy ra khi:

1. **Cache phát triển không giới hạn** do thiếu chính sách loại bỏ
2. **TTL (Time To Live) không được thực thi** đúng cách
3. **Các khóa cache không được dọn dẹp** khi không còn cần thiết
4. **Tồn tại tham chiếu vòng** giữa các đối tượng được cache
5. **Giới hạn bộ nhớ không được thiết lập** cho các triển khai cache

## Cơ Chế Cache Theo Ngôn Ngữ Lập Trình

### JavaScript/Node.js

- `Map`, `Set`, các đối tượng tùy chỉnh để cache
- Thư viện bên thứ ba: `node-cache`, `lru-cache`
- Trình duyệt: `localStorage`, `sessionStorage`, `indexedDB`

### Java

- Có sẵn: `HashMap`, `ConcurrentHashMap`
- Guava Cache, Caffeine, Ehcache
- Các annotation cache của Spring Framework

### Python

- Có sẵn: `dict`, `functools.lru_cache`
- Bên thứ ba: `cachetools`, `diskcache`, `Redis`
- Django/Flask caching frameworks

### Go

- Có sẵn: `map`, `sync.Map`
- Bên thứ ba: `go-cache`, `groupcache`, `bigcache`
- Redis clients cho distributed caching

### C#/.NET

- Có sẵn: `MemoryCache`, `Dictionary`
- Redis.NET, NCache
- ASP.NET Core caching providers

## Cách Rò Rỉ Bộ Nhớ Cache Xảy Ra

### Ví Dụ JavaScript/Node.js

```javascript
// TỆ: Cache không giới hạn
const cache = new Map();

function getData(key) {
    if (cache.has(key)) {
        return cache.get(key);
    }

    const data = expensiveOperation(key);
    cache.set(key, data); // Không bao giờ được dọn dẹp
    return data;
}

// TỐT: LRU cache với giới hạn kích thước
class LRUCache {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value); // Di chuyển về cuối
            return value;
        }
        return null;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}
```

### Ví Dụ Java

```java
// TỆ: Cache không giới hạn
public class BadCache {
    private Map<String, Object> cache = new HashMap<>();

    public Object get(String key) {
        return cache.computeIfAbsent(key, this::expensiveOperation);
    }
}

// TỐT: Guava cache với chính sách loại bỏ
public class GoodCache {
    private final Cache<String, Object> cache = CacheBuilder.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .removalListener(entry -> System.out.println("Đã loại bỏ: " + entry.getKey()))
        .build();

    public Object get(String key) {
        return cache.get(key, this::expensiveOperation);
    }
}
```

### Ví Dụ Python

```python
# TỆ: Cache không giới hạn
class BadCache:
    def __init__(self):
        self.cache = {}

    def get(self, key):
        if key not in self.cache:
            self.cache[key] = self.expensive_operation(key)
        return self.cache[key]

# TỐT: Sử dụng functools.lru_cache
from functools import lru_cache
import time

class GoodCache:
    @lru_cache(maxsize=1000)
    def get_data(self, key):
        return self.expensive_operation(key)

    def clear_cache(self):
        self.get_data.cache_clear()
```

### Ví Dụ Go

```go
// TỆ: Cache không giới hạn
type BadCache struct {
    data map[string]interface{}
    mu   sync.RWMutex
}

func (c *BadCache) Get(key string) interface{} {
    c.mu.RLock()
    if val, ok := c.data[key]; ok {
        c.mu.RUnlock()
        return val
    }
    c.mu.RUnlock()

    val := expensiveOperation(key)
    c.mu.Lock()
    c.data[key] = val // Không bao giờ được dọn dẹp
    c.mu.Unlock()
    return val
}

// TỐT: Cache với TTL
type CacheItem struct {
    value   interface{}
    expires time.Time
}

type GoodCache struct {
    data    map[string]CacheItem
    mu      sync.RWMutex
    maxSize int
    ttl     time.Duration
}

func (c *GoodCache) Get(key string) interface{} {
    c.mu.RLock()
    if item, ok := c.data[key]; ok && time.Now().Before(item.expires) {
        c.mu.RUnlock()
        return item.value
    }
    c.mu.RUnlock()

    val := expensiveOperation(key)
    c.Set(key, val)
    return val
}

func (c *GoodCache) Set(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()

    if len(c.data) >= c.maxSize {
        c.evictOldest()
    }

    c.data[key] = CacheItem{
        value:   value,
        expires: time.Now().Add(c.ttl),
    }
}
```

### Ví Dụ C#/.NET

```csharp
// TỆ: Cache không giới hạn
public class BadCache
{
    private readonly Dictionary<string, object> _cache = new();

    public T Get<T>(string key, Func<T> factory)
    {
        if (_cache.TryGetValue(key, out var cached))
        {
            return (T)cached;
        }

        var value = factory();
        _cache[key] = value; // Không bao giờ được dọn dẹp
        return value;
    }
}

// TỐT: MemoryCache với các tùy chọn
public class GoodCache
{
    private readonly MemoryCache _cache = new(new MemoryCacheOptions
    {
        SizeLimit = 1000,
        CompactionPercentage = 0.25
    });

    public T Get<T>(string key, Func<T> factory, TimeSpan? expiration = null)
    {
        return _cache.GetOrCreate(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(30);
            entry.Size = 1;
            return factory();
        });
    }

    public void Dispose() => _cache.Dispose();
}
```

### Cache Với Bối Cảnh Lớn

```javascript
// TỆ: Cache nắm giữ các đối tượng lớn trong closure
function createCacheForDataset(largeDataset) {
    const cache = new Map();

    return function(key) {
        if (cache.has(key)) {
            return cache.get(key);
        }

        // Xử lý tham chiếu toàn bộ largeDataset
        const result = processData(largeDataset, key);
        cache.set(key, result); // Cache phát triển, tham chiếu dữ liệu lớn
        return result;
    };
}
```

## Tác Động Của Rò Rỉ Bộ Nhớ Cache

Rò rỉ bộ nhớ cache đặc biệt nguy hiểm vì:

- **Tăng Trưởng Không Giới Hạn**: Kích thước cache có thể tăng vô hạn mà không có chính sách loại bỏ phù hợp
- **Áp Lực Bộ Nhớ**: Cache lớn có thể tiêu thụ toàn bộ bộ nhớ khả dụng
- **Suy Giảm Hiệu Suất**: Cache lớn làm chậm việc tra cứu và loại bỏ
- **Sự Cố Ứng Dụng**: Cuối cùng dẫn đến lỗi hết bộ nhớ
- **Hiệu Ứng Liên Hoàn**: Có thể kích hoạt áp lực thu gom rác ảnh hưởng đến toàn bộ ứng dụng

## Các Mẫu Rò Rỉ Cache Phổ Biến

### 1. Thiếu Chính Sách Loại Bỏ

```javascript
// TỆ: Không có giới hạn kích thước hoặc thời gian
class MemoryHog {
    constructor() {
        this.cache = new Map();
    }

    cache(key, value) {
        this.cache.set(key, value);
        // Cache phát triển mãi mãi
    }
}

// TỐT: Loại bỏ dựa trên kích thước
class SizeAwareCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}
```

### 2. Bỏ Qua TTL

```javascript
// TỆ: TTL không được thực thi
class LazyTTLCache {
    constructor() {
        this.cache = new Map();
    }

    set(key, value, ttl) {
        this.cache.set(key, { value, expires: Date.now() + ttl });
        // Không bao giờ thực sự xóa các mục đã hết hạn
    }

    get(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expires) {
            return item.value;
        }
        return null; // Nhưng không dọn dẹp mục đã hết hạn
    }
}

// TỐT: Thực thi TTL chủ động
class ActiveTTLCache {
    constructor() {
        this.cache = new Map();
        this.cleanup();
    }

    set(key, value, ttl) {
        this.cache.set(key, { value, expires: Date.now() + ttl });
    }

    get(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expires) {
            return item.value;
        }
        this.cache.delete(key); // Dọn dẹp mục đã hết hạn
        return null;
    }

    cleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache) {
                if (now >= item.expires) {
                    this.cache.delete(key);
                }
            }
        }, 60000); // Dọn dẹp mỗi phút
    }
}
```

### 3. Tham Chiếu Vòng Trong Cache

```javascript
// TỆ: Tham chiếu vòng ngăn cản GC
const userCache = new Map();
const postCache = new Map();

function cacheUser(user) {
    user.posts = user.postIds.map(id => getPost(id));
    userCache.set(user.id, user);
}

function cachePost(post) {
    post.author = getUser(post.authorId);
    postCache.set(post.id, post);
}

// TỐT: Sử dụng WeakMap hoặc tránh tham chiếu vòng
const userCache = new Map();
const postCache = new Map();

function cacheUser(user) {
    // Chỉ lưu trữ ID, không phải đối tượng
    userCache.set(user.id, {
        ...user,
        postIds: user.postIds // Giữ tham chiếu như ID
    });
}

function cachePost(post) {
    postCache.set(post.id, {
        ...post,
        authorId: post.authorId // Giữ tham chiếu như ID
    });
}
```

## Phương Pháp Phát Hiện

### 1. Giám Sát Kích Thước Cache

```javascript
class MonitoredCache {
    constructor(name, maxSize = 1000) {
        this.name = name;
        this.cache = new Map();
        this.maxSize = maxSize;
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };

        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            console.log(`Cache ${this.name}:`, {
                size: this.cache.size,
                maxSize: this.maxSize,
                usage: `${(this.cache.size / this.maxSize * 100).toFixed(1)}%`,
                hitRate: `${(this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)}%`,
                evictions: this.stats.evictions
            });
        }, 30000);
    }

    get(key) {
        if (this.cache.has(key)) {
            this.stats.hits++;
            return this.cache.get(key);
        }
        this.stats.misses++;
        return null;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.stats.evictions++;
        }
        this.cache.set(key, value);
    }
}
```

### 2. Theo Dõi Sử Dụng Bộ Nhớ

```javascript
function trackCacheMemory(cache, intervalMs = 30000) {
    const originalSet = cache.set.bind(cache);
    const originalDelete = cache.delete.bind(cache);

    let memoryUsage = 0;

    cache.set = function(key, value) {
        // Ước tính bộ nhớ thô
        memoryUsage += JSON.stringify(key).length + JSON.stringify(value).length;
        return originalSet(key, value);
    };

    cache.delete = function(key) {
        const value = cache.get(key);
        if (value !== undefined) {
            memoryUsage -= JSON.stringify(key).length + JSON.stringify(value).length;
        }
        return originalDelete(key);
    };

    setInterval(() => {
        console.log(`Sử dụng bộ nhớ cache: ~${Math.round(memoryUsage / 1024)} KB`);
    }, intervalMs);
}
```

## Chiến Lược Phòng Ngừa

### 1. Sử Dụng Thư Viện Cache Đã Được Kiểm Chứng

```javascript
// Node.js: Sử dụng node-cache
const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: 600, // TTL mặc định 10 phút
    maxKeys: 1000,
    checkperiod: 60 // Kiểm tra khóa đã hết hạn mỗi phút
});

// Trình duyệt: Sử dụng quick-lru
import QuickLRU from 'quick-lru';
const cache = new QuickLRU({ maxSize: 1000 });
```

### 2. Triển Khai Metrics Cache

```javascript
class MetricsCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            evictions: 0,
            memoryUsage: 0
        };
    }

    get(key) {
        if (this.cache.has(key)) {
            this.metrics.hits++;
            return this.cache.get(key);
        }
        this.metrics.misses++;
        return null;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, value);
        this.metrics.sets++;
        this.updateMemoryUsage();
    }

    getMetrics() {
        return {
            ...this.metrics,
            size: this.cache.size,
            hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses)
        };
    }
}
```

### 3. Khởi Động Cache và Tải Trước

```javascript
class WarmCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.warmupKeys = new Set();
    }

    // Đánh dấu khóa quan trọng cho khởi động
    markForWarmup(key) {
        this.warmupKeys.add(key);
    }

    // Tải trước dữ liệu quan trọng
    async warmup(dataLoader) {
        for (const key of this.warmupKeys) {
            try {
                const value = await dataLoader(key);
                this.set(key, value);
            } catch (error) {
                console.warn(`Không thể khởi động khóa ${key}:`, error);
            }
        }
    }

    // Đảm bảo khóa khởi động không bao giờ bị loại bỏ
    set(key, value) {
        if (this.cache.size >= this.maxSize && !this.warmupKeys.has(key)) {
            this.evictNonWarmupKey();
        }
        this.cache.set(key, value);
    }

    evictNonWarmupKey() {
        for (const [key] of this.cache) {
            if (!this.warmupKeys.has(key)) {
                this.cache.delete(key);
                break;
            }
        }
    }
}
```

## Kiểm Thử Rò Rỉ Bộ Nhớ Cache

### Kiểm Thử Thủ Công

Sử dụng API demo của chúng tôi để mô phỏng rò rỉ cache:

```bash
# Bắt đầu rò rỉ cache
curl -X POST http://localhost:3000/memory-leak/cache/start

# Kiểm tra trạng thái
curl http://localhost:3000/memory-leak/cache/status

# Dừng rò rỉ
curl -X POST http://localhost:3000/memory-leak/cache/stop
```

### Kiểm Thử Tự Động

```javascript
describe('Kiểm Thử Rò Rỉ Bộ Nhớ Cache', () => {
    test('cache nên tôn trọng giới hạn kích thước', () => {
        const cache = new LRUCache(10);

        // Lấp đầy cache vượt quá giới hạn
        for (let i = 0; i < 20; i++) {
            cache.set(`key${i}`, `value${i}`);
        }

        expect(cache.size).toBe(10);
        expect(cache.get('key0')).toBeNull(); // Nên bị loại bỏ
        expect(cache.get('key19')).toBe('value19'); // Nên tồn tại
    });

    test('cache nên loại bỏ các mục đã hết hạn', async () => {
        const cache = new TTLCache(100); // TTL 100ms

        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBe('value1');

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(cache.get('key1')).toBeNull();
    });
});
```

## Thực Hành Tốt Nhất

### 1. Đặt Giới Hạn Phù Hợp

```javascript
// Tính toán kích thước cache dựa trên bộ nhớ khả dụng
const totalMemory = process.memoryUsage().heapTotal;
const cacheMemoryLimit = totalMemory * 0.1; // 10% của heap
const avgItemSize = 1024; // Ước tính 1KB mỗi mục
const maxCacheSize = Math.floor(cacheMemoryLimit / avgItemSize);

const cache = new LRUCache(maxCacheSize);
```

### 2. Giám Sát Hiệu Suất Cache

```javascript
class PerformanceAwareCache {
    constructor(maxSize) {
        this.cache = new LRUCache(maxSize);
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            const metrics = this.cache.getMetrics();

            if (metrics.hitRate < 0.5) {
                console.warn('Tỷ lệ cache hit thấp:', metrics.hitRate);
            }

            if (metrics.size / metrics.maxSize > 0.9) {
                console.warn('Cache gần đầy');
            }
        }, 60000);
    }
}
```

### 3. Triển Khai Cache Invalidation

```javascript
class InvalidatableCache {
    constructor(maxSize) {
        this.cache = new Map();
        this.tags = new Map(); // key -> Set of tags
        this.tagKeys = new Map(); // tag -> Set of keys
        this.maxSize = maxSize;
    }

    set(key, value, tags = []) {
        this.cache.set(key, value);
        this.tags.set(key, new Set(tags));

        for (const tag of tags) {
            if (!this.tagKeys.has(tag)) {
                this.tagKeys.set(tag, new Set());
            }
            this.tagKeys.get(tag).add(key);
        }
    }

    invalidateByTag(tag) {
        if (this.tagKeys.has(tag)) {
            for (const key of this.tagKeys.get(tag)) {
                this.cache.delete(key);
                this.tags.delete(key);
            }
            this.tagKeys.delete(tag);
        }
    }
}
```

## Chủ Đề Liên Quan

- [Rò Rỉ Bộ Nhớ Biến Toàn Cục](./global-variables.md)
- [Rò Rỉ Bộ Nhớ Closure](./closures.md)
- [Rò Rỉ Event Listener](./event-listeners.md)
- [Rò Rỉ Bộ Nhớ Timer](./timers.md)

## Demo

Hãy thử demo tương tác về rò rỉ cache trong [NestJS Demo](../demos/nestjs.md) để xem các khái niệm này trong thực tế.
