import { Test, TestingModule } from '@nestjs/testing';
import { DebugModule } from './debug.module';
import { DebugController } from './debug.controller';
import { HealthController } from './health.controller';
import { ReadinessService } from './readiness.service';
import { AdminTokenGuard } from './admin-token.guard';

describe('DebugModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DebugModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have DebugController', () => {
    const debugController = module.get<DebugController>(DebugController);
    expect(debugController).toBeDefined();
  });

  it('should have HealthController', () => {
    const healthController = module.get<HealthController>(HealthController);
    expect(healthController).toBeDefined();
  });

  it('should have ReadinessService', () => {
    const readinessService = module.get<ReadinessService>(ReadinessService);
    expect(readinessService).toBeDefined();
  });

  it('should have AdminTokenGuard', () => {
    const adminTokenGuard = module.get<AdminTokenGuard>(AdminTokenGuard);
    expect(adminTokenGuard).toBeDefined();
  });

  it('should initialize readiness service as ready', () => {
    const readinessService = module.get<ReadinessService>(ReadinessService);
    expect(readinessService.isReady()).toBe(true);
  });
});
