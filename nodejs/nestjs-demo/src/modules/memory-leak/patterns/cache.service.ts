import { Injectable } from '@nestjs/common';
import { CacheStats, CacheLeakResponse } from '../types';
import {
  startCacheLeak,
  stopCacheLeak,
  getCacheStats,
} from '../../../utils/leak-cache';

@Injectable()
export class CacheService {
  startCacheLeak(): CacheLeakResponse {
    const result = startCacheLeak();
    return {
      message: result.message,
      stats: {
        size: result.stats.size,
        memoryUsage: `~${result.stats.estimatedMemoryMB.toFixed(2)} MB`,
        maxSize: 0, // No limit in utils implementation
      },
    };
  }

  stopCacheLeak(): CacheLeakResponse {
    const result = stopCacheLeak();
    return {
      message: result.message,
      clearedEntries: result.clearedEntries,
      stats: {
        size: result.stats.size,
        memoryUsage: `~${result.stats.estimatedMemoryMB.toFixed(2)} MB`,
        maxSize: 0,
      },
    };
  }

  getCacheStats(): CacheStats {
    const stats = getCacheStats();
    return {
      size: stats.size,
      memoryUsage: `~${stats.estimatedMemoryMB.toFixed(2)} MB`,
      maxSize: 0,
    };
  }

  getCacheStatus(): {
    isLeaking: boolean;
    stats: CacheStats;
    message: string;
  } {
    const stats = getCacheStats();
    return {
      isLeaking: stats.isLeaking,
      stats: {
        size: stats.size,
        memoryUsage: `~${stats.estimatedMemoryMB.toFixed(2)} MB`,
        maxSize: 0,
      },
      message: stats.isLeaking
        ? `Cache leak running, ${stats.size} entries`
        : `Cache leak stopped, ${stats.size} entries`,
    };
  }

  onModuleDestroy() {
    stopCacheLeak();
  }
}
