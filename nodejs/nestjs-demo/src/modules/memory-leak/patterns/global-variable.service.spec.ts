import { Test, TestingModule } from '@nestjs/testing';
import { GlobalVariableService } from './global-variable.service';

// Mock the leak-global utility
jest.mock('../../../utils/leak-global', () => ({
  startGlobalVariableLeak: jest.fn(),
  stopGlobalVariableLeak: jest.fn(),
  getGlobalVariableStats: jest.fn(),
}));

// Import mocked module
import * as leakGlobalUtils from '../../../utils/leak-global';

describe('GlobalVariableService', () => {
  let service: GlobalVariableService;
  const mockStartGlobalVariableLeak =
    leakGlobalUtils.startGlobalVariableLeak as jest.Mock;
  const mockStopGlobalVariableLeak =
    leakGlobalUtils.stopGlobalVariableLeak as jest.Mock;
  const mockGetGlobalVariableStats =
    leakGlobalUtils.getGlobalVariableStats as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalVariableService],
    }).compile();

    service = module.get<GlobalVariableService>(GlobalVariableService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startGlobalVariableLeak', () => {
    it('should start global variable leak when not already running', () => {
      // Arrange
      mockGetGlobalVariableStats
        .mockReturnValueOnce({
          leakedArrays: 0,
          estimatedMemoryMB: 0,
          isLeaking: false,
        }) // Initial check
        .mockReturnValueOnce({
          leakedArrays: 1,
          estimatedMemoryMB: 8,
          isLeaking: true,
        }); // After start

      // Act
      const result = service.startGlobalVariableLeak();

      // Assert
      expect(mockGetGlobalVariableStats).toHaveBeenCalledTimes(2);
      expect(mockStartGlobalVariableLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message:
          'Global variable leak started - arrays will accumulate in global scope',
        stats: {
          leakedArrays: 1,
          estimatedMemoryMB: 8,
          isLeaking: true,
        },
      });
    });

    it('should handle when leak is already running', () => {
      // Arrange
      mockGetGlobalVariableStats
        .mockReturnValueOnce({
          leakedArrays: 5,
          estimatedMemoryMB: 40,
          isLeaking: true,
        }) // Initial check
        .mockReturnValueOnce({
          leakedArrays: 6,
          estimatedMemoryMB: 48,
          isLeaking: true,
        }); // After start

      // Act
      const result = service.startGlobalVariableLeak();

      // Assert
      expect(result.message).toBe('Global variable leak was already running');
      expect(result.stats.leakedArrays).toBe(6);
      expect(result.stats.isLeaking).toBe(true);
    });
  });

  describe('stopGlobalVariableLeak', () => {
    it('should stop global variable leak and clear arrays', () => {
      // Arrange
      mockGetGlobalVariableStats
        .mockReturnValueOnce({
          leakedArrays: 10,
          estimatedMemoryMB: 80,
          isLeaking: true,
        }) // prevStats
        .mockReturnValueOnce({
          leakedArrays: 0,
          estimatedMemoryMB: 0,
          isLeaking: false,
        }); // After stop

      // Act
      const result = service.stopGlobalVariableLeak();

      // Assert
      expect(mockGetGlobalVariableStats).toHaveBeenCalledTimes(2);
      expect(mockStopGlobalVariableLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Global variable leak stopped - cleared 10 arrays',
        stats: {
          leakedArrays: 0,
          estimatedMemoryMB: 0,
          isLeaking: false,
        },
      });
    });

    it('should handle stopping when no arrays were leaked', () => {
      // Arrange
      mockGetGlobalVariableStats
        .mockReturnValueOnce({
          leakedArrays: 0,
          estimatedMemoryMB: 0,
          isLeaking: false,
        }) // prevStats
        .mockReturnValueOnce({
          leakedArrays: 0,
          estimatedMemoryMB: 0,
          isLeaking: false,
        }); // After stop

      // Act
      const result = service.stopGlobalVariableLeak();

      // Assert
      expect(result.message).toBe(
        'Global variable leak stopped - cleared 0 arrays',
      );
      expect(result.stats.leakedArrays).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return status when leak is running', () => {
      // Arrange
      mockGetGlobalVariableStats.mockReturnValue({
        leakedArrays: 5,
        estimatedMemoryMB: 40,
        isLeaking: true,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(mockGetGlobalVariableStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Global variable leak is running',
        stats: {
          leakedArrays: 5,
          estimatedMemoryMB: 40,
          isLeaking: true,
        },
      });
    });

    it('should return status when leak is not running', () => {
      // Arrange
      mockGetGlobalVariableStats.mockReturnValue({
        leakedArrays: 0,
        estimatedMemoryMB: 0,
        isLeaking: false,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result).toEqual({
        message: 'Global variable leak is not running',
        stats: {
          leakedArrays: 0,
          estimatedMemoryMB: 0,
          isLeaking: false,
        },
      });
    });

    it('should handle partial state correctly', () => {
      // Arrange
      mockGetGlobalVariableStats.mockReturnValue({
        leakedArrays: 3,
        estimatedMemoryMB: 15.5,
        isLeaking: false,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.message).toBe('Global variable leak is not running');
      expect(result.stats.leakedArrays).toBe(3);
      expect(result.stats.estimatedMemoryMB).toBe(15.5);
    });
  });

  describe('Edge cases', () => {
    it('should handle large memory values', () => {
      // Arrange
      mockGetGlobalVariableStats.mockReturnValue({
        leakedArrays: 1000,
        estimatedMemoryMB: 999.99,
        isLeaking: true,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.stats.leakedArrays).toBe(1000);
      expect(result.stats.estimatedMemoryMB).toBe(999.99);
    });

    it('should handle decimal memory values correctly', () => {
      // Arrange
      mockGetGlobalVariableStats.mockReturnValue({
        leakedArrays: 1,
        estimatedMemoryMB: 0.001,
        isLeaking: true,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.stats.estimatedMemoryMB).toBe(0.001);
    });
  });

  describe('Error handling', () => {
    it('should handle errors from utility functions gracefully', () => {
      // Arrange
      mockStartGlobalVariableLeak.mockImplementation(() => {
        throw new Error('Global variable error');
      });

      // Act & Assert
      expect(() => service.startGlobalVariableLeak()).toThrow(
        'Global variable error',
      );
    });

    it('should handle errors in getGlobalVariableStats', () => {
      // Arrange
      mockGetGlobalVariableStats.mockImplementation(() => {
        throw new Error('Stats error');
      });

      // Act & Assert
      expect(() => service.getStatus()).toThrow('Stats error');
    });
  });
});
