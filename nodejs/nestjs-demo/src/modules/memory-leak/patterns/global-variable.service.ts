import { Injectable } from '@nestjs/common';
import {
  startGlobalVariableLeak as startLeak,
  stopGlobalVariableLeak as stopLeak,
  getGlobalVariableStats,
} from '../../../utils/leak-global';

export interface GlobalVariableLeakStats {
  leakedArrays: number;
  estimatedMemoryMB: number;
  isLeaking: boolean;
}

export interface GlobalVariableLeakResponse {
  message: string;
  stats: GlobalVariableLeakStats;
}

@Injectable()
export class GlobalVariableService {
  startGlobalVariableLeak(): GlobalVariableLeakResponse {
    const wasLeaking = getGlobalVariableStats().isLeaking;
    startLeak();

    return {
      message: wasLeaking
        ? 'Global variable leak was already running'
        : 'Global variable leak started - arrays will accumulate in global scope',
      stats: getGlobalVariableStats(),
    };
  }

  stopGlobalVariableLeak(): GlobalVariableLeakResponse {
    const prevStats = getGlobalVariableStats();
    stopLeak();

    return {
      message: `Global variable leak stopped - cleared ${prevStats.leakedArrays} arrays`,
      stats: getGlobalVariableStats(),
    };
  }

  getStatus(): GlobalVariableLeakResponse {
    const stats = getGlobalVariableStats();
    return {
      message: stats.isLeaking
        ? 'Global variable leak is running'
        : 'Global variable leak is not running',
      stats,
    };
  }
}
