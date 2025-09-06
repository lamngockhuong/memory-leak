# Memory Leak Demo - NestJS

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A comprehensive memory leak demonstration and testing API built with <a href="http://nestjs.com/" target="_blank">NestJS</a> framework.</p>

## Description

This NestJS application demonstrates various types of memory leaks commonly found in Node.js applications. It provides REST APIs to start, stop, and monitor different memory leak patterns for educational and testing purposes.

## Memory Leak Patterns

This demo includes 5 common memory leak patterns:

### 1. 🔄 **Timer Leaks**

- **Cause**: Uncleaned setTimeout/setInterval objects
- **Demo**: Accumulates timer references without clearing them
- **Memory Impact**: Timer objects pile up in memory

### 2. 💾 **Cache Leaks**

- **Cause**: Unlimited cache growth without eviction policy
- **Demo**: Continuously adds large objects to cache
- **Memory Impact**: ~8MB per cache entry

### 3. 🔒 **Closure Leaks**

- **Cause**: Closures holding large data in scope
- **Demo**: Functions that capture 10MB buffers
- **Memory Impact**: 10MB per closure function

### 4. 📡 **Event Listener Leaks**

- **Cause**: EventEmitter listeners never removed
- **Demo**: Accumulating listeners with large closure data
- **Memory Impact**: 8MB per listener

### 5. 🌍 **Global Variable Leaks**

- **Cause**: Global objects that grow indefinitely
- **Demo**: Arrays attached to global scope
- **Memory Impact**: ~8MB per global array

## API Endpoints

### Overall Status

```
GET /memory-leak/status - Get overview of all patterns
```

### Pattern-Specific Endpoints

Each pattern has consistent endpoints:

```
POST /memory-leak/{pattern}/start  - Start the leak
POST /memory-leak/{pattern}/stop   - Stop and cleanup
GET  /memory-leak/{pattern}/status - Get current stats
```

Where `{pattern}` can be:

- `timer` - Timer leak pattern
- `cache` - Cache leak pattern
- `closure` - Closure leak pattern
- `event` - Event listener leak pattern
- `global-variable` - Global variable leak pattern

### Additional Endpoints

```
GET  /memory-leak/cache/stats     - Cache statistics
POST /memory-leak/event/trigger   - Trigger event listeners
POST /debug/heapdump              - Generate heap dump
GET  /health/ready                - Health check
```

## Project setup

```bash
pnpm install
```

## Development

```bash
# development mode
pnpm run start

# watch mode (recommended for testing)
pnpm run start:dev

# production mode
pnpm run start:prod
```

The application will start on `http://localhost:3000`

## Testing Memory Leaks

### Using Bruno API Client

This project includes comprehensive API tests using [Bruno](https://usebruno.com/):

```bash
# Install Bruno CLI
npm install -g @usebruno/cli

# Run all memory leak tests
cd test/bruno/
bru run memory-leak -r --env local
```

### Manual Testing

1. **Start the application**:

   ```bash
   pnpm run start:dev
   ```

2. **Test a memory leak pattern**:

   ```bash
   # Start timer leak
   curl -X POST http://localhost:3000/memory-leak/timer/start

   # Check status
   curl http://localhost:3000/memory-leak/timer/status

   # Stop leak
   curl -X POST http://localhost:3000/memory-leak/timer/stop
   ```

3. **Monitor overall status**:

   ```bash
   curl http://localhost:3000/memory-leak/status
   ```

### Memory Monitoring

#### Generate Heap Dumps

There are multiple ways to generate heap dumps for analysis:

**Method 1: REST API Endpoint**

```bash
# Create heap dump via API
curl -X POST http://localhost:3000/internal/debug/heapdump
```

**Method 2: USR2 Signal (macOS/Linux)**

```bash
# Find the Node.js process ID
ps aux | grep node

# Send USR2 signal to trigger heap dump
kill -USR2 <process_id>
```

**Method 3: Process Manager Integration**

```bash
# With PM2
pm2 trigger <app_name> heapdump

# With nodemon (if configured)
nodemon --signal SIGUSR2 src/main.ts
```

Heap dumps are saved to `heapdumps/` directory and can be analyzed with Chrome DevTools.

#### Watch Memory Usage

```bash
# Monitor Node.js memory usage
node -e "setInterval(() => console.log(process.memoryUsage()), 1000)"
```

## Project Structure

```
src/
├── modules/memory-leak/     # Memory leak demonstration module
│   ├── memory-leak.controller.ts    # REST API endpoints
│   ├── types.ts                     # TypeScript interfaces
│   └── patterns/                    # Individual pattern services
│       ├── timer.service.ts         # Timer leak service
│       ├── cache.service.ts         # Cache leak service
│       ├── closure.service.ts       # Closure leak service
│       ├── event.service.ts         # Event leak service
│       └── global-variable.service.ts
├── utils/                   # Core leak implementation logic
│   ├── leak-timer.ts        # Timer leak utilities
│   ├── leak-cache.ts        # Cache leak utilities
│   ├── leak-closure.ts      # Closure leak utilities
│   ├── leak-event.ts        # Event leak utilities
│   └── leak-global.ts       # Global variable leak utilities
└── modules/debug/           # Debugging and monitoring tools
    ├── debug.controller.ts  # Heap dump endpoints
    └── health.controller.ts # Health check endpoints

test/bruno/memory-leak/      # API test suite
├── cache/                   # Cache pattern tests
├── closure/                 # Closure pattern tests
├── event/                   # Event pattern tests
├── timer/                   # Timer pattern tests
└── global-variable/         # Global variable tests
```

## Educational Use

This project is designed for:

- **Learning**: Understanding different types of memory leaks
- **Training**: Hands-on experience with memory leak detection
- **Testing**: Validating memory monitoring tools
- **Debugging**: Practicing heap dump analysis

### Memory Leak Analysis Tools

1. **Chrome DevTools**: Analyze heap dumps
2. **Node.js Built-in**: `process.memoryUsage()`
3. **Clinic.js**: Performance profiling
4. **0x**: Flame graph generation

### USR2 Signal Configuration

The application is configured to generate heap dumps when receiving USR2 signal. This is implemented in the bootstrap process:

```typescript
// Signal handler for heap dump generation
process.on('SIGUSR2', async () => {
  console.log('Received SIGUSR2, generating heap dump...');
  await Heapdump.writeSnapshot('signal-triggered');
});
```

**Benefits of USR2 Method:**

- **No HTTP overhead**: Direct process signaling
- **Works in any environment**: Production, containers, PM2
- **Non-intrusive**: Doesn't require API endpoints
- **Standard practice**: Common Node.js debugging technique

## Run tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Deployment

This is a development and educational tool. For production deployment considerations:

### Environment Variables

```bash
# Set NODE_ENV for production
NODE_ENV=production

# Configure port (default: 3000)
PORT=3000

# Disable heap dumps in production
ENABLE_HEAPDUMP=false
HEAPDUMP_TOKEN=heapdump_demo
```

### Security Considerations

- **Remove debug endpoints** in production
- **Disable heap dump generation** (contains sensitive data)
- **Add authentication** for memory leak endpoints
- **Monitor resource usage** to prevent DoS attacks

### Docker Support

**Build and run with Docker:**

```bash
# Build the Docker image
docker build -t memory-leak-demo .

# Run the container
docker run -d --name memory-leak-app -p 3000:3000 -e HEAPDUMP_ENABLED=1 -e HEAPDUMP_TOKEN=heapdump_demo memory-leak-demo
```

**Docker Compose:**

The project includes a `docker-compose.yml` file for easy deployment:

```bash
# Run with Docker Compose
docker-compose up -d
```

**Managing Heap Dumps:**

Since heap dumps are generated inside the container, you can copy them to the host:

```bash
# Copy all heap dumps to host
docker cp memory-leak-app:/app/heapdumps ./local-heapdumps

# Copy specific heap dump
docker cp memory-leak-app:/app/heapdumps/heap-2024-01-01.heapsnapshot ./

# List heap dumps in container
docker exec memory-leak-app ls -la /app/heapdumps/
```

**Docker Commands for Debugging:**

```bash
# Access container shell
docker exec -it memory-leak-app sh

# View logs in real-time
docker logs -f memory-leak-app

# Generate heap dump via signal (inside container)
docker exec memory-leak-app kill -USR2 1

# View container resource usage
docker stats memory-leak-app
```

For the complete Dockerfile, see [`Dockerfile`](./Dockerfile) in the project root.

## Documentation

For detailed documentation about memory leak patterns and detection:

- **Project Docs**: `../../docs/` - Comprehensive memory leak guide
- **NestJS Docs**: [https://docs.nestjs.com](https://docs.nestjs.com)
- **Memory Management**: [Node.js Memory Best Practices](https://nodejs.org/en/docs/guides/debugging-getting-started)

## Resources

Memory leak detection and analysis resources:

- **Chrome DevTools**: [Memory tab documentation](https://developer.chrome.com/docs/devtools/memory/)
- **Node.js Debugging**: [Official debugging guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- **Clinic.js**: [Performance profiling tool](https://clinicjs.org/)
- **0x**: [Flame graph profiler](https://github.com/davidmarkclements/0x)

## Contributing

When contributing to this memory leak demo:

1. **Add new patterns** in `src/utils/leak-*.ts`
2. **Create corresponding services** in `src/modules/memory-leak/patterns/`
3. **Add Bruno tests** in `test/bruno/memory-leak/`
4. **Update documentation** with pattern explanations
5. **Include memory impact calculations** in comments

## License

This educational project is part of the larger memory-leak repository.
See the main project [LICENSE](../../LICENSE) for details.
