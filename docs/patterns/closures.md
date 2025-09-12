# Closure Memory Leaks

Closure memory leaks occur when closures retain references to variables in their outer scope longer than necessary, preventing garbage collection of potentially large objects. This is especially problematic when closures are stored in long-lived data structures or passed as callbacks.

## What are Closure Memory Leaks?

Closure memory leaks happen when:

1. **Closures capture large objects** from their outer scope
2. **Event handlers maintain references** to DOM elements or large data
3. **Callback functions retain parent scope** unnecessarily
4. **Nested functions create circular references**
5. **Module patterns hold onto private data** indefinitely

## How Closure Memory Leaks Occur

### JavaScript/Node.js Example

```javascript
// BAD: Closure retains large object
function createHandler() {
    const largeData = new Array(1000000).fill('data');
    const metadata = { info: 'small data' };

    return function handler(event) {
        // Only uses metadata, but closure keeps largeData alive
        console.log(metadata.info, event.type);
    };
}

// GOOD: Minimize closure scope
function createHandler() {
    const largeData = new Array(1000000).fill('data');
    const info = { info: 'small data' }.info; // Extract only needed data

    return function handler(event) {
        console.log(info, event.type);
        // largeData can be garbage collected
    };
}
```

```javascript
// BAD: DOM element retention
function attachListeners() {
    const elements = document.querySelectorAll('.item');
    const data = fetchLargeDataset(); // Large object

    elements.forEach(element => {
        element.addEventListener('click', function() {
            // Closure retains references to 'elements' and 'data'
            processClick(element, data);
        });
    });
}

// GOOD: Minimize retained references
function attachListeners() {
    const elements = document.querySelectorAll('.item');
    const data = fetchLargeDataset();

    elements.forEach(element => {
        const elementData = extractNeededData(data, element);
        element.addEventListener('click', function() {
            // Only retains small elementData, not full data
            processClick(element, elementData);
        });
    });
}
```

### Python Example

```python
# BAD: Closure retains large object
def create_processor():
    large_data = list(range(1000000))
    config = {'mode': 'fast'}

    def process(item):
        # Function retains reference to large_data even though unused
        return item * 2 if config['mode'] == 'fast' else item

    return process

# GOOD: Extract only needed values
def create_processor():
    large_data = list(range(1000000))
    mode = {'mode': 'fast'}['mode']  # Extract only needed value

    def process(item):
        return item * 2 if mode == 'fast' else item

    return process
```

### Java Example

```java
// BAD: Lambda captures large object
public class DataProcessor {
    public Function<String, String> createProcessor() {
        List<String> largeDataset = generateLargeDataset();
        String config = "fast";

        return item -> {
            // Lambda retains reference to largeDataset
            return config.equals("fast") ? item.toUpperCase() : item;
        };
    }
}

// GOOD: Extract needed values
public class DataProcessor {
    public Function<String, String> createProcessor() {
        List<String> largeDataset = generateLargeDataset();
        final String config = "fast"; // Only capture what's needed

        return item -> config.equals("fast") ? item.toUpperCase() : item;
    }
}
```

### Go Example

```go
// BAD: Closure captures large slice
func createHandler() func(string) string {
    largeData := make([]string, 1000000)
    config := "fast"

    return func(input string) string {
        // Function retains reference to largeData
        if config == "fast" {
            return strings.ToUpper(input)
        }
        return input
    }
}

// GOOD: Minimize captured variables
func createHandler() func(string) string {
    largeData := make([]string, 1000000)
    isFast := "fast" == "fast" // Extract boolean instead of string

    return func(input string) string {
        // largeData can be garbage collected
        if isFast {
            return strings.ToUpper(input)
        }
        return input
    }
}
```

### C#/.NET Example

```csharp
// BAD: Anonymous function captures large object
public Func<string, string> CreateProcessor()
{
    var largeData = new List<string>(1000000);
    var config = new { Mode = "fast", Debug = false };

    return item =>
    {
        // Captures entire config object and largeData
        return config.Mode == "fast" ? item.ToUpper() : item;
    };
}

// GOOD: Extract only needed values
public Func<string, string> CreateProcessor()
{
    var largeData = new List<string>(1000000);
    var isFastMode = new { Mode = "fast" }.Mode == "fast";

    return item =>
    {
        // Only captures boolean, largeData can be collected
        return isFastMode ? item.ToUpper() : item;
    };
}
```

## Impact of Closure Memory Leaks

Closure memory leaks are particularly dangerous because:

- **Hidden References**: Closures invisibly retain references to their entire lexical scope
- **Cascading Retention**: One small closure can prevent garbage collection of large objects
- **Event Handler Accumulation**: DOM event handlers with closures prevent element cleanup
- **Performance Degradation**: Excessive closures slow down JavaScript execution and garbage collection
- **Memory Pressure**: Can lead to browser tab crashes or Node.js process termination

## Common Closure Leak Patterns

### 1. Event Handler Closures

```javascript
// BAD: Event handlers retain DOM references
class ComponentManager {
    constructor() {
        this.components = [];
        this.data = new Array(100000).fill('large data');
    }

    attachHandlers() {
        this.components.forEach(component => {
            component.addEventListener('click', (event) => {
                // Closure retains 'this' and all its properties
                this.handleClick(event, component);
            });
        });
    }

    handleClick(event, component) {
        // Process click
    }
}

// GOOD: Minimize closure scope
class ComponentManager {
    constructor() {
        this.components = [];
        this.data = new Array(100000).fill('large data');
    }

    attachHandlers() {
        const handleClick = this.handleClick.bind(this);

        this.components.forEach(component => {
            const componentId = component.id; // Extract only needed data

            component.addEventListener('click', (event) => {
                handleClick(event, componentId);
            });
        });
    }

    handleClick(event, componentId) {
        const component = document.getElementById(componentId);
        // Process click
    }
}
```

### 2. Timer Closures

```javascript
// BAD: Timer retains large scope
function startProcessing() {
    const largeDataSet = loadLargeDataSet();
    const config = loadConfiguration();
    let counter = 0;

    const timer = setInterval(() => {
        // Closure retains largeDataSet even if not used
        counter++;
        if (counter > config.maxIterations) {
            clearInterval(timer);
        }
    }, 1000);

    return timer;
}

// GOOD: Extract only needed values
function startProcessing() {
    const largeDataSet = loadLargeDataSet();
    const maxIterations = loadConfiguration().maxIterations;
    let counter = 0;

    const timer = setInterval(() => {
        counter++;
        if (counter > maxIterations) {
            clearInterval(timer);
        }
        // largeDataSet can be garbage collected
    }, 1000);

    return timer;
}
```

### 3. Module Pattern Closures

```javascript
// BAD: Module retains unnecessary data
const UserModule = (function() {
    const allUsers = loadAllUsers(); // Large dataset
    const config = loadConfig();
    const cache = new Map();

    return {
        findUser(id) {
            // Module closure retains allUsers forever
            return allUsers.find(user => user.id === id);
        },

        clearCache() {
            cache.clear();
        }
    };
})();

// GOOD: Lazy loading and cleanup
const UserModule = (function() {
    let allUsers = null;
    const config = loadConfig();
    const cache = new Map();

    return {
        findUser(id) {
            if (!allUsers) {
                allUsers = loadAllUsers(); // Load only when needed
            }
            return allUsers.find(user => user.id === id);
        },

        clearCache() {
            cache.clear();
            allUsers = null; // Allow garbage collection
        }
    };
})();
```

### 4. Circular Reference Closures

```javascript
// BAD: Circular references prevent GC
function createCircularRef() {
    const parent = {
        name: 'parent',
        children: []
    };

    const child = {
        name: 'child',
        getParent() {
            return parent; // Closure captures parent
        }
    };

    parent.children.push(child);
    return { parent, child }; // Circular reference
}

// GOOD: Use WeakRef or break cycles
function createNonCircularRef() {
    const parent = {
        name: 'parent',
        children: []
    };

    const child = {
        name: 'child',
        parentRef: new WeakRef(parent), // Weak reference
        getParent() {
            return this.parentRef.deref();
        }
    };

    parent.children.push(child);
    return { parent, child };
}
```

## Detection Methods

### 1. Closure Scope Analysis

```javascript
// Development tool to analyze closure scope
function analyzeClosure(fn) {
    const fnString = fn.toString();
    const scopeVars = [];

    // Simple regex to find variable references
    const variablePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;

    while ((match = variablePattern.exec(fnString)) !== null) {
        const varName = match[1];
        if (!['function', 'return', 'if', 'else', 'for', 'while'].includes(varName)) {
            scopeVars.push(varName);
        }
    }

    console.log('Potential closure variables:', [...new Set(scopeVars)]);
}

// Usage
const handler = createHandler();
analyzeClosure(handler);
```

### 2. Memory Usage Tracking

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

### 3. Chrome DevTools Heap Analysis

```javascript
// Mark objects for heap analysis
function createMarkableClosures() {
    const largeData = new Array(100000).fill('data');
    largeData.__closureMarker = 'LargeDataInClosure';

    return function handler() {
        // Use largeData
        return largeData.length;
    };
}

// In DevTools Console:
// 1. Take heap snapshot
// 2. Search for "__closureMarker"
// 3. Analyze retaining paths
```

## Prevention Strategies

### 1. Minimize Closure Scope

```javascript
// Strategy: Extract only what you need
function createOptimizedHandler(largeDataset, config) {
    // Extract only needed values
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

### 2. Use WeakMap for Object Associations

```javascript
// Instead of closures, use WeakMap for object-data associations
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

### 3. Implement Closure Cleanup

```javascript
class CleanableClosures {
    constructor() {
        this.activeCLosures = new Set();
    }

    createClosure(factory, data) {
        const cleanup = new Set();

        const closure = factory(data, cleanup);
        this.activeCLosures.add({ closure, cleanup });

        return closure;
    }

    cleanup() {
        for (const { cleanup } of this.activeCLosures) {
            cleanup.forEach(cleanupFn => cleanupFn());
        }
        this.activeCLosures.clear();
    }
}

// Usage
const manager = new CleanableClosures();

const handler = manager.createClosure((data, cleanup) => {
    const timer = setInterval(() => {
        console.log(data.message);
    }, 1000);

    cleanup.add(() => clearInterval(timer));

    return function() {
        // Handler logic
    };
}, { message: 'Hello' });

// Later: cleanup all closures
manager.cleanup();
```

### 4. Use Factory Functions

```javascript
// Factory pattern to avoid closure retention
class HandlerFactory {
    static createClickHandler(config) {
        const { mode, enabled } = config; // Extract primitives

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

## Testing Closure Memory Leaks

### Manual Testing

Use our demo API to simulate closure leaks:

```bash
# Start closure leak
curl -X POST http://localhost:3000/memory-leak/closure/start

# Check status
curl http://localhost:3000/memory-leak/closure/status

# Stop leak
curl -X POST http://localhost:3000/memory-leak/closure/stop
```

### Automated Testing

```javascript
describe('Closure Memory Leak Tests', () => {
    test('should not retain large objects in closures', () => {
        const initialMemory = process.memoryUsage().heapUsed;
        const handlers = [];

        // Create closures that should not retain large objects
        for (let i = 0; i < 1000; i++) {
            const largeData = new Array(1000).fill(i);
            const small = largeData.length; // Extract only size

            handlers.push(() => small * 2); // Should not retain largeData
        }

        // Force garbage collection
        if (global.gc) {
            global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;

        // Memory increase should be minimal (less than 1MB)
        expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    test('closures should release references after cleanup', () => {
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

## Performance Monitoring

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

        console.log(`Closure created in ${(end - start).toFixed(2)}ms, memory delta: ${memoryAfter - memoryBefore} bytes`);

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

## Best Practices

### 1. Keep Closure Scope Minimal

```javascript
// GOOD: Only capture what you need
function createProcessor(largeConfig, largeDataset) {
    // Extract only needed values
    const timeout = largeConfig.timeout;
    const retries = largeConfig.retries;
    const summary = largeDataset.summary;

    return function process(item) {
        // Closure doesn't retain largeConfig or largeDataset
        return processWithTimeout(item, timeout, retries, summary);
    };
}
```

### 2. Use Arrow Functions Carefully

```javascript
// Arrow functions capture 'this' - be mindful of context
class DataProcessor {
    constructor() {
        this.largeData = new Array(1000000);
        this.config = { mode: 'fast' };
    }

    // BAD: Arrow function captures entire 'this'
    createBadHandler() {
        return (item) => {
            return this.config.mode === 'fast' ? item * 2 : item;
            // Retains reference to this.largeData unnecessarily
        };
    }

    // GOOD: Extract needed values
    createGoodHandler() {
        const isFast = this.config.mode === 'fast';
        return (item) => {
            return isFast ? item * 2 : item;
            // this.largeData can be garbage collected
        };
    }
}
```

### 3. Implement Closure Registries

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

    cleanup(olderThan = 5 * 60 * 1000) { // 5 minutes
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

## Related Topics

- [Global Variable Memory Leaks](./global-variables.md)
- [Event Listener Leaks](./event-listeners.md)
- [Timer Memory Leaks](./timers.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Try the interactive closure leak demo in our [NestJS Demo](../demos/nestjs.md) to see these concepts in action.
