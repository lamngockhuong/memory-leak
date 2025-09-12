# Global Variable Memory Leaks

Global variable memory leaks are one of the most common and persistent types of memory leaks across programming languages. They occur when variables in the global scope accumulate data without proper cleanup, preventing garbage collection of potentially large amounts of memory.

## What are Global Variable Leaks?

Global variable leaks happen when:

1. **Variables declared in global scope** accumulate data over time
2. **Implicit global variables** are created accidentally
3. **Module-level variables** grow without bounds
4. **Static class variables** accumulate data indefinitely
5. **Singleton patterns** hold references longer than necessary

## Language-Specific Global Variable Mechanisms

### JavaScript/Node.js

- `window` object in browsers, `global` object in Node.js
- Implicit globals (variables declared without `var`, `let`, `const`)
- Module-level variables

### Java

- `static` fields and methods
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

- Static fields and properties
- Singleton implementations

## How Global Variable Leaks Occur

### JavaScript/Node.js Example

```javascript
// BAD: Implicit global variable
function processUser(user) {
    userData = user; // Missing 'var', 'let', or 'const'
    // Creates window.userData or global.userData
}

// BAD: Global array that never gets cleaned
var globalCache = [];

function addToCache(item) {
    globalCache.push(item); // Grows indefinitely
}

// GOOD: Module pattern with controlled scope
const UserManager = (function() {
    let userData = []; // Private to module
    let cache = new Map();
    const MAX_CACHE_SIZE = 1000;

    return {
        addUser(user) {
            userData.push(user);
            if (userData.length > MAX_CACHE_SIZE) {
                userData.shift(); // Remove oldest
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

### Java Example

```java
// BAD: Static variables that grow unbounded
public class DataManager {
    private static List<User> allUsers = new ArrayList<>();
    private static Map<String, Object> globalCache = new HashMap<>();

    public static void addUser(User user) {
        allUsers.add(user); // Never cleaned up
        globalCache.put(user.getId(), user.getData());
    }
}

// GOOD: Managed static data with cleanup
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

        // Cleanup old users if needed
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

### Python Example

```python
# BAD: Module-level variables that grow
_global_cache = {}
_user_sessions = []

def add_to_cache(key, value):
    _global_cache[key] = value  # Never cleaned up

def track_user(user):
    _user_sessions.append(user)  # Grows indefinitely

# GOOD: Managed global state with cleanup
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
                # Remove oldest item
                self.cache.popitem(last=False)

            self.cache[key] = value

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            return self.cache.get(key)

    def clear(self):
        with self._lock:
            self.cache.clear()

# Usage
cache = ManagedGlobalCache()
```

### Go Example

```go
// BAD: Package-level variables that grow
package main

var (
    globalData   = make(map[string]interface{})
    userSessions = make([]User, 0)
)

func AddData(key string, value interface{}) {
    globalData[key] = value // Never cleaned up
}

// GOOD: Managed global state with cleanup
package main

import (
    "sync"
    "time"
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
        // Remove oldest (simple approach)
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

### C#/.NET Example

```csharp
// BAD: Static variables that accumulate
public static class BadGlobalManager
{
    private static readonly List<User> AllUsers = new List<User>();
    private static readonly Dictionary<string, object> GlobalCache = new Dictionary<string, object>();

    public static void AddUser(User user)
    {
        AllUsers.Add(user); // Never cleaned up
        GlobalCache[user.Id] = user.Data;
    }
}

// GOOD: Managed static state with cleanup
public static class GoodGlobalManager
{
    private static readonly ConcurrentDictionary<string, object> Cache =
        new ConcurrentDictionary<string, object>();
    private static readonly int MaxCacheSize = 1000;

    public static void AddData(string key, object value)
    {
        if (Cache.Count >= MaxCacheSize)
        {
            // Remove oldest entries (simple LRU-like)
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

### Global Variable with Large Context

```javascript
// BAD: Global variable captures large context
function processLargeDataset(dataset) {
    const hugeArray = new Array(1000000).fill(dataset);

    // Global variable holds reference to huge data
    window.processedData = hugeArray;
}
```

## Impact of Global Variable Leaks

Global variable leaks are dangerous because:

- **Persistent References**: Global variables are never garbage collected
- **Memory Accumulation**: Data grows linearly with application usage
- **Performance Degradation**: Large global objects slow down property access
- **Memory Pressure**: Can lead to browser/Node.js crashes

## Detection Methods

### 1. Global Scope Inspection

**JavaScript:**

```javascript
// Browser and Node.js
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
// Check static fields via reflection
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

## Prevention Strategies

### 1. Always Use Strict Mode

```javascript
'use strict';

function processData() {
    userData = {}; // This will throw an error in strict mode
}
```

### 2. Use Proper Scoping and Modules

**JavaScript ES Modules:**

```javascript
// GOOD: ES Module pattern (no globals)
// userManager.js
const userData = [];
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

export function addUser(user) {
    userData.push(user);
    if (userData.length > MAX_CACHE_SIZE) {
        userData.shift(); // Remove oldest
    }
}

export function clearData() {
    userData.length = 0;
    cache.clear();
}
```

**Java:**

```java
// GOOD: Encapsulation instead of static globals
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
# GOOD: Class-based encapsulation
class UserManagerService:
    def __init__(self, max_size=1000):
        self._user_data = []
        self._cache = {}
        self._max_size = max_size

    def add_user(self, user):
        self._user_data.append(user)
        if len(self._user_data) > self._max_size:
            self._user_data.pop(0)  # Remove oldest

    def add_to_cache(self, key, value):
        if len(self._cache) >= self._max_size:
            # Remove oldest entry
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        self._cache[key] = value
```

**Go:**

```go
// GOOD: Struct-based encapsulation
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
        ums.userData = ums.userData[1:] // Remove oldest
    }
}
```

### 3. Implement Size Limits

```javascript
// GOOD: Size-limited global cache
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

// Usage
window.globalCache = new ManagedGlobalCache(500);
```

### 4. Use WeakMap for Object References

```javascript
// GOOD: WeakMap for object references
const objectMetadata = new WeakMap();

function attachMetadata(obj, metadata) {
    objectMetadata.set(obj, metadata);
    // Metadata is automatically cleaned when obj is garbage collected
}
```

## Testing Global Variable Leaks

### Manual Testing

Use our demo API to simulate global variable leaks:

```bash
# Start global variable leak
curl -X POST http://localhost:3000/memory-leak/global-variable/start

# Check status
curl http://localhost:3000/memory-leak/global-variable/status

# Stop leak
curl -X POST http://localhost:3000/memory-leak/global-variable/stop
```

### Automated Testing

```javascript
// Jest test for global variable prevention
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

        // Clean up any new globals created during test
        newKeys.forEach(key => {
            delete globalObj[key];
        });
    });

    test('should not create global variables', () => {
        // Test code that should not create globals
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
// GOOD: Single global namespace
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
// Development helper to audit globals
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

        // Register process cleanup handlers
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
                console.log(`Cleaned up: ${name}`);
            } catch (error) {
                console.error(`Failed to cleanup ${name}:`, error);
            }
        });
    }
}
```

## Related Topics

- [Timer Memory Leaks](./timers.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Try the interactive global variable leak demo in our [NestJS Demo](../demos/nestjs.md) to see these concepts in action.
