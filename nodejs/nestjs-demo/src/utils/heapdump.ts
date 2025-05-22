import v8Profiler from 'v8-profiler-next';
import path from 'path';
import fs from 'fs';

export class Heapdump {
  /**
   * Write a heap snapshot with the current timestamp
   * @param label label to distinguish snapshot (default is 'snapshot')
   * @returns path to the snapshot file
   */
  static writeSnapshot(label = 'snapshot'): Promise<string> {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dir = path.resolve(process.cwd(), 'heapdumps');

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `${label}-${timestamp}.heapsnapshot`);

      try {
        const snapshot = v8Profiler.takeSnapshot();
        const fileStream = fs.createWriteStream(filePath);

        snapshot.export((error, result) => {
          if (error) {
            snapshot.delete();
            return reject(new Error(error.message));
          }

          fileStream.write(result);
          fileStream.end();

          snapshot.delete();
          console.log('Heap snapshot saved to', filePath);
          resolve(filePath);
        });
      } catch (error) {
        reject(
          new Error(
            error instanceof Error ? error.message : 'Unknown error occurred',
          ),
        );
      }
    });
  }
}
