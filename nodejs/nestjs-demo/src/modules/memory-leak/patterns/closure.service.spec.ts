import { Test, TestingModule } from '@nestjs/testing';
import { ClosureService } from './closure.service';

// Mock the leak-closure utility
jest.mock('../../../utils/leak-closure', () => ({
  startClosureLeak: jest.fn(),
  stopClosureLeak: jest.fn(),
  getClosureStats: jest.fn(),
}));

// Import the mocked functions
import {
  startClosureLeak,
  stopClosureLeak,
  getClosureStats,
} from '../../../utils/leak-closure';

// Type the mocks
const mockStartClosureLeak = startClosureLeak as jest.Mock;
const mockStopClosureLeak = stopClosureLeak as jest.Mock;
const mockGetClosureStats = getClosureStats as jest.Mock;

describe('ClosureService', () => {
  let service: ClosureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosureService],
    }).compile();

    service = module.get<ClosureService>(ClosureService);

    // Reset mocks before each test
    mockStartClosureLeak.mockClear();
    mockStopClosureLeak.mockClear();
    mockGetClosureStats.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startClosureLeak', () => {
    it('should start closure leak when not already running', () => {
      // Arrange
      mockStartClosureLeak.mockReturnValue({
        message: 'Closure leak started',
        stats: {
          activeClosures: 5,
          totalMemoryAllocated: 50,
          isLeaking: true,
        },
      });

      // Act
      const result = service.startClosureLeak();

      // Assert
      expect(mockStartClosureLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Closure leak started',
        stats: {
          activeClosures: 5,
          totalMemoryAllocated: 50,
          isLeaking: true,
        },
      });
    });

    it('should handle start when already running', () => {
      // Arrange
      mockStartClosureLeak.mockReturnValue({
        message: 'Closure leak already running',
        stats: {
          activeClosures: 10,
          totalMemoryAllocated: 100,
          isLeaking: true,
        },
      });

      // Act
      const result = service.startClosureLeak();

      // Assert
      expect(mockStartClosureLeak).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('Closure leak already running');
      expect(result.stats.activeClosures).toBe(10);
      expect(result.stats.isLeaking).toBe(true);
    });

    it('should handle zero initial state', () => {
      // Arrange
      mockStartClosureLeak.mockReturnValue({
        message: 'Closure leak started',
        stats: {
          activeClosures: 0,
          totalMemoryAllocated: 0,
          isLeaking: true,
        },
      });

      // Act
      const result = service.startClosureLeak();

      // Assert
      expect(result.stats.activeClosures).toBe(0);
      expect(result.stats.totalMemoryAllocated).toBe(0);
    });
  });

  describe('stopClosureLeak', () => {
    it('should stop closure leak and clear active closures', () => {
      // Arrange
      mockStopClosureLeak.mockReturnValue({
        message: 'Closure leak stopped, cleared 15 closures',
        clearedClosures: 15,
        stats: {
          activeClosures: 0,
          totalMemoryAllocated: 0,
          isLeaking: false,
        },
      });

      // Act
      const result = service.stopClosureLeak();

      // Assert
      expect(mockStopClosureLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Closure leak stopped, cleared 15 closures',
        stats: {
          activeClosures: 0,
          totalMemoryAllocated: 0,
          isLeaking: false,
        },
      });
    });

    it('should handle stopping when no closures are active', () => {
      // Arrange
      mockStopClosureLeak.mockReturnValue({
        message: 'Closure leak stopped, cleared 0 closures',
        clearedClosures: 0,
        stats: {
          activeClosures: 0,
          totalMemoryAllocated: 0,
          isLeaking: false,
        },
      });

      // Act
      const result = service.stopClosureLeak();

      // Assert
      expect(result.message).toBe('Closure leak stopped, cleared 0 closures');
      expect(result.stats.activeClosures).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return status when leak is running', () => {
      // Arrange
      mockGetClosureStats.mockReturnValue({
        activeClosures: 8,
        totalMemoryAllocated: 80,
        isLeaking: true,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(mockGetClosureStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Closure leak is running',
        stats: {
          activeClosures: 8,
          totalMemoryAllocated: 80,
          isLeaking: true,
        },
      });
    });

    it('should return status when leak is not running', () => {
      // Arrange
      mockGetClosureStats.mockReturnValue({
        activeClosures: 0,
        totalMemoryAllocated: 0,
        isLeaking: false,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result).toEqual({
        message: 'Closure leak is not running',
        stats: {
          activeClosures: 0,
          totalMemoryAllocated: 0,
          isLeaking: false,
        },
      });
    });

    it('should handle partial closure state', () => {
      // Arrange
      mockGetClosureStats.mockReturnValue({
        activeClosures: 3,
        totalMemoryAllocated: 30,
        isLeaking: false,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.message).toBe('Closure leak is not running');
      expect(result.stats.activeClosures).toBe(3);
      expect(result.stats.totalMemoryAllocated).toBe(30);
    });
  });

  describe('Edge cases', () => {
    it('should handle high memory values', () => {
      // Arrange
      mockGetClosureStats.mockReturnValue({
        activeClosures: 50,
        totalMemoryAllocated: 500,
        isLeaking: true,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.stats.activeClosures).toBe(50);
      expect(result.stats.totalMemoryAllocated).toBe(500);
    });

    it('should handle decimal memory values', () => {
      // Arrange
      mockGetClosureStats.mockReturnValue({
        activeClosures: 1,
        totalMemoryAllocated: 10,
        isLeaking: true,
      });

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.stats.totalMemoryAllocated).toBe(10);
    });
  });

  describe('Error handling', () => {
    it('should handle errors from startClosureLeak', () => {
      // Arrange
      mockStartClosureLeak.mockImplementation(() => {
        throw new Error('Closure start error');
      });

      // Act & Assert
      expect(() => service.startClosureLeak()).toThrow('Closure start error');
    });

    it('should handle errors from stopClosureLeak', () => {
      // Arrange
      mockStopClosureLeak.mockImplementation(() => {
        throw new Error('Closure stop error');
      });

      // Act & Assert
      expect(() => service.stopClosureLeak()).toThrow('Closure stop error');
    });

    it('should handle errors from getClosureStats', () => {
      // Arrange
      mockGetClosureStats.mockImplementation(() => {
        throw new Error('Stats error');
      });

      // Act & Assert
      expect(() => service.getStatus()).toThrow('Stats error');
    });
  });
});
