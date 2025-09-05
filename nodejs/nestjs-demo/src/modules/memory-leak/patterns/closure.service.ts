import { Injectable } from '@nestjs/common';
import {
  startClosureLeak,
  stopClosureLeak,
  getClosureStats,
} from '../../../utils/leak-closure';

export interface ClosureLeakStats {
  activeClosures: number;
  totalMemoryAllocated: number; // in MB
  isLeaking: boolean;
}

export interface ClosureLeakResponse {
  message: string;
  stats: ClosureLeakStats;
}

@Injectable()
export class ClosureService {
  startClosureLeak(): ClosureLeakResponse {
    return startClosureLeak();
  }

  stopClosureLeak(): ClosureLeakResponse {
    const result = stopClosureLeak();
    return {
      message: result.message,
      stats: result.stats,
    };
  }

  getStatus(): ClosureLeakResponse {
    const stats = getClosureStats();
    return {
      message: stats.isLeaking
        ? 'Closure leak is running'
        : 'Closure leak is not running',
      stats,
    };
  }
}
