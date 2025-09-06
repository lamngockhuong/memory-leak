import { Controller, Get, Post } from '@nestjs/common';
import { TimerService } from './patterns/timer.service';
import { GlobalVariableService } from './patterns/global-variable.service';
import { CacheService } from './patterns/cache.service';
import { ClosureService } from './patterns/closure.service';
import { EventService } from './patterns/event.service';
import { OverallStatusResponse } from './types';

@Controller('memory-leak')
export class MemoryLeakController {
  constructor(
    private readonly timerService: TimerService,
    private readonly globalVariableService: GlobalVariableService,
    private readonly cacheService: CacheService,
    private readonly closureService: ClosureService,
    private readonly eventService: EventService,
  ) {}

  // Timer Leak Endpoints
  @Post('timer/start')
  startTimerLeak() {
    return this.timerService.startTimerLeak();
  }

  @Post('timer/stop')
  stopTimerLeaks() {
    return this.timerService.stopAllTimers();
  }

  @Get('timer/status')
  getTimerStatus() {
    return this.timerService.getActiveTimersCount();
  }

  // Global Variable Leak Endpoints
  @Post('global-variable/start')
  startGlobalVariableLeak() {
    return this.globalVariableService.startGlobalVariableLeak();
  }

  @Post('global-variable/stop')
  stopGlobalVariableLeak() {
    return this.globalVariableService.stopGlobalVariableLeak();
  }

  @Get('global-variable/status')
  getGlobalVariableStatus() {
    return this.globalVariableService.getStatus();
  }

  // Cache Leak Endpoints
  @Post('cache/start')
  startCacheLeak() {
    return this.cacheService.startCacheLeak();
  }

  @Post('cache/stop')
  stopCacheLeak() {
    return this.cacheService.stopCacheLeak();
  }

  @Get('cache/status')
  getCacheStatus() {
    return this.cacheService.getCacheStatus();
  }

  @Get('cache/stats')
  getCacheStats() {
    return this.cacheService.getCacheStats();
  }

  // Closure Leak Endpoints
  @Post('closure/start')
  startClosureLeak() {
    return this.closureService.startClosureLeak();
  }

  @Post('closure/stop')
  stopClosureLeak() {
    return this.closureService.stopClosureLeak();
  }

  @Get('closure/status')
  getClosureStatus() {
    return this.closureService.getStatus();
  }

  // Event Leak Endpoints
  @Post('event/start')
  startEventLeak() {
    return this.eventService.startEventLeak();
  }

  @Post('event/stop')
  stopEventLeak() {
    return this.eventService.stopEventLeak();
  }

  @Get('event/status')
  getEventStatus() {
    return this.eventService.getStatus();
  }

  @Post('event/trigger')
  triggerEvent() {
    return this.eventService.triggerEvent();
  }

  // Overview endpoint
  @Get('status')
  getOverallStatus(): OverallStatusResponse {
    return {
      timestamp: new Date().toISOString(),
      patterns: {
        timer: this.timerService.getActiveTimersCount(),
        cache: this.cacheService.getCacheStatus(),
        closure: this.closureService.getStatus().stats,
        event: this.eventService.getStatus().stats,
        globalVariable: this.globalVariableService.getStatus().stats,
      },
      memory: process.memoryUsage(),
    };
  }
}
