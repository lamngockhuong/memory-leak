import { Injectable } from '@nestjs/common';
import {
  startEventLeak as startLeak,
  stopEventLeak as stopLeak,
  getEventListenerCount,
  isEventLeaking,
  triggerEvent as triggerEventUtil,
} from '../../../utils/leak-event';

export interface EventLeakStats {
  activeListeners: number;
  totalMemoryAllocated: number; // in MB (approximate)
  isLeaking: boolean;
}

export interface EventLeakResponse {
  message: string;
  stats: EventLeakStats;
}

@Injectable()
export class EventService {
  startEventLeak(): EventLeakResponse {
    const wasLeaking = isEventLeaking();
    startLeak();

    return {
      message: wasLeaking
        ? 'Event leak was already running'
        : 'Event leak started - listeners will accumulate',
      stats: this.getStats(),
    };
  }

  stopEventLeak(): EventLeakResponse {
    const prevCount = getEventListenerCount();
    stopLeak();

    return {
      message: `Event leak stopped, removed ${prevCount} listeners`,
      stats: this.getStats(),
    };
  }

  getStatus(): EventLeakResponse {
    return {
      message: isEventLeaking()
        ? 'Event leak is running'
        : 'Event leak is not running',
      stats: this.getStats(),
    };
  }

  triggerEvent(): { message: string; listenersNotified: number } {
    const listenersNotified = triggerEventUtil();
    return {
      message: 'Event triggered',
      listenersNotified,
    };
  }

  private getStats(): EventLeakStats {
    const activeListeners = getEventListenerCount();
    return {
      activeListeners,
      totalMemoryAllocated: activeListeners * 8, // ~8MB per listener
      isLeaking: isEventLeaking(),
    };
  }
}
