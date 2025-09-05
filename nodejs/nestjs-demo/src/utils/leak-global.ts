export {};

// Global variable declaration - this creates a persistent reference that won't be garbage collected
declare global {
  interface Global {
    leakedArray: Array<string[]>;
  }
}

// MEMORY LEAK SOURCE #1: Global variable that persists throughout application lifecycle
// This array will never be garbage collected because it's attached to the global object
global.leakedArray = [];

let intervalId: NodeJS.Timeout | null = null;
let isLeaking = false;

export function leakMemory(): void {
  // MEMORY LEAK SOURCE #2: Creating large arrays (1 million elements = ~8MB each)
  // Each array contains 1 million string references, consuming significant memory
  const largeArray = new Array(1e6).fill('leak') as string[];

  // MEMORY LEAK SOURCE #3: Pushing large objects to global array without cleanup
  // These arrays accumulate in global scope and are never released
  (global.leakedArray as Array<string[]>).push(largeArray);

  const currentLength = (global.leakedArray as Array<string[]>).length;
  console.log(`Global variable leak: added array, total: ${currentLength}MB`);
}

export function startGlobalVariableLeak(): void {
  if (isLeaking) {
    console.log('Global variable leak already running');
    return;
  }

  isLeaking = true;

  // MEMORY LEAK SOURCE #4: Interval timer that continuously creates memory leaks
  // This timer runs every second, constantly adding large arrays to global memory
  // Without proper cleanup, this creates an ever-growing memory footprint
  intervalId = setInterval(leakMemory, 1000);
  console.log('Global variable leak started');
}

export function stopGlobalVariableLeak(): void {
  // Stop the interval timer to prevent new leaks
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // CLEANUP: Clear the global array to release memory references
  // This is the proper way to stop the memory leak by removing references
  const leakedArray = global.leakedArray as Array<string[]>;
  const clearedCount = leakedArray.length;
  leakedArray.length = 0; // Clear the array to free memory
  isLeaking = false;

  console.log(`Global variable leak stopped, cleared ${clearedCount} arrays`);
}

export function getGlobalVariableStats(): {
  leakedArrays: number;
  estimatedMemoryMB: number;
  isLeaking: boolean;
} {
  // Get current state of leaked memory in global scope
  const leakedArray = global.leakedArray as Array<string[]>;
  return {
    leakedArrays: leakedArray.length,
    estimatedMemoryMB: leakedArray.length * 8, // ~8MB per array (1M strings * 8 bytes each)
    isLeaking,
  };
}
