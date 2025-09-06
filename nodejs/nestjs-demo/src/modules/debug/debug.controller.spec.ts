import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { DebugController } from './debug.controller';
import { ReadinessService } from './readiness.service';
import { AdminTokenGuard } from './admin-token.guard';
import { Heapdump } from '../../utils/heapdump';

// Mock the heapdump utility
jest.mock('../../utils/heapdump', () => ({
  Heapdump: {
    writeSnapshot: jest.fn(),
  },
}));

const mockHeapdump = Heapdump as jest.Mocked<typeof Heapdump>;

describe('DebugController', () => {
  let controller: DebugController;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebugController],
      providers: [
        {
          provide: ReadinessService,
          useValue: {
            setReady: jest.fn(),
          },
        },
        AdminTokenGuard,
      ],
    }).compile();

    controller = module.get<DebugController>(DebugController);

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('take heapdump', () => {
    it('should create heapdump successfully', async () => {
      mockHeapdump.writeSnapshot.mockResolvedValue(
        'test-heapdump.heapsnapshot',
      );

      await controller.take(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.send).toHaveBeenCalledWith('dump started');
    });

    it('should return 429 when heapdump is already in progress', async () => {
      mockHeapdump.writeSnapshot.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('test.heapsnapshot'), 50),
          ),
      );

      // Start first heapdump
      const firstPromise = controller.take(mockResponse as Response);

      // Try to start second heapdump while first is still running
      const secondMockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };

      await controller.take(secondMockResponse as unknown as Response);

      expect(secondMockResponse.status).toHaveBeenCalledWith(429);
      expect(secondMockResponse.send).toHaveBeenCalledWith(
        'already in progress',
      );

      // Wait for first to complete
      await firstPromise;
    });

    it('should handle heapdump errors gracefully', async () => {
      const error = new Error('Heapdump failed');
      mockHeapdump.writeSnapshot.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await controller.take(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.send).toHaveBeenCalledWith('dump started');

      consoleSpy.mockRestore();
    });

    it('should handle normal operation flow', async () => {
      mockHeapdump.writeSnapshot.mockResolvedValue('test.heapsnapshot');

      await controller.take(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.send).toHaveBeenCalledWith('dump started');
    });
  });
});
