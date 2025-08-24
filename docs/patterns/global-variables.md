# Global Variables Memory Leak Pattern

Global variables are one of the most common causes of memory leaks in JavaScript applications. They persist for the entire application lifetime and can accumulate data without bounds.

## Why Global Variables Cause Memory Leaks

Global variables in JavaScript:

- **Never go out of scope** during application execution
- **Prevent garbage collection** of referenced objects
- **Accumulate data** over time without automatic cleanup
- **Are easy to forget** about in large codebases

## Common Scenarios

### 1. Accumulating Arrays/Objects

```javascript
// BAD: Global array that keeps growing
window.userCache = [];

function cacheUser(user) {
    window.userCache.push(user);
    // Array never shrinks!
}
```

### 2. Forgotten Event Data

```javascript
// BAD: Global variable accumulating event data
window.analytics = [];

document.addEventListener('click', (e) => {
    window.analytics.push({
        target: e.target.outerHTML, // Potentially large DOM strings
        timestamp: Date.now(),
        userAgent: navigator.userAgent
    });
});
```

### 3. Timer References

```javascript
// BAD: Global timers and references
window.activeTimers = [];
window.tempData = {};

function startPeriodicTask(id) {
    const timer = setInterval(() => {
        window.tempData[id] = generateLargeData();
    }, 1000);

    window.activeTimers.push(timer);
    // Timers and data never cleaned up!
}
```

## Real-World Example: Our NestJS Demo

Our demo application includes this intentional memory leak:

```typescript
// From: nodejs/nestjs-demo/src/utils/leak-global.ts
export {};

declare global {
  interface Global {
    leakedArray: Array<string[]>;
  }
}

global.leakedArray = [];

export function leakMemory(): void {
  const largeArray = new Array(1e6).fill('leak') as string[];
  (global.leakedArray as Array<string[]>).push(largeArray);
  console.log('Leaked 1MB+');
}
```

### What Happens

1. **Initial State**: Empty global array
2. **Every Second**: A new 1MB array is added
3. **Accumulation**: Arrays pile up in memory
4. **Result**: Application eventually crashes with OOM

This pattern crashed our demo application after consuming over 4GB of memory!

## Detection Strategies

### 1. Monitor Global Object Size

```javascript
// Monitor global variables periodically
function checkGlobalMemory() {
    const globals = Object.keys(window || global);
    console.log('Global variables count:', globals.length);

    // Check specific problematic globals
    if (window.userCache) {
        console.log('User cache size:', window.userCache.length);
    }
}

setInterval(checkGlobalMemory, 10000);
```

### 2. Use Memory Profiling

```javascript
// Node.js memory usage monitoring
function logMemoryUsage() {
    const used = process.memoryUsage();
    console.log('Memory usage:');
    for (let key in used) {
        console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
}

setInterval(logMemoryUsage, 5000);
```

### 3. Heap Snapshots

Use our utility class to take heap snapshots:

```typescript
import { Heapdump } from './utils/heapdump';

// Take periodic snapshots to analyze growth
const controller = Heapdump.startAutoSnapshot({
    label: 'global-leak-check',
    intervalMs: 30000, // Every 30 seconds
    beforeGc: true
});

// Stop after analysis
setTimeout(() => {
    controller.stop().then(files => {
        console.log('Snapshots taken:', files);
    });
}, 300000); // Stop after 5 minutes
```

## Prevention Strategies

### 1. Implement Size Limits

```javascript
// GOOD: Bounded global cache
const userCache = {
    data: [],
    maxSize: 1000,

    add(user) {
        this.data.push(user);

        // Implement LRU or size-based cleanup
        if (this.data.length > this.maxSize) {
            this.data.splice(0, this.data.length - this.maxSize);
        }
    }
};
```

### 2. Use WeakMap/WeakSet

```javascript
// GOOD: WeakMap automatically cleans up
const userMetadata = new WeakMap();

function attachMetadata(user, metadata) {
    userMetadata.set(user, metadata);
    // When user object is garbage collected,
    // metadata is automatically removed
}
```

### 3. Implement Cleanup Routines

```javascript
// GOOD: Regular cleanup of global data
const globalState = {
    events: [],
    lastCleanup: Date.now(),

    addEvent(event) {
        this.events.push({
            ...event,
            timestamp: Date.now()
        });

        this.cleanup();
    },

    cleanup() {
        const now = Date.now();

        // Clean up every 5 minutes
        if (now - this.lastCleanup > 5 * 60 * 1000) {
            // Remove events older than 1 hour
            const oneHourAgo = now - 60 * 60 * 1000;
            this.events = this.events.filter(e => e.timestamp > oneHourAgo);
            this.lastCleanup = now;
        }
    }
};
```

### 4. Use Local Scope When Possible

```javascript
// GOOD: Avoid globals entirely
function createUserManager() {
    const users = new Map(); // Local to function scope

    return {
        addUser(id, data) {
            users.set(id, data);
        },

        removeUser(id) {
            users.delete(id);
        },

        cleanup() {
            users.clear();
        }
    };
}

const userManager = createUserManager();
```

## Framework-Specific Considerations

### React Applications

```javascript
// BAD: Global state in React
window.appState = {};

// GOOD: Use proper state management
import { createContext, useContext } from 'react';

const AppStateContext = createContext();

// Use context or state management libraries like Redux, Zustand
```

### Vue.js Applications

```javascript
// BAD: Global reactive data
Vue.prototype.$globalData = Vue.observable({});

// GOOD: Use Vuex or Pinia for state management
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
    state: () => ({
        // Managed state with proper lifecycle
    })
});
```

### Node.js Applications

```javascript
// BAD: Growing global cache
global.requestCache = {};

// GOOD: Use proper caching libraries
const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: 600,  // 10 minutes
    checkperiod: 120  // Cleanup every 2 minutes
});
```

## Testing for Global Variable Leaks

### 1. Automated Testing

```javascript
describe('Global Variable Leaks', () => {
    let initialGlobals;

    beforeEach(() => {
        initialGlobals = Object.keys(global);
    });

    afterEach(() => {
        const currentGlobals = Object.keys(global);
        const newGlobals = currentGlobals.filter(g => !initialGlobals.includes(g));

        if (newGlobals.length > 0) {
            console.warn('New globals detected:', newGlobals);
        }
    });

    it('should not leak global variables', () => {
        // Your test code here
        // Check that no new globals are created
    });
});
```

### 2. ESLint Rules

```json
{
    "rules": {
        "no-implicit-globals": "error",
        "no-global-assign": "error",
        "no-undef": "error"
    }
}
```

## Monitoring in Production

### 1. Regular Health Checks

```javascript
// Production monitoring for global leaks
function globalHealthCheck() {
    const stats = {
        globalCount: Object.keys(global).length,
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };

    // Send to monitoring service
    console.log('Global health:', stats);

    // Alert if memory usage is growing
    if (stats.memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        console.warn('High memory usage detected');
    }
}

setInterval(globalHealthCheck, 60000); // Every minute
```

### 2. Heap Dump on SIGUSR2

Our demo includes automatic heap dump generation:

```typescript
// From: nodejs/nestjs-demo/src/main.ts
if (process.env.HEAPDUMP_ENABLED === '1') {
    process.on('SIGUSR2', async () => {
        console.log('[heapdump] SIGUSR2 received');
        await Heapdump.writeSnapshot('on-sigusr2');
    });
}
```

Usage in production:

```bash
# Send signal to running process
kill -USR2 <process_id>

# Analyze the generated heap dump
```

## Key Takeaways

1. **Global variables persist forever** - They prevent garbage collection
2. **Implement bounds checking** - Always limit the size of global collections
3. **Use proper state management** - Framework-specific solutions are usually better
4. **Monitor in production** - Set up alerts for growing memory usage
5. **Test for leaks** - Automated tests can catch global variable leaks early

## Related Patterns

- [Event Listeners](/patterns/event-listeners) - Often store references in global scope
- [Caching](/patterns/caching) - Global caches are common leak sources
- [Timers & Intervals](/patterns/timers) - Global timer management

## Demo

Try our [NestJS Demo](/demos/nestjs) to see global variable leaks in action and practice with heap dump analysis tools.
