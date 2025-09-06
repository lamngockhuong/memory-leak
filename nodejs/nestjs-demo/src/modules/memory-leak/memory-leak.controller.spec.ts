/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryLeakController } from './memory-leak.controller';
import { TimerService } from './patterns/timer.service';
import { GlobalVariableService } from './patterns/global-variable.service';
import { CacheService } from './patterns/cache.service';
import { ClosureService } from './patterns/closure.service';
import { EventService } from './patterns/event.service';
import type {
  TimerLeakResponse,
  TimerStopResponse,
  GlobalVariableLeakResponse,
  CacheLeakResponse,
  ClosureLeakResponse,
  EventLeakResponse,
} from './types';

describe('MemoryLeakController', () => {
  let controller: MemoryLeakController;
  let timerService: jest.Mocked<TimerService>;
  let globalVariableService: jest.Mocked<GlobalVariableService>;
  let cacheService: jest.Mocked<CacheService>;
  let closureService: jest.Mocked<ClosureService>;
  let eventService: jest.Mocked<EventService>;

  const mockTimerResponse: TimerLeakResponse = {
    message: 'Timer leak started',
    activeTimers: 1,
  };

  const mockTimerStopResponse: TimerStopResponse = {
    message: 'All timer leaks stopped',
    stoppedTimers: 1,
    activeTimers: 0,
  };

  const mockGlobalVariableResponse: GlobalVariableLeakResponse = {
    message: 'Global variable leak started',
    stats: {
      leakedArrays: 1,
      estimatedMemoryMB: 8,
      isLeaking: true,
    },
  };

  const mockCacheResponse: CacheLeakResponse = {
    message: 'Cache leak started',
    stats: {
      size: 1,
      memoryUsage: '8MB',
      maxSize: 1000,
    },
  };

  const mockClosureResponse: ClosureLeakResponse = {
    message: 'Closure leak started',
    stats: {
      activeClosures: 1,
      totalMemoryAllocated: 10,
      isLeaking: true,
    },
  };

  const mockEventResponse: EventLeakResponse = {
    message: 'Event started',
    stats: {
      activeListeners: 1,
      totalMemoryAllocated: 5,
      isLeaking: true,
    },
  };

  beforeEach(async () => {
    const mockTimerService = {
      startTimerLeak: jest.fn(() => mockTimerResponse),
      stopAllTimers: jest.fn(() => mockTimerStopResponse),
      getActiveTimersCount: jest.fn(() => mockTimerResponse),
    };

    const mockGlobalVariableService = {
      startGlobalVariableLeak: jest.fn(() => mockGlobalVariableResponse),
      stopGlobalVariableLeak: jest.fn(() => mockGlobalVariableResponse),
      getStatus: jest.fn(() => mockGlobalVariableResponse),
    };

    const mockCacheService = {
      startCacheLeak: jest.fn(() => mockCacheResponse),
      stopCacheLeak: jest.fn(() => mockCacheResponse),
      getCacheStatus: jest.fn(() => ({
        isLeaking: true,
        stats: mockCacheResponse.stats,
        message: 'Cache is leaking',
      })),
      getCacheStats: jest.fn(() => mockCacheResponse.stats),
    };

    const mockClosureService = {
      startClosureLeak: jest.fn(() => mockClosureResponse),
      stopClosureLeak: jest.fn(() => mockClosureResponse),
      getStatus: jest.fn(() => mockClosureResponse),
    };

    const mockEventService = {
      startEventLeak: jest.fn(() => mockEventResponse),
      stopEventLeak: jest.fn(() => mockEventResponse),
      getStatus: jest.fn(() => mockEventResponse),
      triggerEvent: jest.fn(() => ({ message: 'Event triggered' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoryLeakController],
      providers: [
        { provide: TimerService, useValue: mockTimerService },
        { provide: GlobalVariableService, useValue: mockGlobalVariableService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ClosureService, useValue: mockClosureService },
        { provide: EventService, useValue: mockEventService },
      ],
    }).compile();

    controller = module.get<MemoryLeakController>(MemoryLeakController);
    timerService = module.get(TimerService);
    globalVariableService = module.get(GlobalVariableService);
    cacheService = module.get(CacheService);
    closureService = module.get(ClosureService);
    eventService = module.get(EventService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Timer endpoints', () => {
    it('should start timer leak', () => {
      const result = controller.startTimerLeak();
      expect(result).toEqual(mockTimerResponse);
      expect(timerService.startTimerLeak).toHaveBeenCalled();
    });

    it('should stop timer leaks', () => {
      const result = controller.stopTimerLeaks();
      expect(result).toEqual(mockTimerStopResponse);
      expect(timerService.stopAllTimers).toHaveBeenCalled();
    });

    it('should get timer status', () => {
      const result = controller.getTimerStatus();
      expect(result).toEqual(mockTimerResponse);
      expect(timerService.getActiveTimersCount).toHaveBeenCalled();
    });
  });

  describe('Global Variable endpoints', () => {
    it('should start global variable leak', () => {
      const result = controller.startGlobalVariableLeak();
      expect(result).toEqual(mockGlobalVariableResponse);
      expect(globalVariableService.startGlobalVariableLeak).toHaveBeenCalled();
    });

    it('should stop global variable leak', () => {
      const result = controller.stopGlobalVariableLeak();
      expect(result).toEqual(mockGlobalVariableResponse);
      expect(globalVariableService.stopGlobalVariableLeak).toHaveBeenCalled();
    });

    it('should get global variable status', () => {
      const result = controller.getGlobalVariableStatus();
      expect(result).toEqual(mockGlobalVariableResponse);
      expect(globalVariableService.getStatus).toHaveBeenCalled();
    });
  });

  describe('Cache endpoints', () => {
    it('should start cache leak', () => {
      const result = controller.startCacheLeak();
      expect(result).toEqual(mockCacheResponse);
      expect(cacheService.startCacheLeak).toHaveBeenCalled();
    });

    it('should stop cache leak', () => {
      const result = controller.stopCacheLeak();
      expect(result).toEqual(mockCacheResponse);
      expect(cacheService.stopCacheLeak).toHaveBeenCalled();
    });

    it('should get cache status', () => {
      const result = controller.getCacheStatus();
      expect(result).toMatchObject({
        isLeaking: true,
        stats: mockCacheResponse.stats,
        message: 'Cache is leaking',
      });
      expect(cacheService.getCacheStatus).toHaveBeenCalled();
    });

    it('should get cache stats', () => {
      const result = controller.getCacheStats();
      expect(result).toEqual(mockCacheResponse.stats);
      expect(cacheService.getCacheStats).toHaveBeenCalled();
    });
  });

  describe('Closure endpoints', () => {
    it('should start closure leak', () => {
      const result = controller.startClosureLeak();
      expect(result).toEqual(mockClosureResponse);
      expect(closureService.startClosureLeak).toHaveBeenCalled();
    });

    it('should stop closure leak', () => {
      const result = controller.stopClosureLeak();
      expect(result).toEqual(mockClosureResponse);
      expect(closureService.stopClosureLeak).toHaveBeenCalled();
    });

    it('should get closure status', () => {
      const result = controller.getClosureStatus();
      expect(result).toEqual(mockClosureResponse);
      expect(closureService.getStatus).toHaveBeenCalled();
    });
  });

  describe('Event endpoints', () => {
    it('should start event leak', () => {
      const result = controller.startEventLeak();
      expect(result).toEqual(mockEventResponse);
      expect(eventService.startEventLeak).toHaveBeenCalled();
    });

    it('should stop event leak', () => {
      const result = controller.stopEventLeak();
      expect(result).toEqual(mockEventResponse);
      expect(eventService.stopEventLeak).toHaveBeenCalled();
    });

    it('should get event status', () => {
      const result = controller.getEventStatus();
      expect(result).toEqual(mockEventResponse);
      expect(eventService.getStatus).toHaveBeenCalled();
    });

    it('should trigger event', () => {
      const result = controller.triggerEvent();
      expect(result).toEqual({ message: 'Event triggered' });
      expect(eventService.triggerEvent).toHaveBeenCalled();
    });
  });

  describe('Overall status', () => {
    it('should get overall status', () => {
      const result = controller.getOverallStatus();

      expect(result).toMatchObject({
        timestamp: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ),
        patterns: {
          timer: mockTimerResponse,
          cache: expect.objectContaining({}),
          closure: mockClosureResponse.stats,
          event: mockEventResponse.stats,
          globalVariable: mockGlobalVariableResponse.stats,
        },
        memory: expect.objectContaining({}),
      });

      expect(timerService.getActiveTimersCount).toHaveBeenCalled();
      expect(cacheService.getCacheStatus).toHaveBeenCalled();
      expect(closureService.getStatus).toHaveBeenCalled();
      expect(eventService.getStatus).toHaveBeenCalled();
      expect(globalVariableService.getStatus).toHaveBeenCalled();
    });

    it('should return timestamp in ISO format', () => {
      const result = controller.getOverallStatus();
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should return memory usage information', () => {
      const result = controller.getOverallStatus();
      expect(result.memory).toBeDefined();
      expect(typeof result.memory).toBe('object');
    });
  });
});
