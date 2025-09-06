import { Test, TestingModule } from '@nestjs/testing';
import { MemoryLeakModule } from './memory-leak.module';
import { MemoryLeakController } from './memory-leak.controller';
import { TimerService } from './patterns/timer.service';
import { CacheService } from './patterns/cache.service';
import { GlobalVariableService } from './patterns/global-variable.service';
import { ClosureService } from './patterns/closure.service';
import { EventService } from './patterns/event.service';

describe('MemoryLeakModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MemoryLeakModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide MemoryLeakController', () => {
    const controller = module.get<MemoryLeakController>(MemoryLeakController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(MemoryLeakController);
  });

  it('should provide TimerService', () => {
    const service = module.get<TimerService>(TimerService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TimerService);
  });

  it('should provide CacheService', () => {
    const service = module.get<CacheService>(CacheService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CacheService);
  });

  it('should provide GlobalVariableService', () => {
    const service = module.get<GlobalVariableService>(GlobalVariableService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(GlobalVariableService);
  });

  it('should provide ClosureService', () => {
    const service = module.get<ClosureService>(ClosureService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ClosureService);
  });

  it('should provide EventService', () => {
    const service = module.get<EventService>(EventService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(EventService);
  });

  it('should export all services', () => {
    const exportedTimerService = module.get<TimerService>(TimerService);
    const exportedCacheService = module.get<CacheService>(CacheService);
    const exportedGlobalVariableService = module.get<GlobalVariableService>(
      GlobalVariableService,
    );
    const exportedClosureService = module.get<ClosureService>(ClosureService);
    const exportedEventService = module.get<EventService>(EventService);

    expect(exportedTimerService).toBeDefined();
    expect(exportedCacheService).toBeDefined();
    expect(exportedGlobalVariableService).toBeDefined();
    expect(exportedClosureService).toBeDefined();
    expect(exportedEventService).toBeDefined();
  });
});
