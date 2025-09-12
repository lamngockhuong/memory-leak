# Node.js Memory Profiling Tools

::: info Coming Soon
This comprehensive guide for Node.js memory profiling and leak detection is currently being developed.

We welcome contributions from the community! If you'd like to help write this guide, please:

- Fork the repository
- Create your content following our documentation standards
- Submit a pull request

This guide will cover:

- Built-in Node.js profiling capabilities
- Third-party profiling tools and libraries
- Production memory monitoring strategies
- V8 heap analysis techniques
- Automated memory leak detection

:::

## What Will Be Covered

### Built-in Node.js Profiling

#### Node.js Inspector

- **--inspect Flag**: Enable debugging and profiling
- **Chrome DevTools Integration**: Visual profiling interface
- **Heap Snapshots**: Memory state capture and analysis
- **CPU Profiling**: Performance bottleneck identification
- **Live Debugging**: Real-time application debugging

#### V8 Profiling Options

```bash
# Enable inspector
node --inspect app.js
node --inspect-brk app.js  # Break on start

# Memory profiling flags
node --max-old-space-size=4096 app.js
node --expose-gc app.js
node --trace-gc app.js
```

#### Process Memory Information

```javascript
// Memory usage monitoring
const memUsage = process.memoryUsage()
console.log({
  rss: memUsage.rss,           // Resident Set Size
  heapTotal: memUsage.heapTotal,   // Total heap size
  heapUsed: memUsage.heapUsed,     // Used heap size
  external: memUsage.external      // External memory usage
})
```

### Third-Party Profiling Tools

#### Clinic.js

- **clinic doctor**: Performance diagnosis
- **clinic bubbleprof**: Asynchronous operations analysis
- **clinic flame**: CPU profiling with flame graphs
- **clinic heapprofiler**: Memory usage analysis

```bash
# Install Clinic.js
npm install -g clinic

# Memory profiling
clinic doctor -- node app.js
clinic heapprofiler -- node app.js

# Generate reports
clinic doctor --collect-only -- node app.js
clinic doctor --visualize-only PID.clinic-doctor
```

#### 0x Profiling

- **Flame Graph Generation**: Visual performance analysis
- **CPU Profiling**: Performance bottleneck identification
- **Memory Analysis**: Heap usage visualization
- **Production Ready**: Low-overhead profiling

```bash
# Install 0x
npm install -g 0x

# Profile application
0x app.js
0x -- node app.js --some-flag

# Advanced options
0x --output-dir ./profiles app.js
```

#### heapdump Module

- **Programmatic Heap Dumps**: Generate heap snapshots from code
- **On-Demand Analysis**: Trigger heap dumps when needed
- **Integration**: Easy integration with existing applications
- **Chrome DevTools Compatible**: Analyze dumps in DevTools

```javascript
const heapdump = require('heapdump')

// Generate heap dump
heapdump.writeSnapshot((err, filename) => {
  if (err) console.error(err)
  else console.log('Heap dump written to', filename)
})

// Automatic heap dump on SIGUSR2
process.on('SIGUSR2', () => {
  heapdump.writeSnapshot()
})
```

#### memwatch-next

- **Memory Leak Detection**: Automatic leak detection
- **Heap Diff**: Compare memory states
- **Event-Based Monitoring**: Memory event notifications
- **Statistics**: Memory usage statistics

```javascript
const memwatch = require('memwatch-next')

// Memory leak detection
memwatch.on('leak', (info) => {
  console.log('Memory leak detected:', info)
})

// Garbage collection stats
memwatch.on('stats', (stats) => {
  console.log('GC stats:', stats)
})

// Heap difference analysis
const hd = new memwatch.HeapDiff()
// ... perform operations
const diff = hd.end()
console.log('Heap diff:', diff)
```

### Production Monitoring

#### Application Performance Monitoring (APM)

#### New Relic

- **Real-time Monitoring**: Live memory tracking
- **Alert Configuration**: Memory threshold alerts
- **Historical Analysis**: Long-term memory trends
- **Integration**: Easy Node.js integration

```javascript
// New Relic integration
require('newrelic')
const app = require('./app')

// Custom memory metrics
const newrelic = require('newrelic')
setInterval(() => {
  const memUsage = process.memoryUsage()
  newrelic.recordMetric('Custom/Memory/HeapUsed', memUsage.heapUsed)
}, 30000)
```

#### DataDog APM

- **Comprehensive Monitoring**: Full-stack monitoring
- **Custom Metrics**: Application-specific metrics
- **Dashboard Integration**: Visual memory dashboards
- **Alert Management**: Automated alerting

```javascript
// DataDog integration
const tracer = require('dd-trace').init()
const StatsD = require('hot-shots')
const dogstatsd = new StatsD()

// Memory metrics
setInterval(() => {
  const memUsage = process.memoryUsage()
  dogstatsd.gauge('nodejs.memory.heap_used', memUsage.heapUsed)
  dogstatsd.gauge('nodejs.memory.heap_total', memUsage.heapTotal)
}, 10000)
```

#### AppDynamics

- **Business Transaction Monitoring**: Memory in context
- **Automatic Baseline**: Memory usage baselines
- **Root Cause Analysis**: Memory issue diagnosis
- **Scalability Analysis**: Memory under load

### Custom Monitoring Solutions

#### Prometheus Integration

```javascript
const promClient = require('prom-client')

// Create memory usage metrics
const memoryUsageGauge = new promClient.Gauge({
  name: 'nodejs_memory_usage_bytes',
  help: 'Node.js memory usage',
  labelNames: ['type']
})

// Update metrics
function updateMemoryMetrics() {
  const memUsage = process.memoryUsage()
  memoryUsageGauge.set({ type: 'rss' }, memUsage.rss)
  memoryUsageGauge.set({ type: 'heap_total' }, memUsage.heapTotal)
  memoryUsageGauge.set({ type: 'heap_used' }, memUsage.heapUsed)
  memoryUsageGauge.set({ type: 'external' }, memUsage.external)
}

setInterval(updateMemoryMetrics, 5000)
```

#### Health Check Endpoints

```javascript
const express = require('express')
const app = express()

// Memory health endpoint
app.get('/health/memory', (req, res) => {
  const memUsage = process.memoryUsage()
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024

  res.json({
    status: heapUsedMB < 500 ? 'healthy' : 'warning',
    memory: {
      heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      heapTotal: `${heapTotalMB.toFixed(2)} MB`,
      heapUtilization: `${(heapUsedMB / heapTotalMB * 100).toFixed(2)}%`
    }
  })
})
```

### Memory Analysis Techniques

#### Heap Snapshot Analysis

```javascript
const v8 = require('v8')
const fs = require('fs')

// Generate heap snapshot
function captureHeapSnapshot() {
  const heapSnapshot = v8.getHeapSnapshot()
  const fileName = `heap-${Date.now()}.heapsnapshot`

  const fileStream = fs.createWriteStream(fileName)
  heapSnapshot.pipe(fileStream)

  return fileName
}

// Automated snapshot on memory threshold
function monitorMemoryThreshold() {
  const threshold = 500 * 1024 * 1024 // 500MB

  setInterval(() => {
    const memUsage = process.memoryUsage()
    if (memUsage.heapUsed > threshold) {
      console.log('Memory threshold exceeded, capturing snapshot')
      captureHeapSnapshot()
    }
  }, 30000)
}
```

#### Garbage Collection Monitoring

```javascript
const v8 = require('v8')

// GC performance monitoring
function monitorGC() {
  const gcStats = {
    majorGC: 0,
    minorGC: 0,
    totalGCTime: 0
  }

  // Hook into GC events (requires --expose-gc)
  if (global.gc) {
    const originalGC = global.gc
    global.gc = function() {
      const start = process.hrtime()
      const result = originalGC()
      const [seconds, nanoseconds] = process.hrtime(start)
      const duration = seconds * 1000 + nanoseconds / 1000000

      gcStats.totalGCTime += duration
      console.log(`GC completed in ${duration.toFixed(2)}ms`)

      return result
    }
  }

  return gcStats
}
```

### Container and Orchestration

#### Docker Memory Monitoring

```dockerfile
# Dockerfile with memory monitoring
FROM node:18-alpine

# Set memory limits
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

```javascript
// healthcheck.js
const memUsage = process.memoryUsage()
const heapUsedMB = memUsage.heapUsed / 1024 / 1024

if (heapUsedMB > 1500) { // 1.5GB threshold
  process.exit(1) // Unhealthy
}
process.exit(0) // Healthy
```

#### Kubernetes Memory Management

```yaml
# kubernetes deployment with memory limits
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: nodejs-app
        resources:
          requests:
            memory: "512Mi"
          limits:
            memory: "2Gi"
        env:
        - name: NODE_OPTIONS
          value: "--max-old-space-size=1536"
```

### Performance Testing

#### Load Testing with Memory Monitoring

```javascript
// Artillery.js with memory monitoring
const artillery = require('artillery')

function memoryAwareLoadTest() {
  const config = {
    target: 'http://localhost:3000',
    phases: [
      { duration: 60, arrivalRate: 10 }
    ],
    scenarios: [
      {
        name: 'Memory stress test',
        requests: [
          { get: { url: '/memory-intensive-endpoint' } }
        ]
      }
    ]
  }

  // Monitor memory during load test
  const memoryInterval = setInterval(() => {
    const memUsage = process.memoryUsage()
    console.log(`Memory during load test: ${memUsage.heapUsed / 1024 / 1024} MB`)
  }, 1000)

  artillery.runner(config).then(() => {
    clearInterval(memoryInterval)
  })
}
```

### Best Practices

#### Development Workflow

1. **Regular Profiling**: Profile during development cycles
2. **Baseline Establishment**: Create memory usage baselines
3. **Automated Testing**: Include memory tests in CI/CD
4. **Production Monitoring**: Continuous production monitoring
5. **Alert Configuration**: Set up memory threshold alerts

#### Memory Optimization Strategies

- **Stream Processing**: Use streams for large data processing
- **Connection Pooling**: Reuse database connections
- **Cache Management**: Implement proper cache eviction
- **Object Pooling**: Reuse expensive objects
- **Weak References**: Use WeakMap and WeakSet appropriately

## Contributing

This documentation is open for contributions. Please see our [Contributing Guidelines](https://github.com/lamngockhuong/memory-leak/blob/main/CONTRIBUTING.md) for more information.

---

*Want to help write this guide? Check out our [GitHub repository](https://github.com/lamngockhuong/memory-leak) and contribute!*
