import { Module } from '@nestjs/common';
import { MemoryLeakController } from './memory-leak.controller';
import { TimerService } from './patterns/timer.service';
import { CacheService } from './patterns/cache.service';
import { GlobalVariableService } from './patterns/global-variable.service';
import { ClosureService } from './patterns/closure.service';
import { EventService } from './patterns/event.service';

@Module({
  controllers: [MemoryLeakController],
  providers: [
    TimerService,
    CacheService,
    GlobalVariableService,
    ClosureService,
    EventService,
  ],
  exports: [
    TimerService,
    CacheService,
    GlobalVariableService,
    ClosureService,
    EventService,
  ],
})
export class MemoryLeakModule {}
