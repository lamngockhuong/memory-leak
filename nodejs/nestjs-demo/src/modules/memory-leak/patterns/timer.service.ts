import { Injectable } from '@nestjs/common';
import {
  startTimerLeak as startLeak,
  stopAllTimers as stopLeaks,
  getActiveTimersCount as getCount,
} from '../../../utils/leak-timer';
import { TimerLeakResponse, TimerStopResponse } from '../types';

@Injectable()
export class TimerService {
  startTimerLeak(): TimerLeakResponse {
    startLeak(); // Use the original leak-timer function
    const activeTimers = getCount();

    return {
      message: 'Timer leak started - timeout objects will accumulate in memory',
      activeTimers,
    };
  }

  stopAllTimers(): TimerStopResponse {
    const prevCount = getCount();
    stopLeaks(); // Use the original stop function
    const activeTimers = getCount();

    return {
      message: `All timer leaks stopped - cleared ${prevCount} timeout objects`,
      stoppedTimers: prevCount,
      activeTimers,
    };
  }

  getActiveTimersCount(): TimerLeakResponse {
    const activeTimers = getCount();
    return {
      activeTimers,
      message: `Currently ${activeTimers} timeout object(s) leaked in memory`,
    };
  }

  // Cleanup method for graceful shutdown
  onModuleDestroy() {
    this.stopAllTimers();
  }
}
