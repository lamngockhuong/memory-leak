// MEMORY LEAK SOURCE #1: Global cache object that accumulates data without bounds
// This cache grows indefinitely as we keep adding entries without cleanup
const cache: Record<string, any> = {};
let isLeaking = false;
let leakInterval: NodeJS.Timeout | null = null;
let counter = 0;

export function startCacheLeak(options?: {
  entrySize?: number;
  interval?: number;
}): {
  message: string;
  stats: { size: number; estimatedMemoryMB: number };
} {
  if (isLeaking) {
    return {
      message: 'Cache leak already running',
      stats: getCacheStats(),
    };
  }

  isLeaking = true;
  const entrySize = options?.entrySize || 1000;
  const interval = options?.interval || 100;

  // MEMORY LEAK SOURCE #2: Interval that continuously adds cache entries
  // Each interval creates large objects that accumulate in memory
  leakInterval = setInterval(() => {
    const key = `leak_${counter++}`;

    // Create large data objects that will be stored permanently
    const largeData = {
      id: counter,
      data: new Array(entrySize).fill(`Large data chunk ${counter}`),
      timestamp: Date.now(),
      buffer: Buffer.alloc(1024 * 100), // 100KB per entry
    };

    // MEMORY LEAK SOURCE #3: Storing large objects without cleanup strategy
    cache[key] = largeData;
    console.log(
      `Cache leak: added entry ${counter}, cache size: ${Object.keys(cache).length}`,
    );
  }, interval);

  return {
    message: 'Cache leak started',
    stats: getCacheStats(),
  };
}

export function stopCacheLeak(): {
  message: string;
  clearedEntries: number;
  stats: { size: number; estimatedMemoryMB: number };
} {
  const prevSize = Object.keys(cache).length;

  // Stop adding new entries
  if (leakInterval) {
    clearInterval(leakInterval);
    leakInterval = null;
  }

  // CLEANUP: Clear all cache entries to free memory
  // This removes all references and allows garbage collection
  Object.keys(cache).forEach((key) => delete cache[key]);
  isLeaking = false;
  counter = 0;

  return {
    message: 'Cache leak stopped and cleared',
    clearedEntries: prevSize,
    stats: getCacheStats(),
  };
}

export function getCacheStats(): {
  size: number;
  estimatedMemoryMB: number;
  isLeaking: boolean;
} {
  const size = Object.keys(cache).length;
  // Estimate: ~8MB per array + ~100KB buffer per entry
  const estimatedMemoryMB = size * 8.1; // Approximate MB

  return {
    size,
    estimatedMemoryMB: Number(estimatedMemoryMB.toFixed(2)),
    isLeaking,
  };
}
