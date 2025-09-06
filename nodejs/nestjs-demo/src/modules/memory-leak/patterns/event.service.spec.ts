import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';

// Mock the leak-event utility
jest.mock('../../../utils/leak-event', () => ({
  startEventLeak: jest.fn(),
  stopEventLeak: jest.fn(),
  triggerEvent: jest.fn(),
  getEventListenerCount: jest.fn(),
  isEventLeaking: jest.fn(),
}));

// Import the mocked functions
import {
  startEventLeak,
  stopEventLeak,
  triggerEvent,
  getEventListenerCount,
  isEventLeaking,
} from '../../../utils/leak-event';

// Type the mocks
const mockStartEventLeak = startEventLeak as jest.Mock;
const mockStopEventLeak = stopEventLeak as jest.Mock;
const mockTriggerEvent = triggerEvent as jest.Mock;
const mockGetEventListenerCount = getEventListenerCount as jest.Mock;
const mockIsEventLeaking = isEventLeaking as jest.Mock;

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventService],
    }).compile();

    service = module.get<EventService>(EventService);

    // Reset mocks before each test
    mockStartEventLeak.mockClear();
    mockStopEventLeak.mockClear();
    mockTriggerEvent.mockClear();
    mockGetEventListenerCount.mockClear();
    mockIsEventLeaking.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startEventLeak', () => {
    it('should start event leak when already running', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(5);
      mockIsEventLeaking.mockReturnValue(true);

      // Act
      const result = service.startEventLeak();

      // Assert
      expect(mockStartEventLeak).toHaveBeenCalledTimes(1);
      expect(mockGetEventListenerCount).toHaveBeenCalled();
      expect(mockIsEventLeaking).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Event leak was already running',
        stats: {
          activeListeners: 5,
          totalMemoryAllocated: 40,
          isLeaking: true,
        },
      });
    });

    it('should start event leak when not already running', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(3);
      mockIsEventLeaking.mockReturnValue(false);

      // Act
      const result = service.startEventLeak();

      // Assert
      expect(mockStartEventLeak).toHaveBeenCalledTimes(1);
      expect(result.message).toBe(
        'Event leak started - listeners will accumulate',
      );
      expect(result.stats.activeListeners).toBe(3);
      expect(result.stats.isLeaking).toBe(false);
    });

    it('should handle zero initial state', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(0);
      mockIsEventLeaking.mockReturnValue(false);

      // Act
      const result = service.startEventLeak();

      // Assert
      expect(result.stats.activeListeners).toBe(0);
      expect(result.stats.totalMemoryAllocated).toBe(0);
      expect(result.stats.isLeaking).toBe(false);
    });
  });

  describe('stopEventLeak', () => {
    it('should stop event leak and clear listeners', () => {
      // Arrange
      mockGetEventListenerCount
        .mockReturnValueOnce(8) // before stop
        .mockReturnValueOnce(0); // after stop
      mockIsEventLeaking
        .mockReturnValueOnce(true) // before stop
        .mockReturnValueOnce(false); // after stop

      // Act
      const result = service.stopEventLeak();

      // Assert
      expect(mockGetEventListenerCount).toHaveBeenCalled();
      expect(mockIsEventLeaking).toHaveBeenCalled();
      expect(mockStopEventLeak).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Event leak stopped, removed 8 listeners',
        stats: {
          activeListeners: 0,
          totalMemoryAllocated: 0,
          isLeaking: true,
        },
      });
    });

    it('should handle stopping when no listeners are active', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValueOnce(0).mockReturnValueOnce(0);
      mockIsEventLeaking.mockReturnValueOnce(false).mockReturnValueOnce(false);

      // Act
      const result = service.stopEventLeak();

      // Assert
      expect(result.message).toBe('Event leak stopped, removed 0 listeners');
      expect(result.stats.activeListeners).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('should return status when leak is not running', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(12);
      mockIsEventLeaking.mockReturnValue(false);

      // Act
      const result = service.getStatus();

      // Assert
      expect(mockGetEventListenerCount).toHaveBeenCalled();
      expect(mockIsEventLeaking).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Event leak is not running',
        stats: {
          activeListeners: 12,
          totalMemoryAllocated: 96,
          isLeaking: false,
        },
      });
    });

    it('should return status when leak is running', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(8);
      mockIsEventLeaking.mockReturnValue(true);

      // Act
      const result = service.getStatus();

      // Assert
      expect(result).toEqual({
        message: 'Event leak is running',
        stats: {
          activeListeners: 8,
          totalMemoryAllocated: 64,
          isLeaking: true,
        },
      });
    });

    it('should handle partial listener state', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(3);
      mockIsEventLeaking.mockReturnValue(false);

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.message).toBe('Event leak is not running');
      expect(result.stats.activeListeners).toBe(3);
      expect(result.stats.totalMemoryAllocated).toBe(24);
    });
  });

  describe('triggerEvent', () => {
    it('should trigger event and return event count', () => {
      // Arrange
      mockTriggerEvent.mockReturnValue(5);

      // Act
      const result = service.triggerEvent();

      // Assert
      expect(mockTriggerEvent).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Event triggered',
        listenersNotified: 5,
      });
    });

    it('should handle zero events', () => {
      // Arrange
      mockTriggerEvent.mockReturnValue(0);

      // Act
      const result = service.triggerEvent();

      // Assert
      expect(result.message).toBe('Event triggered');
      expect(result.listenersNotified).toBe(0);
    });

    it('should handle high event count', () => {
      // Arrange
      mockTriggerEvent.mockReturnValue(100);

      // Act
      const result = service.triggerEvent();

      // Assert
      expect(result.message).toBe('Event triggered');
      expect(result.listenersNotified).toBe(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle high listener counts', () => {
      // Arrange
      mockGetEventListenerCount.mockReturnValue(500);
      mockIsEventLeaking.mockReturnValue(true);

      // Act
      const result = service.getStatus();

      // Assert
      expect(result.stats.activeListeners).toBe(500);
      expect(result.stats.totalMemoryAllocated).toBe(4000);
    });

    it('should calculate memory correctly for various listener counts', () => {
      // Test memory calculation (8MB per listener)
      const testCases = [
        { listeners: 1, expectedMemory: 8 },
        { listeners: 5, expectedMemory: 40 },
        { listeners: 10, expectedMemory: 80 },
      ];

      testCases.forEach(({ listeners, expectedMemory }) => {
        // Arrange
        mockGetEventListenerCount.mockReturnValue(listeners);
        mockIsEventLeaking.mockReturnValue(true);

        // Act
        const result = service.getStatus();

        // Assert
        expect(result.stats.totalMemoryAllocated).toBe(expectedMemory);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle errors from startEventLeak', () => {
      // Arrange
      mockStartEventLeak.mockImplementation(() => {
        throw new Error('Event start error');
      });

      // Act & Assert
      expect(() => service.startEventLeak()).toThrow('Event start error');
    });

    it('should handle errors from stopEventLeak', () => {
      // Arrange
      mockStopEventLeak.mockImplementation(() => {
        throw new Error('Event stop error');
      });

      // Act & Assert
      expect(() => service.stopEventLeak()).toThrow('Event stop error');
    });

    it('should handle errors from triggerEvent', () => {
      // Arrange
      mockTriggerEvent.mockImplementation(() => {
        throw new Error('Trigger error');
      });

      // Act & Assert
      expect(() => service.triggerEvent()).toThrow('Trigger error');
    });

    it('should handle errors from getEventListenerCount', () => {
      // Arrange
      mockGetEventListenerCount.mockImplementation(() => {
        throw new Error('Listener count error');
      });

      // Act & Assert
      expect(() => service.getStatus()).toThrow('Listener count error');
    });
  });
});
