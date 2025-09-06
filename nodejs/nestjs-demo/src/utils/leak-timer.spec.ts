import {
  startTimerLeak,
  stopAllTimers,
  getActiveTimersCount,
} from './leak-timer';

describe('leak-timer', () => {
  beforeEach(() => {
    // Clean up any existing timers before each test
    stopAllTimers();
  });

  afterEach(() => {
    // Clean up after each test to prevent interference
    stopAllTimers();
  });

  describe('getActiveTimersCount', () => {
    it('should return 0 initially', () => {
      expect(getActiveTimersCount()).toBe(0);
    });
  });

  describe('startTimerLeak', () => {
    it('should create and track a timer', () => {
      const initialCount = getActiveTimersCount();

      startTimerLeak();

      expect(getActiveTimersCount()).toBe(initialCount + 1);
    });

    it('should create multiple timers when called multiple times', () => {
      startTimerLeak();
      expect(getActiveTimersCount()).toBe(1);

      startTimerLeak();
      expect(getActiveTimersCount()).toBe(2);

      startTimerLeak();
      expect(getActiveTimersCount()).toBe(3);
    });

    it('should log timer creation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startTimerLeak();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Timer leak started. Active timers: 1',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('stopAllTimers', () => {
    it('should clear all timers and reset count to 0', () => {
      // Create multiple timers
      startTimerLeak();
      startTimerLeak();
      startTimerLeak();

      expect(getActiveTimersCount()).toBe(3);

      stopAllTimers();

      expect(getActiveTimersCount()).toBe(0);
    });

    it('should log the number of cleared timers', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Create some timers
      startTimerLeak();
      startTimerLeak();

      stopAllTimers();

      expect(consoleSpy).toHaveBeenCalledWith(
        'All timer leaks stopped, cleared 2 timeout objects',
      );

      consoleSpy.mockRestore();
    });

    it('should handle being called when no timers exist', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      stopAllTimers();

      expect(consoleSpy).toHaveBeenCalledWith(
        'All timer leaks stopped, cleared 0 timeout objects',
      );
      expect(getActiveTimersCount()).toBe(0);

      consoleSpy.mockRestore();
    });

    it('should stop timer intervals from executing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startTimerLeak();

      // Wait a bit for timer to potentially execute
      await new Promise((resolve) => setTimeout(resolve, 50));

      const initialLogCount = consoleSpy.mock.calls.length;

      stopAllTimers();

      // Wait longer to ensure timers would have executed if not stopped
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Should not have additional timer execution logs
      const finalLogCount = consoleSpy.mock.calls.length;
      expect(finalLogCount).toBe(initialLogCount + 1); // Only the stop message

      consoleSpy.mockRestore();
    });
  });

  describe('timer execution', () => {
    it('should execute timer callback and log allocation', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startTimerLeak();

      // Wait for timer to execute at least once
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Check that timer execution log was called
      const executionLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Timer leak: allocated 5MB buffer'),
      );
      expect(executionLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });
});
