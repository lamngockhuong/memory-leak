# NestJS Memory Leak Demo

This documentation describes the NestJS demo application for testing and demonstrating various types of memory leaks in Node.js/TypeScript environments.

## Overview

The NestJS demo provides interactive API endpoints to simulate different memory leak patterns commonly found in Node.js applications. This hands-on approach helps developers understand how memory leaks manifest and how to detect them.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Basic understanding of REST APIs

### Installation

```bash
cd nodejs/nestjs-demo
npm install
npm run start:dev
```

## Base URL

```text
http://localhost:3000
```

## Health Check

### GET `/health/ready`

Check if the application is ready to receive requests.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-09-02T09:30:00.000Z"
}
```

## Global Variable Memory Leaks

### GET `/global-variable-leak`

Triggers a global variable memory leak that runs for 10 seconds.

**Response:**

```json
"Global variable leak started"
```

**Behavior:**

- Starts a memory leak that allocates memory to global variables every second
- Automatically stops after 10 seconds
- Each iteration adds data to global arrays/objects

## Timer Memory Leaks

### GET `/timer-leak`

Starts a new timer-based memory leak.

**Response:**

```json
{
  "message": "Timer leak started",
  "activeTimers": 1
}
```

**Behavior:**

- Creates a new `setInterval` that allocates 5MB every second
- Timer continues until manually stopped
- Multiple calls create multiple concurrent timers

### GET `/timer-leak/status`

Check the current status of timer leaks.

**Response:**

```json
{
  "activeTimers": 2,
  "message": "Currently 2 timer leak(s) running"
}
```

### GET `/timer-leak/stop`

Stop all active timer leaks.

**Response:**

```json
{
  "message": "All timer leaks stopped",
  "stoppedTimers": 2,
  "activeTimers": 0
}
```

## Debug Endpoints

### POST `/internal/debug/heapdump`

Generate a heap dump for memory analysis.

**Headers:**

```text
x-admin-token: your-admin-token
```

**Response:**

```json
{
  "message": "Heap dump generated",
  "filename": "heapdump-1693641600000.heapsnapshot",
  "size": "125.4 MB"
}
```

**Notes:**

- Requires admin token for security
- Heap dumps are saved to `./heapdumps/` directory
- Use Chrome DevTools or other heap analysis tools to examine

## Usage Examples

### Testing Timer Leaks

```bash
# Start multiple timer leaks
curl http://localhost:3000/timer-leak
curl http://localhost:3000/timer-leak
curl http://localhost:3000/timer-leak

# Check status
curl http://localhost:3000/timer-leak/status

# Monitor memory growth (let it run for a few minutes)
# Expected: Memory usage increases by ~15MB per second (3 timers × 5MB)

# Stop all leaks
curl http://localhost:3000/timer-leak/stop
```

### Testing Global Variable Leaks

```bash
# Start global variable leak
curl http://localhost:3000/global-variable-leak

# Monitor memory for 10 seconds
# Expected: Memory usage increases temporarily, then stabilizes
```

### Generating Heap Dumps

```bash
# Start some leaks first
curl http://localhost:3000/timer-leak

# Generate heap dump
curl -X POST \
  -H "x-admin-token: your-secret-token" \
  http://localhost:3000/internal/debug/heapdump

# Stop leaks
curl http://localhost:3000/timer-leak/stop

# Generate another heap dump to compare
curl -X POST \
  -H "x-admin-token: your-secret-token" \
  http://localhost:3000/internal/debug/heapdump
```

## Memory Monitoring

### Command Line Monitoring

```bash
# Monitor Node.js process memory
watch -n 1 'ps aux | grep node | grep -v grep'

# Monitor system memory
watch -n 1 'free -h'

# Use htop for better visualization
htop -p $(pgrep node)
```

### Programmatic Monitoring

```javascript
// Monitor memory usage in your application
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`
  });
}, 5000);
```

## Expected Behaviors

### Timer Leaks

- **Memory Growth**: Linear increase of ~5MB per second per active timer
- **CPU Usage**: Minimal increase (just allocation overhead)
- **Process Stability**: Will eventually crash if left running long enough

### Global Variable Leaks

- **Memory Growth**: Temporary increase during 10-second window
- **Cleanup**: Should stabilize after automatic cleanup
- **Garbage Collection**: Memory may not be immediately released

## Security Notes

- Admin endpoints require authentication tokens
- This is a demonstration application - do not expose to production
- Some endpoints can cause significant memory usage
- Always stop leaks when testing is complete

## Troubleshooting

### Port Already in Use

```bash
# Kill existing processes on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run start:dev
```

### High Memory Usage

```bash
# Stop all timer leaks immediately
curl http://localhost:3000/timer-leak/stop

# Restart the application if needed
```

### Application Crashes

- Restart the Node.js process
- Check system memory availability
- Consider reducing leak intensity for testing
