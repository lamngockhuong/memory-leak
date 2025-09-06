import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HealthController } from './health.controller';
import { ReadinessService } from './readiness.service';

describe('HealthController', () => {
  let controller: HealthController;
  let readinessService: ReadinessService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ReadinessService,
          useValue: {
            isReady: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    readinessService = module.get<ReadinessService>(ReadinessService);

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

  describe('ready', () => {
    it('should return 200 when service is ready', () => {
      jest.spyOn(readinessService, 'isReady').mockReturnValue(true);

      controller.ready(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith('ok');
    });

    it('should return 503 when service is not ready', () => {
      jest.spyOn(readinessService, 'isReady').mockReturnValue(false);

      controller.ready(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.send).toHaveBeenCalledWith('draining');
    });

    it('should call readiness service to check status', () => {
      const isReadySpy = jest
        .spyOn(readinessService, 'isReady')
        .mockReturnValue(true);

      controller.ready(mockResponse as Response);

      expect(isReadySpy).toHaveBeenCalled();
    });
  });
});
