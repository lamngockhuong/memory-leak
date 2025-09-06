import { Heapdump } from './heapdump';
import * as v8 from 'v8';
import { promises as fs } from 'fs';
import * as path from 'path';

// Mock v8 and fs modules
jest.mock('v8');
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    stat: jest.fn(),
    readdir: jest.fn(),
  },
}));

const mockedV8 = v8 as jest.Mocked<typeof v8>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('Heapdump', () => {
  const mockTimestamp = '2023-09-06T10-30-45-123Z';
  const originalConsoleLog = console.log;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Date.toISOString to return predictable timestamp
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockTimestamp);

    consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    // Setup default successful mocks
    mockedFs.mkdir.mockResolvedValue(undefined);
    mockedV8.writeHeapSnapshot.mockReturnValue('test-file.heapsnapshot');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    console.log = originalConsoleLog;
  });

  describe('writeSnapshot', () => {
    it('should create heapdump with default parameters', async () => {
      const result = await Heapdump.writeSnapshot();

      const expectedPath = path.join(
        process.cwd(),
        'heapdumps',
        `snapshot-${mockTimestamp}.heapsnapshot`,
      );

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'heapdumps'),
        { recursive: true },
      );
      expect(mockedV8.writeHeapSnapshot).toHaveBeenCalledWith(expectedPath);
      expect(result).toBe(expectedPath);
      expect(consoleSpy).toHaveBeenCalledWith(
        `Heap snapshot saved to: ${expectedPath}`,
      );
    });

    it('should create heapdump with custom label', async () => {
      const label = 'custom-test';
      const result = await Heapdump.writeSnapshot(label);

      const expectedPath = path.join(
        process.cwd(),
        'heapdumps',
        `${label}-${mockTimestamp}.heapsnapshot`,
      );

      expect(result).toBe(expectedPath);
      expect(mockedV8.writeHeapSnapshot).toHaveBeenCalledWith(expectedPath);
    });

    it('should create heapdump with custom output directory', async () => {
      const customDir = '/custom/output/dir';
      const result = await Heapdump.writeSnapshot('test', customDir);

      const expectedPath = path.join(
        customDir,
        `test-${mockTimestamp}.heapsnapshot`,
      );

      expect(mockedFs.mkdir).toHaveBeenCalledWith(path.resolve(customDir), {
        recursive: true,
      });
      expect(result).toBe(expectedPath);
      expect(mockedV8.writeHeapSnapshot).toHaveBeenCalledWith(expectedPath);
    });

    it('should handle mkdir errors and rethrow', async () => {
      const mkdirError = new Error('Failed to create directory');
      mockedFs.mkdir.mockRejectedValue(mkdirError);

      await expect(Heapdump.writeSnapshot()).rejects.toThrow(mkdirError);

      expect(mockedV8.writeHeapSnapshot).not.toHaveBeenCalled();
    });

    it('should handle writeHeapSnapshot errors', async () => {
      const writeError = new Error('Failed to write heap snapshot');
      mockedV8.writeHeapSnapshot.mockImplementation(() => {
        throw writeError;
      });

      await expect(Heapdump.writeSnapshot()).rejects.toThrow(
        'Failed to write heap snapshot: Failed to write heap snapshot',
      );

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle unknown errors', async () => {
      mockedV8.writeHeapSnapshot.mockImplementation(() => {
        // Simulate a non-Error object being thrown (edge case)
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'String error'; // Non-Error object
      });

      await expect(Heapdump.writeSnapshot()).rejects.toThrow(
        'Failed to write heap snapshot: Unknown error occurred',
      );
    });

    it('should create directory recursively', async () => {
      const customDir = '/deep/nested/custom/dir';
      await Heapdump.writeSnapshot('test', customDir);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(path.resolve(customDir), {
        recursive: true,
      });
    });

    it('should generate unique filenames with timestamp', async () => {
      // First call
      const result1 = await Heapdump.writeSnapshot('test');

      // Mock different timestamp for second call
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue('2023-09-06T10-31-00-456Z');

      const result2 = await Heapdump.writeSnapshot('test');

      expect(result1).not.toBe(result2);
      expect(result1).toContain('test-2023-09-06T10-30-45-123Z');
      expect(result2).toContain('test-2023-09-06T10-31-00-456Z');
    });

    it('should handle empty label gracefully', async () => {
      const result = await Heapdump.writeSnapshot('');

      expect(result).toContain(`-${mockTimestamp}.heapsnapshot`);
      expect(mockedV8.writeHeapSnapshot).toHaveBeenCalled();
    });

    it('should work with relative output directory', async () => {
      const relativeDir = './custom/output';
      await Heapdump.writeSnapshot('test', relativeDir);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(path.resolve(relativeDir), {
        recursive: true,
      });
    });
  });

  describe('timestamp handling', () => {
    it('should replace colons and dots in timestamp', () => {
      const timestampWithSpecialChars = '2023-09-06T10:30:45.123Z';
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue(timestampWithSpecialChars);

      const expectedTimestamp = '2023-09-06T10-30-45-123Z';

      return Heapdump.writeSnapshot().then((result) => {
        expect(result).toContain(expectedTimestamp);
        // Check that the timestamp part (not the file extension) doesn't contain colons
        expect(result).not.toContain(':');
        // Check that the timestamp was properly converted (contains the expected format)
        expect(result).toContain('T10-30-45-123Z');
        // Ensure file ends with .heapsnapshot (this should contain a dot)
        expect(result.endsWith('.heapsnapshot')).toBe(true);
      });
    });
  });

  describe('path construction', () => {
    it('should construct correct path with process.cwd()', async () => {
      const mockCwd = '/mock/current/working/directory';
      jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);

      await Heapdump.writeSnapshot('test');

      const expectedDir = path.resolve(mockCwd, 'heapdumps');
      expect(mockedFs.mkdir).toHaveBeenCalledWith(expectedDir, {
        recursive: true,
      });
    });

    it('should handle special characters in labels', async () => {
      const specialLabel = 'test-with-special@chars#';
      const result = await Heapdump.writeSnapshot(specialLabel);

      expect(result).toContain(specialLabel);
      expect(mockedV8.writeHeapSnapshot).toHaveBeenCalledWith(
        expect.stringContaining(specialLabel),
      );
    });
  });

  describe('getSnapshotSize', () => {
    it('should return file size correctly', async () => {
      const mockStats = { size: 1024 * 1024 }; // 1MB
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockedFs.stat.mockResolvedValue(mockStats as any);

      const size = await Heapdump.getSnapshotSize(
        '/path/to/snapshot.heapsnapshot',
      );

      expect(size).toBe(1024 * 1024);
      expect(mockedFs.stat).toHaveBeenCalledWith(
        '/path/to/snapshot.heapsnapshot',
      );
    });

    it('should handle stat errors', async () => {
      const statError = new Error('File not found');
      mockedFs.stat.mockRejectedValue(statError);

      await expect(
        Heapdump.getSnapshotSize('/nonexistent.heapsnapshot'),
      ).rejects.toThrow('Failed to get snapshot size: File not found');
    });
  });

  describe('listSnapshots', () => {
    it('should list heapsnapshot files', async () => {
      const mockFiles = [
        'snapshot-001.heapsnapshot',
        'test-002.heapsnapshot',
        'other.txt', // Should be filtered out
        'leak-003.heapsnapshot',
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockedFs.readdir.mockResolvedValue(mockFiles as any);

      const snapshots = await Heapdump.listSnapshots();

      const expectedDir = path.resolve(process.cwd(), 'heapdumps');
      expect(mockedFs.readdir).toHaveBeenCalledWith(expectedDir);

      const expectedPaths = [
        path.join(expectedDir, 'leak-003.heapsnapshot'),
        path.join(expectedDir, 'snapshot-001.heapsnapshot'),
        path.join(expectedDir, 'test-002.heapsnapshot'),
      ];
      expect(snapshots).toEqual(expectedPaths);
    });

    it('should return empty array when directory does not exist', async () => {
      const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
      enoentError.code = 'ENOENT';
      mockedFs.readdir.mockRejectedValue(enoentError);

      const snapshots = await Heapdump.listSnapshots();

      expect(snapshots).toEqual([]);
    });

    it('should handle other readdir errors', async () => {
      const readError = new Error('Permission denied');
      mockedFs.readdir.mockRejectedValue(readError);

      await expect(Heapdump.listSnapshots()).rejects.toThrow(
        'Failed to list snapshots: Permission denied',
      );
    });

    it('should work with custom directory', async () => {
      const customDir = '/custom/snapshots';
      const mockFiles = ['custom-snapshot.heapsnapshot'];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockedFs.readdir.mockResolvedValue(mockFiles as any);

      await Heapdump.listSnapshots(customDir);

      expect(mockedFs.readdir).toHaveBeenCalledWith(path.resolve(customDir));
    });
  });
});
