import { EventEmitter } from 'events';

// MEMORY LEAK SOURCE #1: Shared EventEmitter that accumulates listeners
// This emitter will hold references to all attached listeners indefinitely
const emitter = new EventEmitter();
let intervalId: NodeJS.Timeout | null = null;
let isLeaking = false;

function createListener(): () => void {
  // MEMORY LEAK SOURCE #2: Closure that captures large data in scope
  // Each listener function holds a reference to this 8MB array
  // When listeners accumulate, so does the memory usage
  const bigData = new Array(1e6).fill('event'); // ~8MB per listener

  // Return a closure that keeps bigData in memory
  // This closure will never be garbage collected while the listener exists
  return () => console.log('Big data length:', bigData.length);
}

export function startEventLeak(): void {
  if (isLeaking) {
    console.log('Event leak already running');
    return;
  }

  isLeaking = true;

  // MEMORY LEAK SOURCE #3: Interval that continuously adds event listeners
  // Each second, a new listener with 8MB closure is added to the emitter
  // These listeners accumulate without being removed, causing memory growth
  intervalId = setInterval(() => {
    const listener = createListener();

    // MEMORY LEAK SOURCE #4: Adding listeners without removing old ones
    // EventEmitter holds strong references to all listeners
    // Each listener closure contains 8MB of data that can't be garbage collected
    emitter.on('data', listener);
    console.log(
      `Event leak: added listener, total listeners: ${emitter.listenerCount('data')}`,
    );
  }, 1000);

  console.log('Event leak started');
}

export function stopEventLeak(): void {
  // Stop adding new listeners
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // CLEANUP: Remove all event listeners to free memory
  // This breaks the references and allows garbage collection of closures
  const removedCount = emitter.listenerCount('data');
  emitter.removeAllListeners('data');
  isLeaking = false;

  console.log(`Event leak stopped, removed ${removedCount} listeners`);
}

export function getEventListenerCount(): number {
  // Return count of accumulated listeners (memory leak indicator)
  return emitter.listenerCount('data');
}

export function isEventLeaking(): boolean {
  return isLeaking;
}

export function triggerEvent(): number {
  // Trigger all listeners - this will execute all closures with their captured data
  // The more listeners, the more memory is accessed during event emission
  const listenerCount = emitter.listenerCount('data');
  emitter.emit('data', 'test-data');
  return listenerCount;
}
