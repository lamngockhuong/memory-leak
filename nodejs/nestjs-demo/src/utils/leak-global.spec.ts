import {
  startGlobalVariableLeak,
  stopGlobalVariableLeak,
  getGlobalVariableStats,
  leakMemory,
} from './leak-global';

// Extend the global interface for proper typing in tests
declare global {
  interface Global {
    leakedArray: Array<string[]>;
  }
}

describe('leak-global', () => {
  beforeEach(() => {
    // Clean up global array before each test
    stopGlobalVariableLeak();
  });

  afterEach(() => {
    // Clean up after each test
    stopGlobalVariableLeak();
  });

  describe('getGlobalVariableStats', () => {
    it('should return initial empty stats', () => {
      const stats = getGlobalVariableStats();

      expect(stats.leakedArrays).toBe(0);
      expect(stats.estimatedMemoryMB).toBe(0);
      expect(stats.isLeaking).toBe(false);
    });
  });

  describe('leakMemory', () => {
    it('should add one array to global memory', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      leakMemory();

      const stats = getGlobalVariableStats();
      expect(stats.leakedArrays).toBe(1);
      expect(stats.estimatedMemoryMB).toBe(8);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Global variable leak: added array, total: 1MB',
      );

      consoleSpy.mockRestore();
    });

    it('should accumulate arrays when called multiple times', () => {
      leakMemory();
      leakMemory();
      leakMemory();

      const stats = getGlobalVariableStats();
      expect(stats.leakedArrays).toBe(3);
      expect(stats.estimatedMemoryMB).toBe(24);
    });
  });

  describe('startGlobalVariableLeak', () => {
    it('should start global variable leak', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startGlobalVariableLeak();

      const stats = getGlobalVariableStats();
      expect(stats.isLeaking).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Global variable leak started');

      consoleSpy.mockRestore();
    });

    it('should not allow multiple concurrent leaks', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startGlobalVariableLeak();
      startGlobalVariableLeak(); // Second call

      expect(consoleSpy).toHaveBeenCalledWith(
        'Global variable leak already running',
      );

      consoleSpy.mockRestore();
    });

    it('should add arrays over time', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startGlobalVariableLeak();

      // Wait for some arrays to be added
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const stats = getGlobalVariableStats();
      expect(stats.leakedArrays).toBeGreaterThan(0);
      expect(stats.estimatedMemoryMB).toBeGreaterThan(0);

      // Check that console logs were made
      const leakLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Global variable leak: added array'),
      );
      expect(leakLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should calculate memory estimation correctly', async () => {
      startGlobalVariableLeak();

      // Wait for a few arrays
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const stats = getGlobalVariableStats();
      const expectedMemory = stats.leakedArrays * 8;

      expect(stats.estimatedMemoryMB).toBe(expectedMemory);
    });
  });

  describe('stopGlobalVariableLeak', () => {
    it('should stop leak and clear all arrays', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startGlobalVariableLeak();

      // Wait for some arrays to accumulate
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const statsBeforeStop = getGlobalVariableStats();
      expect(statsBeforeStop.leakedArrays).toBeGreaterThan(0);

      stopGlobalVariableLeak();

      const statsAfterStop = getGlobalVariableStats();
      expect(statsAfterStop.leakedArrays).toBe(0);
      expect(statsAfterStop.estimatedMemoryMB).toBe(0);
      expect(statsAfterStop.isLeaking).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Global variable leak stopped, cleared ${statsBeforeStop.leakedArrays} arrays`,
      );

      consoleSpy.mockRestore();
    });

    it('should handle stop when no leak is running', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      stopGlobalVariableLeak();

      const stats = getGlobalVariableStats();
      expect(stats.leakedArrays).toBe(0);
      expect(stats.estimatedMemoryMB).toBe(0);
      expect(stats.isLeaking).toBe(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Global variable leak stopped, cleared 0 arrays',
      );

      consoleSpy.mockRestore();
    });

    it('should prevent further array addition after stop', async () => {
      startGlobalVariableLeak();

      // Wait for some arrays
      await new Promise((resolve) => setTimeout(resolve, 600));

      stopGlobalVariableLeak();

      const statsAfterStop = getGlobalVariableStats();
      expect(statsAfterStop.leakedArrays).toBe(0);

      // Wait longer to ensure no new arrays are added
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const finalStats = getGlobalVariableStats();
      expect(finalStats.leakedArrays).toBe(0);
      expect(finalStats.estimatedMemoryMB).toBe(0);
      expect(finalStats.isLeaking).toBe(false);
    });
  });

  describe('global variable behavior', () => {
    it('should create large arrays that persist in global scope', () => {
      // Verify initial state - now properly typed
      expect(global.leakedArray).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(global.leakedArray.length).toBe(0);

      // Add some arrays
      leakMemory();
      leakMemory();

      // Check global array directly
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(global.leakedArray.length).toBe(2);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(Array.isArray(global.leakedArray[0])).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(global.leakedArray[0].length).toBe(1000000); // 1e6
    });

    it('should accumulate memory progressively', async () => {
      startGlobalVariableLeak();

      // Check progression over time
      await new Promise((resolve) => setTimeout(resolve, 600));
      const firstStats = getGlobalVariableStats();

      await new Promise((resolve) => setTimeout(resolve, 600));
      const secondStats = getGlobalVariableStats();

      expect(secondStats.leakedArrays).toBeGreaterThan(firstStats.leakedArrays);
      expect(secondStats.estimatedMemoryMB).toBeGreaterThan(
        firstStats.estimatedMemoryMB,
      );
    });

    it('should maintain global state across function calls', () => {
      // Add some arrays manually
      leakMemory();
      const statsAfterLeak = getGlobalVariableStats();

      // Start automatic leak
      startGlobalVariableLeak();
      const statsAfterStart = getGlobalVariableStats();

      // Manual arrays should still be there
      expect(statsAfterStart.leakedArrays).toBe(statsAfterLeak.leakedArrays);
      expect(statsAfterStart.isLeaking).toBe(true);
    });
  });
});
