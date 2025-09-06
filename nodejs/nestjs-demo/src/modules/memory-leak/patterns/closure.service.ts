import { Injectable } from '@nestjs/common';
import {
  startClosureLeak,
  stopClosureLeak,
  getClosureStats,
} from '../../../utils/leak-closure';
import { ClosureLeakResponse } from '../types';

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
