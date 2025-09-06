import { startCacheLeak, stopCacheLeak, getCacheStats } from './leak-cache';

describe('leak-cache', () => {
  afterEach(() => {
    // Clean up after each test
    stopCacheLeak();
  });

  describe('getCacheStats', () => {
    it('should return initial empty cache stats', () => {
      const stats = getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.estimatedMemoryMB).toBe(0);
      expect(stats.isLeaking).toBe(false);
    });
  });

  describe('startCacheLeak', () => {
    it('should start cache leak with default options', () => {
      const result = startCacheLeak();

      expect(result.message).toBe('Cache leak started');
      expect(result.stats.size).toBe(0);

      // Check cache stats separately for isLeaking status
      const currentStats = getCacheStats();
      expect(currentStats.isLeaking).toBe(true);
    });

    it('should not allow multiple concurrent leaks', () => {
      const firstResult = startCacheLeak();
      const secondResult = startCacheLeak();

      expect(firstResult.message).toBe('Cache leak started');
      expect(secondResult.message).toBe('Cache leak already running');
    });

    it('should accept custom options', () => {
      const result = startCacheLeak({
        entrySize: 500,
        interval: 200,
      });

      expect(result.message).toBe('Cache leak started');

      // Check cache stats separately for isLeaking status
      const currentStats = getCacheStats();
      expect(currentStats.isLeaking).toBe(true);
    });

    it('should add cache entries over time', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startCacheLeak({ interval: 50 });

      // Wait for some entries to be added
      await new Promise((resolve) => setTimeout(resolve, 150));

      const stats = getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.estimatedMemoryMB).toBeGreaterThan(0);

      // Check that console logs were made
      const cacheLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Cache leak: added entry'),
      );
      expect(cacheLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should calculate memory estimation correctly', async () => {
      startCacheLeak({ interval: 10 });

      // Wait for a few entries
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = getCacheStats();
      const expectedMemory = stats.size * 8.1;

      expect(stats.estimatedMemoryMB).toBe(Number(expectedMemory.toFixed(2)));
    });
  });

  describe('stopCacheLeak', () => {
    it('should stop leak and clear all entries', async () => {
      startCacheLeak({ interval: 10 });

      // Wait for some entries to accumulate
      await new Promise((resolve) => setTimeout(resolve, 50));

      const statsBeforeStop = getCacheStats();
      expect(statsBeforeStop.size).toBeGreaterThan(0);

      const result = stopCacheLeak();

      expect(result.message).toBe('Cache leak stopped and cleared');
      expect(result.clearedEntries).toBe(statsBeforeStop.size);
      expect(result.stats.size).toBe(0);
      expect(result.stats.estimatedMemoryMB).toBe(0);

      // Check final stats separately
      const finalStats = getCacheStats();
      expect(finalStats.isLeaking).toBe(false);
    });

    it('should handle stop when no leak is running', () => {
      const result = stopCacheLeak();

      expect(result.message).toBe('Cache leak stopped and cleared');
      expect(result.clearedEntries).toBe(0);
      expect(result.stats.size).toBe(0);
    });

    it('should prevent further cache additions after stop', async () => {
      startCacheLeak({ interval: 10 });

      // Wait for some entries
      await new Promise((resolve) => setTimeout(resolve, 30));

      stopCacheLeak();

      const statsAfterStop = getCacheStats();
      const sizeAfterStop = statsAfterStop.size;

      // Wait longer to ensure no new entries are added
      await new Promise((resolve) => setTimeout(resolve, 50));

      const finalStats = getCacheStats();
      expect(finalStats.size).toBe(sizeAfterStop);
      expect(finalStats.size).toBe(0); // Should be 0 after cleanup
    });
  });

  describe('cache behavior', () => {
    it('should create cache entries with expected structure', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startCacheLeak({
        entrySize: 100,
        interval: 20,
      });

      // Wait for at least one entry
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      // Verify console output shows correct structure
      const logs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Cache leak: added entry'),
      );
      expect(logs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });
});
