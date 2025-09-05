// MEMORY LEAK SOURCE #1: Type definition for functions that hold memory references
type Leaker = () => void;

// MEMORY LEAK SOURCE #2: Function that creates closures with large memory allocations
// Each closure captures a 10MB buffer in its scope, preventing garbage collection
function createLeaker(): Leaker {
  // MEMORY LEAK SOURCE #3: Large buffer allocation that gets captured by closure
  // This 10MB buffer will be held in memory as long as the returned function exists
  const hugeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB per closure

  // MEMORY LEAK SOURCE #4: Returned closure that maintains reference to hugeBuffer
  // The closure keeps the buffer alive even when not actively used
  return () => {
    console.log('Holding buffer of size:', hugeBuffer.length);
  };
}

// MEMORY LEAK SOURCE #5: Array that accumulates closure functions indefinitely
// Each closure holds a 10MB buffer, so memory grows by 10MB per closure
const leakers: Leaker[] = [];
let intervalId: NodeJS.Timeout | null = null;
let isLeaking = false;

export function startClosureLeak(): {
  message: string;
  stats: {
    activeClosures: number;
    totalMemoryAllocated: number;
    isLeaking: boolean;
  };
} {
  if (isLeaking) {
    return {
      message: 'Closure leak already running',
      stats: getClosureStats(),
    };
  }

  isLeaking = true;

  // MEMORY LEAK SOURCE #6: Interval that continuously creates memory-holding closures
  // Each second, creates a new closure with 10MB buffer that never gets released
  intervalId = setInterval(() => {
    const leaker = createLeaker();

    // MEMORY LEAK SOURCE #7: Accumulating closures without cleanup
    // Each push adds 10MB to total memory footprint
    leakers.push(leaker);
    console.log(
      `Closure leak: created closure ${leakers.length}, holding ${leakers.length * 10}MB total`,
    );
  }, 1000);

  return {
    message: 'Closure leak started',
    stats: getClosureStats(),
  };
}

export function stopClosureLeak(): {
  message: string;
  clearedClosures: number;
  stats: {
    activeClosures: number;
    totalMemoryAllocated: number;
    isLeaking: boolean;
  };
} {
  const prevCount = leakers.length;

  // Stop creating new closures
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // CLEANUP: Clear all closure references to allow garbage collection
  // This removes references to closures and their captured buffers
  leakers.length = 0;
  isLeaking = false;

  return {
    message: `Closure leak stopped, cleared ${prevCount} closures`,
    clearedClosures: prevCount,
    stats: getClosureStats(),
  };
}

export function getClosureStats(): {
  activeClosures: number;
  totalMemoryAllocated: number;
  isLeaking: boolean;
} {
  return {
    activeClosures: leakers.length,
    totalMemoryAllocated: leakers.length * 10, // 10MB per closure
    isLeaking,
  };
}
