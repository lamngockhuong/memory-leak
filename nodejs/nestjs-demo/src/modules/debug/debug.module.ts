import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { ReadinessService } from './readiness.service';
import { AdminTokenGuard } from './admin-token.guard';
import { HealthController } from './health.controller';

@Module({
  controllers: [DebugController, HealthController],
  providers: [ReadinessService, AdminTokenGuard],
})
export class DebugModule {}
