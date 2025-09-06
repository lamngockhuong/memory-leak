import { Test, TestingModule } from '@nestjs/testing';
import { TimerService } from './timer.service';

// Mock the leak-timer utility
jest.mock('../../../utils/leak-timer', () => ({
  startTimerLeak: jest.fn(),
  stopAllTimers: jest.fn(),
  getActiveTimersCount: jest.fn(),
}));

// Import mocked module
import * as leakTimerUtils from '../../../utils/leak-timer';

describe('TimerService', () => {
  let service: TimerService;
  const mockStartTimerLeak = leakTimerUtils.startTimerLeak as jest.Mock;
  const mockStopAllTimers = leakTimerUtils.stopAllTimers as jest.Mock;
  const mockGetActiveTimersCount =
    leakTimerUtils.getActiveTimersCount as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimerService],
    }).compile();

    service = module.get<TimerService>(TimerService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startTimerLeak', () => {
    it('should start a timer leak', () => {
      // Arrange
      mockGetActiveTimersCount.mockReturnValue(1);

      // Act
      const result = service.startTimerLeak();

      // Assert
      expect(mockStartTimerLeak).toHaveBeenCalledTimes(1);
      expect(mockGetActiveTimersCount).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message:
          'Timer leak started - timeout objects will accumulate in memory',
        activeTimers: 1,
      });
    });

    it('should handle multiple timer leaks', () => {
      // Arrange
      mockGetActiveTimersCount.mockReturnValue(5);

      // Act
      const result = service.startTimerLeak();

      // Assert
      expect(result.activeTimers).toBe(5);
      expect(result.message).toContain('Timer leak started');
    });
  });

  describe('getActiveTimersCount', () => {
    it('should return current timer count', () => {
      // Arrange
      mockGetActiveTimersCount.mockReturnValue(3);

      // Act
      const result = service.getActiveTimersCount();

      // Assert
      expect(mockGetActiveTimersCount).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Currently 3 timeout object(s) leaked in memory',
        activeTimers: 3,
      });
    });

    it('should handle zero active timers', () => {
      // Arrange
      mockGetActiveTimersCount.mockReturnValue(0);

      // Act
      const result = service.getActiveTimersCount();

      // Assert
      expect(result).toEqual({
        message: 'Currently 0 timeout object(s) leaked in memory',
        activeTimers: 0,
      });
    });
  });

  describe('stopAllTimers', () => {
    it('should stop all timers', () => {
      // Arrange
      mockGetActiveTimersCount
        .mockReturnValueOnce(5) // prevCount
        .mockReturnValueOnce(0); // activeTimers after stop

      // Act
      const result = service.stopAllTimers();

      // Assert
      expect(mockStopAllTimers).toHaveBeenCalledTimes(1);
      expect(mockGetActiveTimersCount).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        message: 'All timer leaks stopped - cleared 5 timeout objects',
        stoppedTimers: 5,
        activeTimers: 0,
      });
    });

    it('should return 0 stopped timers when none are active', () => {
      // Arrange
      mockGetActiveTimersCount.mockReturnValue(0);

      // Act
      const result = service.stopAllTimers();

      // Assert
      expect(result.stoppedTimers).toBe(0);
      expect(result.activeTimers).toBe(0);
      expect(result.message).toContain('cleared 0 timeout objects');
    });
  });

  describe('Error handling', () => {
    it('should handle errors from utility functions', () => {
      // Arrange
      mockStartTimerLeak.mockImplementation(() => {
        throw new Error('Timer error');
      });

      // Act & Assert
      expect(() => service.startTimerLeak()).toThrow('Timer error');
    });
  });
});
