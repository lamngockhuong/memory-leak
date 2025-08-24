# JavaScript/TypeScript Memory Leaks

JavaScript and TypeScript applications are particularly susceptible to memory leaks due to their dynamic nature and closure-based programming patterns. This guide covers both browser and Node.js environments.

## Understanding JavaScript Memory Management

### Garbage Collection in V8

JavaScript uses automatic memory management through the V8 garbage collector:

- **Mark and Sweep**: Identifies unreachable objects and frees their memory
- **Generational Collection**: Optimizes for short-lived vs long-lived objects
- **Incremental Collection**: Reduces pause times by spreading GC work over time

### When GC Cannot Help

Garbage collection only works when objects are truly unreachable. Memory leaks occur when:

- Objects remain **referenced** but are no longer **needed**
- **Global variables** prevent normal cleanup
- **Event listeners** maintain object references
- **Closures** capture large contexts unintentionally

## Common JavaScript Memory Leak Patterns

### 1. Global Variables

**Problem**: Variables in global scope persist for application lifetime

```javascript
// BAD: Global variables accumulating data
var userData = [];
var cache = {};

function processUser(user) {
    userData.push(user);        // Never cleaned up
    cache[user.id] = user;      // Grows indefinitely
}
```

**Solution**: Use module scope and implement cleanup

```javascript
// GOOD: Module-scoped with limits
const UserManager = (function() {
    let userData = [];
    let cache = new Map();
    const MAX_CACHE_SIZE = 1000;

    return {
        processUser(user) {
            userData.push(user);
            cache.set(user.id, user);

            // Implement cleanup
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

### 2. Event Listeners

**Problem**: Event listeners hold references to DOM elements and callback contexts

```javascript
// BAD: Event listeners without cleanup
function setupComponent() {
    const element = document.getElementById('myButton');
    const largeData = new Array(1000000).fill('data');

    element.addEventListener('click', function() {
        console.log('Clicked', largeData.length); // Holds reference to largeData
    });

    // When component is removed, listener still exists!
}
```

**Solution**: Always remove event listeners

```javascript
// GOOD: Proper event listener cleanup
function setupComponent() {
    const element = document.getElementById('myButton');
    const largeData = new Array(1000000).fill('data');

    function clickHandler() {
        console.log('Clicked', largeData.length);
    }

    element.addEventListener('click', clickHandler);

    // Return cleanup function
    return function cleanup() {
        element.removeEventListener('click', clickHandler);
        // largeData can now be garbage collected
    };
}

// Usage
const cleanup = setupComponent();
// Later...
cleanup();
```

### 3. Closures

**Problem**: Closures capture entire lexical scope, including large objects

```javascript
// BAD: Closure captures unnecessary large objects
function createHandler(largeObject) {
    const hugeArray = new Array(1000000).fill(largeObject);

    return function smallHandler(event) {
        // Only uses event, but closure captures hugeArray too!
        console.log('Event:', event.type);
    };
}
```

**Solution**: Minimize closure scope

```javascript
// GOOD: Extract only what's needed
function createHandler(largeObject) {
    const hugeArray = new Array(1000000).fill(largeObject);

    // Extract only needed data
    const eventType = largeObject.type;

    return function smallHandler(event) {
        console.log('Event:', event.type, 'Type:', eventType);
        // hugeArray is not captured in closure
    };
}
```

### 4. Timers and Intervals

**Problem**: Timers keep callbacks and their closures alive

```javascript
// BAD: Timer holds references indefinitely
function startPolling(element) {
    const largeData = new Array(1000000).fill('polling');

    const interval = setInterval(function() {
        if (element.isConnected) {
            console.log('Polling...', largeData.length);
        }
        // Timer keeps running even if element is removed!
    }, 1000);

    // No cleanup mechanism
}
```

**Solution**: Always clear timers

```javascript
// GOOD: Proper timer cleanup
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

### 5. DOM References

**Problem**: JavaScript holds references to removed DOM elements

```javascript
// BAD: Holding references to detached DOM
const elementCache = [];

function cacheElement(selector) {
    const element = document.querySelector(selector);
    elementCache.push(element);

    // Later, element might be removed from DOM
    // but still referenced in cache
}
```

**Solution**: Use WeakMap or clean references

```javascript
// GOOD: Use WeakMap for DOM references
const elementMetadata = new WeakMap();

function attachMetadata(element, data) {
    elementMetadata.set(element, data);
    // When element is removed from DOM and no other references exist,
    // it can be garbage collected along with its metadata
}

// OR: Regular cleanup
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

// Run cleanup periodically
setInterval(cleanupCache, 60000);
```

## Node.js Specific Patterns

### 1. Stream Leaks

**Problem**: Streams not properly closed

```javascript
// BAD: Stream without proper cleanup
const fs = require('fs');

function processFile(filename) {
    const stream = fs.createReadStream(filename);

    stream.on('data', (chunk) => {
        // Process chunk
    });

    // No error handling or cleanup
}
```

**Solution**: Always handle stream lifecycle

```javascript
// GOOD: Proper stream handling
const fs = require('fs');

function processFile(filename) {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filename);

        stream.on('data', (chunk) => {
            // Process chunk
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

### 2. HTTP Request Leaks

**Problem**: HTTP requests without timeout or proper cleanup

```javascript
// BAD: HTTP requests without limits
const requests = [];

function makeRequest(url) {
    const req = http.get(url, (res) => {
        // Handle response
    });

    requests.push(req); // Accumulates requests
    // No timeout or cleanup
}
```

**Solution**: Set timeouts and clean up

```javascript
// GOOD: Proper HTTP request handling
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

// Cleanup function
function abortAllRequests() {
    for (const req of activeRequests) {
        req.abort();
    }
    activeRequests.clear();
}
```

## TypeScript Specific Considerations

### 1. Type Safety for Memory Management

```typescript
// Use types to enforce cleanup
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

### 2. Strict Event Listener Types

```typescript
// Type-safe event listener management
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

## Framework-Specific Patterns

### React Memory Leaks

```jsx
// BAD: Memory leaks in React
function BadComponent() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => [...prev, Date.now()]);
        }, 1000);

        // Missing cleanup!
    }, []);

    return <div>{data.length} items</div>;
}

// GOOD: Proper cleanup
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

### Vue.js Memory Leaks

```javascript
// BAD: Memory leaks in Vue
export default {
    created() {
        this.interval = setInterval(() => {
            this.data.push(Date.now());
        }, 1000);

        // No cleanup in beforeDestroy/beforeUnmount
    },

    data() {
        return { data: [] };
    }
};

// GOOD: Proper cleanup
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

## Detection Tools

### Browser DevTools

**Memory Tab**:
1. Take heap snapshots before/after operations
2. Compare snapshots to find growing objects
3. Use allocation timeline to track memory usage

**Performance Tab**:
1. Record memory usage over time
2. Identify memory spikes and leaks
3. Analyze garbage collection frequency

### Node.js Tools

**Built-in Profiling**:
```bash
# Enable heap profiling
node --inspect --expose-gc app.js

# Connect Chrome DevTools to Node.js
```

**Memory Usage Monitoring**:
```javascript
const used = process.memoryUsage();
console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`
});
```

**Heap Dumps**:
```javascript
const v8 = require('v8');
const fs = require('fs');

// Take heap snapshot
const heapSnapshot = v8.writeHeapSnapshot();
console.log('Heap snapshot written to', heapSnapshot);
```

## Prevention Best Practices

### 1. Use ESLint Rules

```json
{
    "rules": {
        "no-global-assign": "error",
        "no-implicit-globals": "error",
        "no-undef": "error"
    }
}
```

### 2. Implement Resource Management

```typescript
// Resource management pattern
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

### 3. Memory Usage Monitoring

```javascript
// Production memory monitoring
function setupMemoryMonitoring() {
    if (typeof window !== 'undefined' && 'performance' in window) {
        // Browser environment
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
        // Node.js environment
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

## Testing for Memory Leaks

### Automated Testing

```javascript
// Jest test for memory leaks
describe('Memory Leak Tests', () => {
    let initialMemory;

    beforeEach(() => {
        if (global.gc) global.gc(); // Requires --expose-gc
        initialMemory = process.memoryUsage().heapUsed;
    });

    afterEach(() => {
        if (global.gc) global.gc();
        const finalMemory = process.memoryUsage().heapUsed;
        const growth = finalMemory - initialMemory;

        // Allow some growth but not excessive
        expect(growth).toBeLessThan(10 * 1024 * 1024); // 10MB
    });

    test('should not leak memory during operation', () => {
        // Your test code here
        for (let i = 0; i < 1000; i++) {
            const component = createComponent();
            component.destroy();
        }
    });
});
```

### Load Testing

```javascript
// Load test to detect memory leaks
async function loadTest() {
    console.log('Starting load test...');

    for (let i = 0; i < 10000; i++) {
        await performOperation();

        if (i % 1000 === 0) {
            const usage = process.memoryUsage();
            console.log(`Iteration ${i}: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);

            if (global.gc) global.gc();
        }
    }

    console.log('Load test completed');
}
```

## Related Resources

- [Global Variables Pattern](/patterns/global-variables) - Detailed analysis of global variable leaks
- [Event Listeners Pattern](/patterns/event-listeners) - Event listener memory management
- [Closures Pattern](/patterns/closures) - Understanding closure-based leaks
- [NestJS Demo](/demos/nestjs) - Hands-on Node.js memory leak examples
- [Browser DevTools Guide](/tools/browser-devtools) - Using Chrome DevTools for analysis
- [Node.js Profiling Guide](/tools/nodejs-profiling) - Node.js specific profiling tools
