import path from 'path';
import { promises as fs } from 'fs';
import { writeHeapSnapshot } from 'v8';

export interface GlobalWithGC {
  gc?: () => void;
}

// Add to the end of your current file
type AutoSnapOptions = {
  label?: string;
  outputDir?: string;
  intervalMs?: number; // default 5000ms
  immediate?: boolean; // default true: take snapshot immediately on first run
  beforeGc?: boolean; // default false
  signal?: AbortSignal; // optional
  onAfterSnapshot?: (file: string, index: number) => void | Promise<void>;
};

export class Heapdump {
  private static readonly HEAPDUMPS_DIR = 'heapdumps';

  /**
   * Write a heap snapshot with the current timestamp
   * @param label label to distinguish snapshot (default is 'snapshot')
   * @param outputDir custom output directory (optional)
   * @returns path to the snapshot file
   */
  static async writeSnapshot(
    label = 'snapshot',
    outputDir?: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = outputDir
      ? path.resolve(outputDir)
      : path.resolve(process.cwd(), this.HEAPDUMPS_DIR);

    // Use async mkdir for better performance
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${label}-${timestamp}.heapsnapshot`);

    try {
      // writeHeapSnapshot is synchronous but we wrap it for consistent API
      writeHeapSnapshot(filePath);
      console.log(`Heap snapshot saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to write heap snapshot: ${errorMessage}`);
    }
  }

  /**
   * Get the size of a heap snapshot file
   * @param filePath path to the snapshot file
   * @returns file size in bytes
   */
  static async getSnapshotSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to get snapshot size: ${errorMessage}`);
    }
  }

  /**
   * List all heap snapshots in the default directory
   * @param dir custom directory to search (optional)
   * @returns array of snapshot file paths
   */
  static async listSnapshots(dir?: string): Promise<string[]> {
    const searchDir = dir
      ? path.resolve(dir)
      : path.resolve(process.cwd(), this.HEAPDUMPS_DIR);

    try {
      const files = await fs.readdir(searchDir);
      return files
        .filter((file) => file.endsWith('.heapsnapshot'))
        .map((file) => path.join(searchDir, file))
        .sort(); // Sort by filename (which includes timestamp)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []; // Directory doesn't exist, return empty array
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to list snapshots: ${errorMessage}`);
    }
  }

  /**
   * Take heap snapshots continuously at intervals. Returns a controller to stop.
   *
   * Example:
   *   const ctl = Heapdump.startAutoSnapshot({ label: 'leak', intervalMs: 3000, beforeGc: true });
   *   // ... run for 15s
   *   const files = await ctl.stop();
   */
  static startAutoSnapshot(options: AutoSnapOptions = {}) {
    const {
      label = 'snapshot',
      outputDir,
      intervalMs = 5000,
      immediate = true,
      beforeGc = false,
      signal,
      onAfterSnapshot,
    } = options;

    let stopped = false;
    let seq = 0;
    let timer: NodeJS.Timeout | null = null;
    const files: string[] = [];
    // ensure snapshots don't overlap
    let inFlight: Promise<void> = Promise.resolve();

    const snapOnce = async () => {
      if (stopped) return;
      // chain to inFlight to serialize snapshots
      inFlight = inFlight.then(async () => {
        try {
          if (beforeGc && typeof (global as GlobalWithGC).gc === 'function')
            (global as GlobalWithGC).gc?.();
          const file = await Heapdump.writeSnapshot(
            `${label}-${String(seq).padStart(4, '0')}`,
            outputDir,
          );
          files.push(file);
          if (onAfterSnapshot) await onAfterSnapshot(file, seq);
          seq += 1;
        } catch (e) {
          console.error('[Heapdump] snapshot failed:', e);
        }
      });
      await inFlight;
    };

    if (immediate) void snapOnce();
    timer = setInterval(() => {
      void snapOnce();
    }, intervalMs);

    const stop = async (): Promise<string[]> => {
      if (stopped) return files;
      stopped = true;
      if (timer) clearInterval(timer);
      await inFlight; // wait for the last snapshot (if any) to complete
      return [...files];
    };

    if (signal) {
      if (signal.aborted) void stop();
      else signal.addEventListener('abort', () => void stop(), { once: true });
    }

    return {
      stop,
      get files() {
        return [...files];
      },
    };
  }

  /**
   * Take N snapshots, spaced intervalMs apart, then return the list of files (useful for Comparison).
   *
   * Example:
   *   const files = await Heapdump.snapEvery(2, { label: 'leak', intervalMs: 5000, beforeGc: true });
   */
  static async snapEvery(
    times = 2,
    options: Omit<
      AutoSnapOptions,
      'signal' | 'immediate' | 'onAfterSnapshot'
    > = {},
  ): Promise<string[]> {
    const {
      label = 'snapshot',
      outputDir,
      intervalMs = 5000,
      beforeGc = false,
    } = options;
    const files: string[] = [];

    for (let i = 0; i < times; i++) {
      if (beforeGc && typeof (global as GlobalWithGC).gc === 'function')
        (global as GlobalWithGC).gc?.();
      const file = await Heapdump.writeSnapshot(
        `${label}-${String(i).padStart(4, '0')}`,
        outputDir,
      );
      files.push(file);
      if (i < times - 1) {
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }
    return files;
  }
}
