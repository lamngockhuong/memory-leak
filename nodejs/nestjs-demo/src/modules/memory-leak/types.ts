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

export interface CacheStopResponse {
  message: string;
  clearedEntries: number;
  stats: CacheStats;
}

export interface CacheStatusResponse {
  isLeaking: boolean;
  stats: CacheStats;
  message: string;
}

export interface OverallStatusResponse {
  timestamp: string;
  patterns: {
    timer: {
      activeTimers: number;
      message: string;
    };
    cache: CacheStatusResponse;
    closure?: {
      activeClosures: number;
      totalMemoryAllocated: number;
      isLeaking: boolean;
    };
    event?: {
      activeListeners: number;
      totalMemoryAllocated: number;
      isLeaking: boolean;
    };
  };
  memory: NodeJS.MemoryUsage;
}
