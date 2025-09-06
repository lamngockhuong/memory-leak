import {
  startClosureLeak,
  stopClosureLeak,
  getClosureStats,
} from './leak-closure';

describe('leak-closure', () => {
  afterEach(() => {
    // Clean up after each test
    stopClosureLeak();
  });

  describe('getClosureStats', () => {
    it('should return initial empty closure stats', () => {
      const stats = getClosureStats();

      expect(stats.activeClosures).toBe(0);
      expect(stats.totalMemoryAllocated).toBe(0);
      expect(stats.isLeaking).toBe(false);
    });
  });

  describe('startClosureLeak', () => {
    it('should start closure leak', () => {
      const result = startClosureLeak();

      expect(result.message).toBe('Closure leak started');
      expect(result.stats.activeClosures).toBe(0);
      expect(result.stats.totalMemoryAllocated).toBe(0);
      expect(result.stats.isLeaking).toBe(true);
    });

    it('should not allow multiple concurrent leaks', () => {
      const firstResult = startClosureLeak();
      const secondResult = startClosureLeak();

      expect(firstResult.message).toBe('Closure leak started');
      expect(secondResult.message).toBe('Closure leak already running');
      expect(secondResult.stats.isLeaking).toBe(true);
    });

    it('should create closures over time', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startClosureLeak();

      // Wait for some closures to be created
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const stats = getClosureStats();
      expect(stats.activeClosures).toBeGreaterThan(0);
      expect(stats.totalMemoryAllocated).toBeGreaterThan(0);

      // Check that console logs were made
      const closureLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Closure leak: created closure'),
      );
      expect(closureLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should calculate memory allocation correctly', async () => {
      startClosureLeak();

      // Wait for a few closures
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const stats = getClosureStats();
      const expectedMemory = stats.activeClosures * 10;

      expect(stats.totalMemoryAllocated).toBe(expectedMemory);
    });
  });

  describe('stopClosureLeak', () => {
    it('should stop leak and clear all closures', async () => {
      startClosureLeak();

      // Wait for some closures to accumulate
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const statsBeforeStop = getClosureStats();
      expect(statsBeforeStop.activeClosures).toBeGreaterThan(0);

      const result = stopClosureLeak();

      expect(result.message).toContain('Closure leak stopped');
      expect(result.clearedClosures).toBe(statsBeforeStop.activeClosures);
      expect(result.stats.activeClosures).toBe(0);
      expect(result.stats.totalMemoryAllocated).toBe(0);
      expect(result.stats.isLeaking).toBe(false);
    });

    it('should handle stop when no leak is running', () => {
      const result = stopClosureLeak();

      expect(result.message).toContain('Closure leak stopped');
      expect(result.clearedClosures).toBe(0);
      expect(result.stats.activeClosures).toBe(0);
      expect(result.stats.totalMemoryAllocated).toBe(0);
      expect(result.stats.isLeaking).toBe(false);
    });

    it('should prevent further closure creation after stop', async () => {
      startClosureLeak();

      // Wait for some closures
      await new Promise((resolve) => setTimeout(resolve, 500));

      stopClosureLeak();

      const statsAfterStop = getClosureStats();
      expect(statsAfterStop.activeClosures).toBe(0);

      // Wait longer to ensure no new closures are created
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const finalStats = getClosureStats();
      expect(finalStats.activeClosures).toBe(0);
      expect(finalStats.totalMemoryAllocated).toBe(0);
      expect(finalStats.isLeaking).toBe(false);
    });
  });

  describe('closure behavior', () => {
    it('should log closure creation with correct memory info', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startClosureLeak();

      // Wait for at least one closure
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const stats = getClosureStats();
      expect(stats.activeClosures).toBeGreaterThan(0);

      // Verify console output shows correct memory calculation
      const logs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('holding') &&
          call[0].includes('MB total'),
      );
      expect(logs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should return correct stats during leak progression', async () => {
      startClosureLeak();

      // Check initial state
      let stats = getClosureStats();
      expect(stats.isLeaking).toBe(true);

      // Wait for first closure
      await new Promise((resolve) => setTimeout(resolve, 1100));

      stats = getClosureStats();
      expect(stats.activeClosures).toBeGreaterThanOrEqual(1);
      expect(stats.totalMemoryAllocated).toBeGreaterThanOrEqual(10);

      // Wait for more closures
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const finalStats = getClosureStats();
      expect(finalStats.activeClosures).toBeGreaterThan(stats.activeClosures);
      expect(finalStats.totalMemoryAllocated).toBeGreaterThan(
        stats.totalMemoryAllocated,
      );
    });
  });
});
