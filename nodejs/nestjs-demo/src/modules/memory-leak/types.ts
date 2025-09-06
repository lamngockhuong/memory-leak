export interface GlobalVariableLeakStats {
  leakedArrays: number;
  estimatedMemoryMB: number;
  isLeaking: boolean;
}

export interface GlobalVariableLeakResponse {
  message: string;
  stats: GlobalVariableLeakStats;
}

export interface CacheStats {
  size: number;
  memoryUsage: string;
  maxSize: number;
}

export interface ClosureLeakStats {
  activeClosures: number;
  totalMemoryAllocated: number; // in MB
  isLeaking: boolean;
}

export interface EventLeakStats {
  activeListeners: number;
  totalMemoryAllocated: number; // in MB (approximate)
  isLeaking: boolean;
}

export interface TimerLeakResponse {
  message: string;
  activeTimers: number;
}

export interface TimerStopResponse {
  message: string;
  stoppedTimers: number;
  activeTimers: number;
}

export interface CacheLeakResponse {
  message: string;
  stats: CacheStats;
  clearedEntries?: number;
}

export interface ClosureLeakResponse {
  message: string;
  stats: ClosureLeakStats;
}

export interface EventLeakResponse {
  message: string;
  stats: EventLeakStats;
}

export interface CacheStatusResponse {
  isLeaking: boolean;
  stats: CacheStats;
  message: string;
}

export interface OverallStatusResponse {
  timestamp: string;
  patterns: {
    timer: TimerLeakResponse;
    cache: CacheStatusResponse;
    closure?: ClosureLeakStats;
    event?: EventLeakStats;
    globalVariable?: GlobalVariableLeakStats;
  };
  memory: NodeJS.MemoryUsage;
}
