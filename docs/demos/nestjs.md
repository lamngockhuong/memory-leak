# NestJS Memory Leak Demo

Our NestJS demo application provides hands-on examples of common memory leak patterns in Node.js/TypeScript applications. It includes various types of intentional memory leaks and tools to analyze them.

## Overview

The demo is located in `/nodejs/nestjs-demo/` and includes:

- **Multiple leak patterns** (global variables, closures, events, timers, caching)
- **Heap dump utilities** for memory analysis
- **API endpoints** to trigger leaks manually
- **Production-ready monitoring** examples

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
cd nodejs/nestjs-demo
pnpm install
```

### Running the Demo

```bash
# Start the application
pnpm run start:dev

# Or start with heap dump monitoring enabled
HEAPDUMP_ENABLED=1 pnpm run start:dev
```

The application will start on `http://localhost:3000`

## Available Memory Leak Patterns

### 1. Global Variable Leak

**Endpoint**: `POST /global-variable-leak`

**What it does**: Continuously adds large arrays to a global variable

**Source**: [`src/utils/leak-global.ts`](https://github.com/lamngockhuong/memory-leak/blob/main/nodejs/nestjs-demo/src/utils/leak-global.ts)

```bash
# Trigger the leak
curl -X POST http://localhost:3000/global-variable-leak

# Watch memory grow in the console output
```

**Expected behavior**:
- Console shows "Leaked 1MB+" every second
- Memory usage steadily increases
- Application eventually crashes with OOM error

### 2. Closure Leak

**Source**: [`src/utils/leak-closure.ts`](https://github.com/lamngockhuong/memory-leak/blob/main/nodejs/nestjs-demo/src/utils/leak-closure.ts)

```typescript
function createLeaker(): Leaker {
  const hugeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
  return () => {
    console.log('Holding buffer of size:', hugeBuffer.length);
  };
}
```

### 3. Event Listener Leak

**Source**: [`src/utils/leak-event.ts`](https://github.com/lamngockhuong/memory-leak/blob/main/nodejs/nestjs-demo/src/utils/leak-event.ts)

```typescript
const emitter = new EventEmitter();

function createListener(): () => void {
  const bigData = new Array(1e6).fill('event');
  return () => console.log('Big data length:', bigData.length);
}

setInterval(() => {
  emitter.on('data', createListener());
}, 1000);
```

### 4. Timer Leak

**Source**: [`src/utils/leak-timer.ts`](https://github.com/lamngockhuong/memory-leak/blob/main/nodejs/nestjs-demo/src/utils/leak-timer.ts)

```typescript
export function setupTimer(): void {
  setInterval(() => {
    Buffer.alloc(5 * 1024 * 1024); // 5MB
    console.log('Interval with 5MB buffer running');
  }, 1000);
}
```

### 5. Cache Leak

**Source**: [`src/utils/leak-cache.ts`](https://github.com/lamngockhuong/memory-leak/blob/main/nodejs/nestjs-demo/src/utils/leak-cache.ts)

```typescript
const cache: Record<string, string[]> = {};

function getData(key: string): string[] {
  if (!cache[key]) {
    cache[key] = new Array(1e6).fill(key) as string[];
  }
  return cache[key];
}
```

## Heap Dump Analysis

### Manual Heap Dumps

The demo includes a powerful heap dump utility:

**Endpoint**: `POST /internal/debug/heapdump`

**Authentication**: Requires `ADMIN_TOKEN` header

```bash
# Take a manual heap dump
curl -X POST http://localhost:3000/internal/debug/heapdump \
  -H "ADMIN_TOKEN: your-secret-token"
```

### Automatic Heap Dumps

Enable automatic heap dumps with `HEAPDUMP_ENABLED=1`:

```bash
# Send SIGUSR2 signal to trigger heap dump
kill -USR2 <process_id>
```

### Heap Dump Utilities

The demo includes a comprehensive [`Heapdump` class](https://github.com/lamngockhuong/memory-leak/blob/main/nodejs/nestjs-demo/src/utils/heapdump.ts):

```typescript
import { Heapdump } from './utils/heapdump';

// Take a single snapshot
const file = await Heapdump.writeSnapshot('my-analysis');

// Take multiple snapshots for comparison
const files = await Heapdump.snapEvery(3, {
  label: 'leak-comparison',
  intervalMs: 5000,
  beforeGc: true
});

// Continuous monitoring
const controller = Heapdump.startAutoSnapshot({
  label: 'monitoring',
  intervalMs: 10000,
  beforeGc: true
});

// Stop monitoring after 60 seconds
setTimeout(async () => {
  const files = await controller.stop();
  console.log('Captured files:', files);
}, 60000);
```

### Analyzing Heap Dumps

Heap dumps are saved to `/heapdumps/` directory as `.heapsnapshot` files.

**Using Chrome DevTools**:
1. Open Chrome DevTools
2. Go to Memory tab
3. Click "Load" and select the `.heapsnapshot` file
4. Analyze object allocations and memory usage

**Using Node.js tools**:
```bash
# Install heap dump analysis tools
npm install -g @mapbox/node-pre-gyp
npm install heapdump

# Programmatic analysis
node -e "
const fs = require('fs');
const heap = JSON.parse(fs.readFileSync('dump.heapsnapshot'));
console.log('Nodes:', heap.nodes.length);
"
```

## API Documentation

### Health Endpoints

```bash
# Check application health
GET /health

# Check readiness (affected by heap dump operations)
GET /ready
```

### Debug Endpoints

```bash
# Take heap dump (requires ADMIN_TOKEN)
POST /internal/debug/heapdump

# Trigger global variable leak
POST /global-variable-leak
```

## Monitoring Integration

### Memory Usage Monitoring

```typescript
// Monitor memory usage
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log({
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  });
}

setInterval(logMemoryUsage, 5000);
```

### Production Readiness

The demo includes production-ready features:

- **Graceful heap dump handling** with temporary readiness drainage
- **Background processing** to avoid blocking requests during dumps
- **Error handling** and recovery
- **Configurable monitoring** via environment variables

## Testing Memory Leaks

### Running Tests

```bash
# Unit tests
pnpm run test

# E2E tests including memory leak scenarios
pnpm run test:e2e
```

### Bruno API Tests

The demo includes Bruno API test collections in `/test/bruno/`:

```bash
# Install Bruno CLI
npm install -g @usebruno/cli

# Run API tests
cd test/bruno
bru run --env local
```

**Available test suites**:
- `global-variable-leak.bru` - Test global variable leak endpoint
- `health ready.bru` - Test health and readiness endpoints
- `debug/heapdump.bru` - Test heap dump functionality

## Environment Configuration

### Environment Variables

```bash
# Enable heap dump monitoring
HEAPDUMP_ENABLED=1

# Set admin token for debug endpoints
ADMIN_TOKEN=your-secret-token

# Configure application port
PORT=3000

# Node.js memory options
NODE_OPTIONS="--max-old-space-size=4096 --expose-gc"
```

### Development vs Production

**Development**:
```bash
# Start with monitoring enabled
HEAPDUMP_ENABLED=1 NODE_OPTIONS="--expose-gc" pnpm run start:dev
```

**Production**:
```bash
# Start with production optimizations
NODE_ENV=production HEAPDUMP_ENABLED=1 pnpm run start:prod
```

## Common Scenarios to Test

### Scenario 1: Gradual Memory Growth

1. Start the application
2. Trigger global variable leak
3. Monitor memory growth over time
4. Take periodic heap dumps
5. Analyze memory allocation patterns

### Scenario 2: Sudden Memory Spike

1. Load multiple leak patterns simultaneously
2. Observe rapid memory growth
3. Test application recovery after stopping leaks

### Scenario 3: Production Simulation

1. Run with production settings
2. Simulate normal application load
3. Inject memory leaks gradually
4. Monitor and alert on memory thresholds

## Expected Results

### Global Variable Leak Test

**Timeline**:
- **0-30s**: Normal memory usage (~50MB)
- **30s-5min**: Steady growth (~1MB/second)
- **5-15min**: Accelerated growth and GC pressure
- **15+ min**: Application crash with OOM error

**Console Output**:
```
Leaked 1MB+
Leaked 1MB+
Memory: { rss: 150MB, heapTotal: 120MB, heapUsed: 95MB }
<--- Last few GCs --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

### Heap Dump Analysis Results

**Typical findings**:
- Large arrays in global scope
- Growing event listener collections
- Retained closures with large contexts
- Uncleaned timer references

## Best Practices Demonstrated

1. **Proper heap dump handling** - Non-blocking background processing
2. **Readiness checks** - Temporary drainage during analysis
3. **Structured logging** - Clear memory usage reporting
4. **Error recovery** - Graceful handling of dump failures
5. **Environment-based configuration** - Different settings for dev/prod

## Troubleshooting

### Common Issues

**"Cannot allocate memory"**:
- Increase Node.js heap size: `--max-old-space-size=8192`
- Enable garbage collection: `--expose-gc`

**"Heap dump failed"**:
- Check disk space in `/heapdumps/` directory
- Verify write permissions
- Monitor system memory availability

**"High CPU usage"**:
- Expected during heap dump generation
- Monitor GC pressure with `--trace-gc`

### Debug Commands

```bash
# Check process memory
ps aux | grep node

# Monitor heap size
node --trace-gc app.js

# Force garbage collection
kill -USR1 <process_id>  # Triggers debugger
kill -USR2 <process_id>  # Triggers heap dump
```

## Next Steps

After experimenting with this demo:

1. **Analyze your results** with [Heap Dump Analysis](/detection/heap-dump-analysis)
2. **Learn more patterns** in [Common Leak Patterns](/patterns/global-variables)
3. **Set up monitoring** with [Production Monitoring](/best-practices/monitoring)
4. **Explore other languages** with [Java Demo](/demos/java) or [Go Demo](/demos/go)

## Source Code

The complete source code is available in the repository:
- **Main application**: `/nodejs/nestjs-demo/src/`
- **Leak utilities**: `/nodejs/nestjs-demo/src/utils/`
- **Tests**: `/nodejs/nestjs-demo/test/`
- **API tests**: `/nodejs/nestjs-demo/test/bruno/`
