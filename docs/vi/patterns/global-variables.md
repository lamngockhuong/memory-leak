# Global Variable Memory Leaks - Rò rỉ bộ nhớ từ Biến toàn cục

Global variable memory leaks là một trong những loại rò rỉ bộ nhớ phổ biến và dai dẳng nhất trong các ngôn ngữ lập trình. Chúng xảy ra khi các biến trong global scope tích lũy dữ liệu mà không được dọn dẹp đúng cách, ngăn cản garbage collector giải phóng lượng lớn bộ nhớ.

## Global Variable Leaks là gì?

Global variable leaks xảy ra khi:

1. **Variables được khai báo trong global scope** tích lũy dữ liệu theo thời gian
2. **Implicit global variables** được tạo ra một cách vô tình
3. **Module-level variables** tăng trưởng không giới hạn
4. **Static class variables** tích lũy dữ liệu vô thời hạn
5. **Singleton patterns** giữ references lâu hơn cần thiết

## Cơ chế Global Variable theo từng ngôn ngữ

### JavaScript/Node.js

- Object `window` trong browsers, object `global` trong Node.js
- Implicit globals (variables khai báo không có `var`, `let`, `const`)
- Module-level variables

### Java

- Các `static` fields và methods
- Singleton patterns
- Static collections

### Python

- Module-level variables
- Class variables
- Global dictionaries/lists

### Go

- Package-level variables
- Global slices/maps

### C#/.NET

- Static fields và properties
- Singleton implementations

## Cách Global Variable Leaks xảy ra

### Ví dụ JavaScript/Node.js

```javascript
// SAI: Implicit global variable
function processUser(user) {
    userData = user; // Thiếu 'var', 'let', hoặc 'const'
    // Tạo ra window.userData hoặc global.userData
}

// SAI: Global array không bao giờ được dọn dẹp
var globalCache = [];

function addToCache(item) {
    globalCache.push(item); // Tăng trưởng vô hạn
}

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

        addToCache(key, value) {
            if (cache.size >= MAX_CACHE_SIZE) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            cache.set(key, value);
        },

        clearAll() {
            userData.length = 0;
            cache.clear();
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

### Ví dụ Java

```java
// SAI: Static variables tăng trưởng không giới hạn
public class DataManager {
    private static List<User> allUsers = new ArrayList<>();
    private static Map<String, Object> globalCache = new HashMap<>();

    public static void addUser(User user) {
        allUsers.add(user); // Không bao giờ được dọn dẹp
        globalCache.put(user.getId(), user.getData());
    }
}

// ĐÚNG: Managed static data với cleanup
public class GoodDataManager {
    private static final int MAX_CACHE_SIZE = 1000;
    private static final Map<String, Object> cache =
        new LinkedHashMap<String, Object>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, Object> eldest) {
                return size() > MAX_CACHE_SIZE;
            }
        };

    private static final List<User> users = new ArrayList<>();

    public static synchronized void addUser(User user) {
        users.add(user);
        cache.put(user.getId(), user.getData());

        // Cleanup users cũ nếu cần
        if (users.size() > MAX_CACHE_SIZE) {
            users.subList(0, users.size() - MAX_CACHE_SIZE).clear();
        }
    }

    public static synchronized void clearCache() {
        cache.clear();
        users.clear();
    }
}
```

### Ví dụ Python

```python
# SAI: Module-level variables tăng trưởng
_global_cache = {}
_user_sessions = []

def add_to_cache(key, value):
    _global_cache[key] = value  # Không bao giờ được dọn dẹp

def track_user(user):
    _user_sessions.append(user)  # Tăng trưởng vô hạn

# ĐÚNG: Managed global state với cleanup
import threading
from collections import OrderedDict
from typing import Any, Optional

class ManagedGlobalCache:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.cache = OrderedDict()
            self.max_size = 1000
            self.initialized = True

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            if len(self.cache) >= self.max_size:
                # Xóa item cũ nhất
                self.cache.popitem(last=False)

            self.cache[key] = value

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            return self.cache.get(key)

    def clear(self):
        with self._lock:
            self.cache.clear()

# Sử dụng
cache = ManagedGlobalCache()
```

### Ví dụ Go

```go
// SAI: Package-level variables tăng trưởng
package main

var (
    globalData   = make(map[string]interface{})
    userSessions = make([]User, 0)
)

func AddData(key string, value interface{}) {
    globalData[key] = value // Không bao giờ được dọn dẹp
}

// ĐÚNG: Managed global state với cleanup
package main

import (
    "sync"
)

type ManagedCache struct {
    data    map[string]interface{}
    mu      sync.RWMutex
    maxSize int
}

var globalCache = &ManagedCache{
    data:    make(map[string]interface{}),
    maxSize: 1000,
}

func (c *ManagedCache) Set(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()

    if len(c.data) >= c.maxSize {
        // Xóa entry cũ nhất (cách tiếp cận đơn giản)
        for k := range c.data {
            delete(c.data, k)
            break
        }
    }
    c.data[key] = value
}

func AddData(key string, value interface{}) {
    globalCache.Set(key, value)
}
```

### Ví dụ C#/.NET

```csharp
// SAI: Static variables tích lũy dữ liệu
public static class BadGlobalManager
{
    private static readonly List<User> AllUsers = new List<User>();
    private static readonly Dictionary<string, object> GlobalCache = new Dictionary<string, object>();

    public static void AddUser(User user)
    {
        AllUsers.Add(user); // Không bao giờ được dọn dẹp
        GlobalCache[user.Id] = user.Data;
    }
}

// ĐÚNG: Managed static state với cleanup
public static class GoodGlobalManager
{
    private static readonly ConcurrentDictionary<string, object> Cache =
        new ConcurrentDictionary<string, object>();
    private static readonly int MaxCacheSize = 1000;

    public static void AddData(string key, object value)
    {
        if (Cache.Count >= MaxCacheSize)
        {
            // Xóa các entries cũ (LRU-like đơn giản)
            var keysToRemove = Cache.Keys.Take(Cache.Count / 4).ToList();
            foreach (var keyToRemove in keysToRemove)
            {
                Cache.TryRemove(keyToRemove, out _);
            }
        }

        Cache[key] = value;
    }

    public static void Clear()
    {
        Cache.Clear();
    }
}
```

### Global Variable với Large Context

```javascript
// SAI: Global variable giữ reference đến huge data
function processLargeDataset(dataset) {
    const hugeArray = new Array(1000000).fill(dataset);

    // Global variable giữ reference đến huge data
    window.processedData = hugeArray;
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

**JavaScript:**

```javascript
// Browser và Node.js
function inspectGlobalScope() {
    const globalObj = typeof window !== 'undefined' ? window : global;
    const userGlobals = [];

    for (const key of Object.keys(globalObj)) {
        if (!['console', 'process', 'Buffer', 'global'].includes(key)) {
            userGlobals.push(key);
        }
    }

    return userGlobals;
}
```

**Java:**

```java
// Kiểm tra static fields qua reflection
public class GlobalVariableDetector {
    public static void inspectStaticFields(Class<?> clazz) {
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            if (Modifier.isStatic(field.getModifier())) {
                System.out.println("Static field: " + field.getName());
            }
        }
    }
}
```

### 2. Memory Usage Monitoring

```javascript
// JavaScript: Cross-platform memory monitoring
function getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
        // Node.js
        return process.memoryUsage();
    } else if ('memory' in performance) {
        // Browser
        return performance.memory;
    }
    return null;
}
```

## Chiến lược phòng ngừa

### 1. Luôn sử dụng Strict Mode

```javascript
'use strict';

function processData() {
    userData = {}; // Sẽ throw error trong strict mode
}
```

### 2. Sử dụng Proper Scoping và Modules

**JavaScript ES Modules:**

```javascript
// ĐÚNG: ES Module pattern (không có globals)
// userManager.js
const userData = [];
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

export function addUser(user) {
    userData.push(user);
    if (userData.length > MAX_CACHE_SIZE) {
        userData.shift(); // Xóa cái cũ nhất
    }
}

export function clearData() {
    userData.length = 0;
    cache.clear();
}
```

**Java:**

```java
// ĐÚNG: Encapsulation thay vì static globals
public class UserManagerService {
    private final List<User> userData = new ArrayList<>();
    private final Map<String, Object> cache = new HashMap<>();
    private final int maxSize;

    public UserManagerService(int maxSize) {
        this.maxSize = maxSize;
    }

    public void addUser(User user) {
        userData.add(user);
        if (userData.size() > maxSize) {
            userData.remove(0);
        }
    }
}
```

**Python:**

```python
# ĐÚNG: Class-based encapsulation
class UserManagerService:
    def __init__(self, max_size=1000):
        self._user_data = []
        self._cache = {}
        self._max_size = max_size

    def add_user(self, user):
        self._user_data.append(user)
        if len(self._user_data) > self._max_size:
            self._user_data.pop(0)  # Xóa cái cũ nhất

    def add_to_cache(self, key, value):
        if len(self._cache) >= self._max_size:
            # Xóa entry cũ nhất
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        self._cache[key] = value
```

**Go:**

```go
// ĐÚNG: Struct-based encapsulation
type UserManagerService struct {
    userData []User
    cache    map[string]interface{}
    maxSize  int
    mu       sync.Mutex
}

func NewUserManagerService(maxSize int) *UserManagerService {
    return &UserManagerService{
        userData: make([]User, 0),
        cache:    make(map[string]interface{}),
        maxSize:  maxSize,
    }
}

func (ums *UserManagerService) AddUser(user User) {
    ums.mu.Lock()
    defer ums.mu.Unlock()

    ums.userData = append(ums.userData, user)
    if len(ums.userData) > ums.maxSize {
        ums.userData = ums.userData[1:] // Xóa cái cũ nhất
    }
}
```

### 3. Implement Size Limits

```javascript
// ĐÚNG: Size-limited global cache
class ManagedGlobalCache {
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

// Sử dụng
window.globalCache = new ManagedGlobalCache(500);
```

### 4. Sử dụng WeakMap cho Object References

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
curl -X POST http://localhost:3000/memory-leak/global-variable/start

# Kiểm tra status
curl http://localhost:3000/memory-leak/global-variable/status

# Dừng leak
curl -X POST http://localhost:3000/memory-leak/global-variable/stop
```

### Automated Testing

```javascript
// Jest test cho global variable prevention
describe('Global Variable Leak Prevention', () => {
    let originalGlobalKeys;

    beforeEach(() => {
        const globalObj = typeof window !== 'undefined' ? window : global;
        originalGlobalKeys = Object.keys(globalObj);
    });

    afterEach(() => {
        const globalObj = typeof window !== 'undefined' ? window : global;
        const currentKeys = Object.keys(globalObj);
        const newKeys = currentKeys.filter(key => !originalGlobalKeys.includes(key));

        // Dọn dẹp các globals mới được tạo trong test
        newKeys.forEach(key => {
            delete globalObj[key];
        });
    });

    test('không nên tạo global variables', () => {
        // Test code không nên tạo globals
        function processData() {
            const localData = []; // Properly scoped
            localData.push('test');
        }

        processData();

        const globalObj = typeof window !== 'undefined' ? window : global;
        const currentKeys = Object.keys(globalObj);
        expect(currentKeys).toEqual(originalGlobalKeys);
    });
});
```

## Best Practices

### 1. Namespace Your Globals

```javascript
// ĐÚNG: Single global namespace
window.MyApp = window.MyApp || {
    data: new Map(),
    cache: new Map(),

    addData(key, value) {
        this.data.set(key, value);
    },

    clear() {
        this.data.clear();
        this.cache.clear();
    }
};
```

### 2. Regular Auditing

```javascript
// Development helper để audit globals
function auditGlobalVariables() {
    const globalObj = typeof window !== 'undefined' ? window : global;
    const report = [];

    for (const [key, value] of Object.entries(globalObj)) {
        if (value && typeof value === 'object' &&
            !['console', 'process', 'Buffer'].includes(key)) {

            report.push({
                name: key,
                type: Array.isArray(value) ? 'Array' : 'Object',
                size: Array.isArray(value) ?
                      value.length :
                      Object.keys(value).length
            });
        }
    }

    return report.sort((a, b) => b.size - a.size);
}
```

### 3. Implement Cleanup Strategies

```javascript
// Global cleanup manager
class GlobalCleanupManager {
    constructor() {
        this.cleanupTasks = [];

        // Đăng ký process cleanup handlers
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => this.executeCleanup());
        } else if (typeof process !== 'undefined') {
            process.on('exit', () => this.executeCleanup());
        }
    }

    registerCleanupTask(name, task) {
        this.cleanupTasks.push({ name, task });
    }

    executeCleanup() {
        this.cleanupTasks.forEach(({ name, task }) => {
            try {
                task();
                console.log(`Đã dọn dẹp: ${name}`);
            } catch (error) {
                console.error(`Lỗi khi dọn dẹp ${name}:`, error);
            }
        });
    }
}
```

## Chủ đề liên quan

- [Timer Memory Leaks](./timers.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Thử nghiệm interactive global variable leak demo trong [NestJS Demo](../demos/nestjs.md) để xem các khái niệm này hoạt động.
