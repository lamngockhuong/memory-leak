import {
  startEventLeak,
  stopEventLeak,
  getEventListenerCount,
  isEventLeaking,
  triggerEvent,
} from './leak-event';

describe('leak-event', () => {
  afterEach(() => {
    // Clean up after each test
    stopEventLeak();
  });

  describe('initial state', () => {
    it('should have no listeners initially', () => {
      expect(getEventListenerCount()).toBe(0);
      expect(isEventLeaking()).toBe(false);
    });
  });

  describe('startEventLeak', () => {
    it('should start event leak', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();

      expect(isEventLeaking()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Event leak started');

      consoleSpy.mockRestore();
    });

    it('should not allow multiple concurrent leaks', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();
      startEventLeak(); // Second call

      expect(isEventLeaking()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Event leak already running');

      consoleSpy.mockRestore();
    });

    it('should add event listeners over time', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();

      // Wait for some listeners to be added
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const listenerCount = getEventListenerCount();
      expect(listenerCount).toBeGreaterThan(0);

      // Check that console logs were made
      const eventLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Event leak: added listener'),
      );
      expect(eventLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should accumulate listeners progressively', async () => {
      startEventLeak();

      // Check initial count
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const firstCount = getEventListenerCount();
      expect(firstCount).toBeGreaterThan(0);

      // Wait for more listeners
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const secondCount = getEventListenerCount();
      expect(secondCount).toBeGreaterThan(firstCount);
    });
  });

  describe('stopEventLeak', () => {
    it('should stop leak and remove all listeners', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();

      // Wait for some listeners to accumulate
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const listenerCountBeforeStop = getEventListenerCount();
      expect(listenerCountBeforeStop).toBeGreaterThan(0);

      stopEventLeak();

      expect(getEventListenerCount()).toBe(0);
      expect(isEventLeaking()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Event leak stopped, removed ${listenerCountBeforeStop} listeners`,
      );

      consoleSpy.mockRestore();
    });

    it('should handle stop when no leak is running', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      stopEventLeak();

      expect(getEventListenerCount()).toBe(0);
      expect(isEventLeaking()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Event leak stopped, removed 0 listeners',
      );

      consoleSpy.mockRestore();
    });

    it('should prevent further listener addition after stop', async () => {
      startEventLeak();

      // Wait for some listeners
      await new Promise((resolve) => setTimeout(resolve, 600));

      stopEventLeak();

      expect(getEventListenerCount()).toBe(0);

      // Wait longer to ensure no new listeners are added
      await new Promise((resolve) => setTimeout(resolve, 1200));

      expect(getEventListenerCount()).toBe(0);
      expect(isEventLeaking()).toBe(false);
    });
  });

  describe('triggerEvent', () => {
    it('should trigger all listeners and return count', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();

      // Wait for some listeners to be added
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const listenerCount = getEventListenerCount();
      expect(listenerCount).toBeGreaterThan(0);

      const triggeredCount = triggerEvent();

      expect(triggeredCount).toBe(listenerCount);

      // Verify that listeners were executed (they log big data length)
      const executionLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' && call[0].includes('Big data length:'),
      );
      expect(executionLogs.length).toBe(listenerCount);

      consoleSpy.mockRestore();
    });

    it('should return 0 when no listeners exist', () => {
      const triggeredCount = triggerEvent();
      expect(triggeredCount).toBe(0);
    });

    it('should trigger events multiple times correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();

      // Wait for listeners
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const listenerCount = getEventListenerCount();

      // Trigger multiple times
      const firstTrigger = triggerEvent();
      const secondTrigger = triggerEvent();

      expect(firstTrigger).toBe(listenerCount);
      expect(secondTrigger).toBe(listenerCount);

      // Should have execution logs for both triggers
      const executionLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' && call[0].includes('Big data length:'),
      );
      expect(executionLogs.length).toBe(listenerCount * 2);

      consoleSpy.mockRestore();
    });
  });

  describe('listener behavior', () => {
    it('should create listeners with large data closure', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      startEventLeak();

      // Wait for at least one listener
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(getEventListenerCount()).toBeGreaterThan(0);

      // Trigger to see closure behavior
      triggerEvent();

      // Verify that the closure accesses the big data
      const bigDataLogs = consoleSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('Big data length:') &&
          call[1] === 1000000, // 1e6 array length
      );
      expect(bigDataLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should maintain listener state across operations', async () => {
      startEventLeak();

      // Wait for listeners
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const countBefore = getEventListenerCount();
      expect(countBefore).toBeGreaterThan(0);

      // Trigger event should not affect listener count
      triggerEvent();

      const countAfter = getEventListenerCount();
      expect(countAfter).toBe(countBefore);

      // Leak should still be active
      expect(isEventLeaking()).toBe(true);
    });
  });
});
