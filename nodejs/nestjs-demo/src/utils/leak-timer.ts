// MEMORY LEAK SOURCE #1: Array that accumulates timer objects without cleanup
// This array grows indefinitely as we keep adding timeout objects
const timers: NodeJS.Timeout[] = [];

export function startTimerLeak(): void {
  // MEMORY LEAK SOURCE #2: Creating interval timers that are never cleared
  // Each setTimeout/setInterval creates a timer object that persists in memory
  // The timer object itself will accumulate in memory
  const timer = setInterval(() => {
    // NOTE: This buffer allocation does NOT cause memory leak
    // Allocate buffer but don't keep reference - buffer will be GC'd
    // This shows the difference: timer objects leak, but buffers don't
    Buffer.alloc(5 * 1024 * 1024); // 5MB (will be garbage collected)
    console.log(
      `Timer leak: allocated 5MB buffer (will be GC'd), timer count: ${timers.length}`,
    );
  }, 1000);

  // MEMORY LEAK SOURCE #3: Storing timer references without ever clearing them
  // Store timer reference but never clear it - THIS IS THE LEAK!
  // Each timer object stays in memory because we hold a reference to it
  timers.push(timer);
  console.log(`Timer leak started. Active timers: ${timers.length}`);
}

export function stopAllTimers(): void {
  // CLEANUP: Properly clear all accumulated timer objects
  // This is the correct way to prevent timer memory leaks
  timers.forEach((timer) => clearInterval(timer));
  const clearedCount = timers.length;

  // Clear the array to remove all references
  timers.length = 0;
  console.log(
    `All timer leaks stopped, cleared ${clearedCount} timeout objects`,
  );
}

export function getActiveTimersCount(): number {
  // Return count of accumulated timer objects (memory leak indicator)
  return timers.length;
}
