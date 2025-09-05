# Global Variable Memory Leaks

Global variable memory leaks are one of the most common and persistent types of memory leaks in JavaScript applications. They occur when variables in the global scope accumulate data without proper cleanup, preventing the garbage collector from freeing memory.

## What are Global Variable Leaks?

Global variable leaks happen when:

1. **Variables declared in global scope** accumulate data over time
2. **Implicit global variables** are created accidentally
3. **Module-level variables** grow without bounds
4. **Window/global object properties** are added but never removed

## How Global Variable Leaks Occur

### Example: Accidental Global Variables

```javascript
// BAD: Implicit global variable
function processUser(user) {
    userData = user; // Missing 'var', 'let', or 'const'
    // Creates window.userData or global.userData
}
```

### Example: Growing Global Arrays

```javascript
// BAD: Global array that never gets cleaned
var globalCache = [];
var userSessions = [];

function addToCache(item) {
    globalCache.push(item); // Grows indefinitely
}

function trackUser(user) {
    userSessions.push(user); // Never removes old sessions
}
```

### Example: Global Object Properties

```javascript
// BAD: Global object accumulating properties
window.appData = window.appData || {};

function storeData(key, value) {
    window.appData[key] = value; // Properties never removed
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

```javascript
// Browser: Check window object
console.log(Object.keys(window).filter(key =>
    typeof window[key] === 'object' && window[key] !== null
));

// Node.js: Check global object
console.log(Object.keys(global).filter(key =>
    typeof global[key] === 'object' && global[key] !== null
));
```

### 2. Memory Usage Monitoring

```javascript
// Track memory usage over time
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

### 3. Property Counting

```javascript
// Count properties in global objects
function countGlobalProperties() {
    const globalObj = typeof window !== 'undefined' ? window : global;
    const userProperties = Object.keys(globalObj).filter(key =>
        !['console', 'process', 'Buffer', 'global'].includes(key)
    );
    console.log(`Global properties: ${userProperties.length}`);
    return userProperties;
}
```

## Prevention Strategies

### 1. Use Module Patterns

```javascript
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
// GOOD: Self-limiting global cache
class GlobalCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}

// Usage
window.globalCache = new GlobalCache(500);
```

### 3. Use WeakMap for References

```javascript
// GOOD: WeakMap for object references
const objectMetadata = new WeakMap();

function attachMetadata(obj, metadata) {
    objectMetadata.set(obj, metadata);
    // Metadata is automatically cleaned when obj is garbage collected
}
```

### 4. Periodic Cleanup

```javascript
// GOOD: Scheduled cleanup
class ManagedGlobalData {
    constructor() {
        this.data = new Map();
        this.timestamps = new Map();
        this.maxAge = 5 * 60 * 1000; // 5 minutes

        // Cleanup every minute
        setInterval(() => this.cleanup(), 60000);
    }

    set(key, value) {
        this.data.set(key, value);
        this.timestamps.set(key, Date.now());
    }

    cleanup() {
        const now = Date.now();
        for (const [key, timestamp] of this.timestamps) {
            if (now - timestamp > this.maxAge) {
                this.data.delete(key);
                this.timestamps.delete(key);
            }
        }
    }
}
```

## Testing Global Variable Leaks

### Manual Testing

Use our demo API to simulate global variable leaks:

```bash
# Start global variable leak
curl http://localhost:3000/global-variable-leak

# Monitor memory for 10 seconds
# Expected: Memory usage increases temporarily
```

### Automated Testing

```javascript
// Jest test for global variable prevention
describe('Global Variable Leak Prevention', () => {
    let originalGlobalKeys;

    beforeEach(() => {
        const globalObj = typeof window !== 'undefined' ? window : global;
        originalGlobalKeys = new Set(Object.keys(globalObj));
    });

    afterEach(() => {
        // Check for new global variables
        const globalObj = typeof window !== 'undefined' ? window : global;
        const currentKeys = Object.keys(globalObj);
        const newKeys = currentKeys.filter(key => !originalGlobalKeys.has(key));

        if (newKeys.length > 0) {
            console.warn('New global variables detected:', newKeys);
            // Clean up
            newKeys.forEach(key => delete globalObj[key]);
        }
    });

    test('should not create global variables', () => {
        // Your test code here
        expect(true).toBe(true);
    });
});
```

## Best Practices

### 1. Always Use Strict Mode

```javascript
'use strict';

function processData() {
    userData = {}; // This will throw an error in strict mode
}
```

### 2. Namespace Your Globals

```javascript
// GOOD: Single global namespace
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

### 3. Use ESM or CommonJS Modules

```javascript
// GOOD: ES Module (no globals)
// userManager.js
const userData = [];
const cache = new Map();

export function addUser(user) {
    userData.push(user);
}

export function clearData() {
    userData.length = 0;
    cache.clear();
}
```

### 4. Regular Auditing

```javascript
// Development helper to audit globals
function auditGlobalVariables() {
    const globalObj = typeof window !== 'undefined' ? window : global;
    const suspiciousKeys = Object.keys(globalObj).filter(key => {
        const value = globalObj[key];
        return value &&
               typeof value === 'object' &&
               (Array.isArray(value) ? value.length > 100 : Object.keys(value).length > 50);
    });

    console.table(suspiciousKeys.map(key => ({
        name: key,
        type: Array.isArray(globalObj[key]) ? 'Array' : 'Object',
        size: Array.isArray(globalObj[key]) ?
              globalObj[key].length :
              Object.keys(globalObj[key]).length
    })));
}
```

## Related Topics

- [Timer Memory Leaks](./timers.md)
- [Event Listener Leaks](./event-listeners.md)
- [Closure Memory Leaks](./closures.md)
- [Cache Memory Leaks](./caching.md)
