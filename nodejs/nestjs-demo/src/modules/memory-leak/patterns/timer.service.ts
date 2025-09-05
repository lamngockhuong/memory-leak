import { Injectable } from '@nestjs/common';
import {
  startTimerLeak as startLeak,
  stopAllTimers as stopLeaks,
  getActiveTimersCount as getCount,
} from '../../../utils/leak-timer';

@Injectable()
export class TimerService {
  startTimerLeak(): { message: string; activeTimers: number } {
    startLeak(); // Use the original leak-timer function
    const activeTimers = getCount();

    return {
      message: 'Timer leak started - timeout objects will accumulate in memory',
      activeTimers,
    };
  }

  stopAllTimers(): {
    message: string;
    stoppedTimers: number;
    activeTimers: number;
  } {
    const prevCount = getCount();
    stopLeaks(); // Use the original stop function
    const activeTimers = getCount();

    return {
      message: `All timer leaks stopped - cleared ${prevCount} timeout objects`,
      stoppedTimers: prevCount,
      activeTimers,
    };
  }

  getActiveTimersCount(): {
    activeTimers: number;
    message: string;
  } {
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
