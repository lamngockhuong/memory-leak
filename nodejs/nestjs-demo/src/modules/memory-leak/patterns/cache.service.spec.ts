import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

// Mock the leak-cache utility
jest.mock('../../../utils/leak-cache', () => ({
  startCacheLeak: jest.fn(),
  stopCacheLeak: jest.fn(),
  getCacheStats: jest.fn(),
}));

// Import mocked module
import * as leakCacheUtils from '../../../utils/leak-cache';

describe('CacheService', () => {
  let service: CacheService;
  const mockStartCacheLeak = leakCacheUtils.startCacheLeak as jest.Mock;
  const mockStopCacheLeak = leakCacheUtils.stopCacheLeak as jest.Mock;
  const mockGetCacheStats = leakCacheUtils.getCacheStats as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startCacheLeak', () => {
    it('should start cache leak and return formatted response', () => {
      // Arrange
      mockStartCacheLeak.mockReturnValue({
        message: 'Cache leak started',
        stats: {
          size: 5,
          estimatedMemoryMB: 2.5,
        },
      });

      // Act
      const result = service.startCacheLeak();

      // Assert
      expect(mockStartCacheLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Cache leak started',
        stats: {
          size: 5,
          memoryUsage: '~2.50 MB',
          maxSize: 0,
        },
      });
    });

    it('should handle large memory values correctly', () => {
      // Arrange
      mockStartCacheLeak.mockReturnValue({
        message: 'Cache leak started',
        stats: {
          size: 1000,
          estimatedMemoryMB: 123.456789,
        },
      });

      // Act
      const result = service.startCacheLeak();

      // Assert
      expect(result.stats.memoryUsage).toBe('~123.46 MB');
      expect(result.stats.size).toBe(1000);
    });
  });

  describe('stopCacheLeak', () => {
    it('should stop cache leak and return formatted response', () => {
      // Arrange
      mockStopCacheLeak.mockReturnValue({
        message: 'Cache leak stopped',
        clearedEntries: 10,
        stats: {
          size: 0,
          estimatedMemoryMB: 0,
        },
      });

      // Act
      const result = service.stopCacheLeak();

      // Assert
      expect(mockStopCacheLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Cache leak stopped',
        clearedEntries: 10,
        stats: {
          size: 0,
          memoryUsage: '~0.00 MB',
          maxSize: 0,
        },
      });
    });

    it('should handle cleared entries correctly', () => {
      // Arrange
      mockStopCacheLeak.mockReturnValue({
        message: 'Cache cleared',
        clearedEntries: 250,
        stats: {
          size: 5,
          estimatedMemoryMB: 1.25,
        },
      });

      // Act
      const result = service.stopCacheLeak();

      // Assert
      expect(result.clearedEntries).toBe(250);
      expect(result.stats.size).toBe(5);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics with formatted memory', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 42,
        estimatedMemoryMB: 15.678,
        isLeaking: true,
      });

      // Act
      const result = service.getCacheStats();

      // Assert
      expect(mockGetCacheStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        size: 42,
        memoryUsage: '~15.68 MB',
        maxSize: 0,
      });
    });

    it('should handle zero memory correctly', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 0,
        estimatedMemoryMB: 0,
        isLeaking: false,
      });

      // Act
      const result = service.getCacheStats();

      // Assert
      expect(result.memoryUsage).toBe('~0.00 MB');
      expect(result.size).toBe(0);
    });
  });

  describe('getCacheStatus', () => {
    it('should return cache status when leaking', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 100,
        estimatedMemoryMB: 50.5,
        isLeaking: true,
      });

      // Act
      const result = service.getCacheStatus();

      // Assert
      expect(mockGetCacheStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        isLeaking: true,
        stats: {
          size: 100,
          memoryUsage: '~50.50 MB',
          maxSize: 0,
        },
        message: 'Cache leak running, 100 entries',
      });
    });

    it('should return cache status when not leaking', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 0,
        estimatedMemoryMB: 0,
        isLeaking: false,
      });

      // Act
      const result = service.getCacheStatus();

      // Assert
      expect(result).toEqual({
        isLeaking: false,
        stats: {
          size: 0,
          memoryUsage: '~0.00 MB',
          maxSize: 0,
        },
        message: 'Cache leak stopped, 0 entries',
      });
    });

    it('should handle partial leaking state', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 25,
        estimatedMemoryMB: 10.123,
        isLeaking: false,
      });

      // Act
      const result = service.getCacheStatus();

      // Assert
      expect(result.isLeaking).toBe(false);
      expect(result.message).toBe('Cache leak stopped, 25 entries');
      expect(result.stats.size).toBe(25);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call stopCacheLeak when module is destroyed', () => {
      // Act
      service.onModuleDestroy();

      // Assert
      expect(mockStopCacheLeak).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory formatting', () => {
    it('should format very small memory values correctly', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 1,
        estimatedMemoryMB: 0.001,
        isLeaking: false,
      });

      // Act
      const result = service.getCacheStats();

      // Assert
      expect(result.memoryUsage).toBe('~0.00 MB');
    });

    it('should format large memory values correctly', () => {
      // Arrange
      mockGetCacheStats.mockReturnValue({
        size: 10000,
        estimatedMemoryMB: 999.999,
        isLeaking: true,
      });

      // Act
      const result = service.getCacheStats();

      // Assert
      expect(result.memoryUsage).toBe('~1000.00 MB');
    });
  });

  describe('Error handling', () => {
    it('should handle errors from utility functions gracefully', () => {
      // Arrange
      mockStartCacheLeak.mockImplementation(() => {
        throw new Error('Cache error');
      });

      // Act & Assert
      expect(() => service.startCacheLeak()).toThrow('Cache error');
    });
  });
});
