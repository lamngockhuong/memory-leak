# Cache Memory Leaks

Cache memory leaks occur when caching mechanisms accumulate data without proper eviction policies, leading to unbounded memory growth. This is particularly common in applications that implement custom caching solutions or misuse caching libraries.

## What are Cache Memory Leaks?

Cache memory leaks happen when:

1. **Cache grows without bounds** due to missing eviction policies
2. **TTL (Time To Live) is not enforced** properly
3. **Cache keys are not cleaned up** when no longer needed
4. **Circular references exist** between cached objects
5. **Memory limits are not set** for cache implementations

## Language-Specific Cache Mechanisms

### JavaScript/Node.js

- `Map`, `Set`, custom objects for caching
- Third-party libraries: `node-cache`, `lru-cache`
- Browser: `localStorage`, `sessionStorage`, `indexedDB`

### Java

- Built-in: `HashMap`, `ConcurrentHashMap`
- Guava Cache, Caffeine, Ehcache
- Spring Framework caching annotations

### Python

- Built-in: `dict`, `functools.lru_cache`
- Third-party: `cachetools`, `diskcache`, `Redis`
- Django/Flask caching frameworks

### Go

- Built-in: `map`, `sync.Map`
- Third-party: `go-cache`, `groupcache`, `bigcache`
- Redis clients for distributed caching

### C#/.NET

- Built-in: `MemoryCache`, `Dictionary`
- Redis.NET, NCache
- ASP.NET Core caching providers

## How Cache Memory Leaks Occur

### JavaScript/Node.js Example

```javascript
// BAD: Unbounded cache
const cache = new Map();

function getData(key) {
    if (cache.has(key)) {
        return cache.get(key);
    }

    const data = expensiveOperation(key);
    cache.set(key, data); // Never cleaned up
    return data;
}

// GOOD: LRU cache with size limit
class LRUCache {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value); // Move to end
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

### Java Example

```java
// BAD: Unbounded cache
public class BadCache {
    private Map<String, Object> cache = new HashMap<>();

    public Object get(String key) {
        return cache.computeIfAbsent(key, this::expensiveOperation);
    }
}

// GOOD: Guava cache with eviction
public class GoodCache {
    private final Cache<String, Object> cache = CacheBuilder.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .removalListener(entry -> System.out.println("Evicted: " + entry.getKey()))
        .build();

    public Object get(String key) {
        return cache.get(key, this::expensiveOperation);
    }
}
```

### Python Example

```python
# BAD: Unbounded cache
class BadCache:
    def __init__(self):
        self.cache = {}

    def get(self, key):
        if key not in self.cache:
            self.cache[key] = self.expensive_operation(key)
        return self.cache[key]

# GOOD: Using functools.lru_cache
from functools import lru_cache
import time

class GoodCache:
    @lru_cache(maxsize=1000)
    def get_data(self, key):
        return self.expensive_operation(key)

    def clear_cache(self):
        self.get_data.cache_clear()
```

### Go Example

```go
// BAD: Unbounded cache
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
    c.data[key] = val // Never cleaned up
    c.mu.Unlock()
    return val
}

// GOOD: Cache with TTL
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

### C#/.NET Example

```csharp
// BAD: Unbounded cache
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
        _cache[key] = value; // Never cleaned up
        return value;
    }
}

// GOOD: MemoryCache with options
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

### Cache with Large Context

```javascript
// BAD: Cache captures large objects in closure
function createCacheForDataset(largeDataset) {
    const cache = new Map();

    return function(key) {
        if (cache.has(key)) {
            return cache.get(key);
        }

        // Processing references entire largeDataset
        const result = processData(largeDataset, key);
        cache.set(key, result); // Cache grows, references large data
        return result;
    };
}
```

## Impact of Cache Memory Leaks

Cache memory leaks are particularly dangerous because:

- **Unbounded Growth**: Cache size can grow indefinitely without proper eviction
- **Memory Pressure**: Large caches can consume all available memory
- **Performance Degradation**: Large caches slow down lookups and eviction
- **Application Crashes**: Eventually lead to out-of-memory errors
- **Cascading Effects**: Can trigger garbage collection pressure affecting entire application

## Common Cache Leak Patterns

### 1. Missing Eviction Policy

```javascript
// BAD: No size or time limits
class MemoryHog {
    constructor() {
        this.cache = new Map();
    }

    cache(key, value) {
        this.cache.set(key, value);
        // Cache grows forever
    }
}

// GOOD: Size-based eviction
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

### 2. Ignored TTL

```javascript
// BAD: TTL not enforced
class LazyTTLCache {
    constructor() {
        this.cache = new Map();
    }

    set(key, value, ttl) {
        this.cache.set(key, { value, expires: Date.now() + ttl });
        // Never actually removes expired items
    }

    get(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expires) {
            return item.value;
        }
        return null; // But doesn't clean up expired item
    }
}

// GOOD: Active TTL enforcement
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
        this.cache.delete(key); // Clean up expired item
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
        }, 60000); // Clean up every minute
    }
}
```

### 3. Circular References in Cache

```javascript
// BAD: Circular references prevent GC
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

// GOOD: Use WeakMap or avoid circular refs
const userCache = new Map();
const postCache = new Map();

function cacheUser(user) {
    // Store only IDs, not objects
    userCache.set(user.id, {
        ...user,
        postIds: user.postIds // Keep references as IDs
    });
}

function cachePost(post) {
    postCache.set(post.id, {
        ...post,
        authorId: post.authorId // Keep references as IDs
    });
}
```

## Detection Methods

### 1. Cache Size Monitoring

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

### 2. Memory Usage Tracking

```javascript
function trackCacheMemory(cache, intervalMs = 30000) {
    const originalSet = cache.set.bind(cache);
    const originalDelete = cache.delete.bind(cache);

    let memoryUsage = 0;

    cache.set = function(key, value) {
        // Rough memory estimation
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
        console.log(`Cache memory usage: ~${Math.round(memoryUsage / 1024)} KB`);
    }, intervalMs);
}
```

## Prevention Strategies

### 1. Use Proven Cache Libraries

```javascript
// Node.js: Use node-cache
const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: 600, // 10 minutes default TTL
    maxKeys: 1000,
    checkperiod: 60 // Check for expired keys every minute
});

// Browser: Use quick-lru
import QuickLRU from 'quick-lru';
const cache = new QuickLRU({ maxSize: 1000 });
```

### 2. Implement Cache Metrics

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

### 3. Cache Warming and Preloading

```javascript
class WarmCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.warmupKeys = new Set();
    }

    // Mark keys as important for warmup
    markForWarmup(key) {
        this.warmupKeys.add(key);
    }

    // Preload important data
    async warmup(dataLoader) {
        for (const key of this.warmupKeys) {
            try {
                const value = await dataLoader(key);
                this.set(key, value);
            } catch (error) {
                console.warn(`Failed to warm up key ${key}:`, error);
            }
        }
    }

    // Ensure warmup keys are never evicted
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

## Testing Cache Memory Leaks

### Manual Testing

Use our demo API to simulate cache leaks:

```bash
# Start cache leak
curl -X POST http://localhost:3000/memory-leak/cache/start

# Check status
curl http://localhost:3000/memory-leak/cache/status

# Stop leak
curl -X POST http://localhost:3000/memory-leak/cache/stop
```

### Automated Testing

```javascript
describe('Cache Memory Leak Tests', () => {
    test('cache should respect size limits', () => {
        const cache = new LRUCache(10);

        // Fill cache beyond limit
        for (let i = 0; i < 20; i++) {
            cache.set(`key${i}`, `value${i}`);
        }

        expect(cache.size).toBe(10);
        expect(cache.get('key0')).toBeNull(); // Should be evicted
        expect(cache.get('key19')).toBe('value19'); // Should exist
    });

    test('cache should evict expired items', async () => {
        const cache = new TTLCache(100); // 100ms TTL

        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBe('value1');

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(cache.get('key1')).toBeNull();
    });
});
```

## Best Practices

### 1. Set Appropriate Limits

```javascript
// Calculate cache size based on available memory
const totalMemory = process.memoryUsage().heapTotal;
const cacheMemoryLimit = totalMemory * 0.1; // 10% of heap
const avgItemSize = 1024; // 1KB per item estimate
const maxCacheSize = Math.floor(cacheMemoryLimit / avgItemSize);

const cache = new LRUCache(maxCacheSize);
```

### 2. Monitor Cache Performance

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
                console.warn('Low cache hit rate:', metrics.hitRate);
            }

            if (metrics.size / metrics.maxSize > 0.9) {
                console.warn('Cache is nearly full');
            }
        }, 60000);
    }
}
```

### 3. Implement Cache Invalidation

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

## Related Topics

- [Global Variable Memory Leaks](./global-variables.md)
- [Closure Memory Leaks](./closures.md)
- [Event Listener Leaks](./event-listeners.md)
- [Timer Memory Leaks](./timers.md)

## Demo

Try the interactive cache leak demo in our [NestJS Demo](../demos/nestjs.md) to see these concepts in action.
