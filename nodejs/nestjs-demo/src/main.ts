import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalWithGC, Heapdump } from './utils/heapdump';
import { ReadinessService } from './modules/debug/readiness.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // register handler to capture SIGUSR2 (enabled via env var)
  if (process.env.HEAPDUMP_ENABLED === '1') {
    const readiness = app.get(ReadinessService);

    let taking = false;
    process.on('SIGUSR2', () => {
      console.log('[heapdump] SIGUSR2 received', process.pid);

      void (async () => {
        if (taking) return;
        taking = true;
        try {
          // temporarily "drain" pod from LB to avoid affecting traffic

          readiness.setReady(false);
          if (typeof (global as GlobalWithGC).gc === 'function') {
            // if running with --expose-gc
            (global as GlobalWithGC).gc?.();
          }
          await Heapdump.writeSnapshot('on-sigusr2');
          // (optional) log, upload S3/GCS here
        } catch (e) {
          console.error('[heapdump] failed:', e);
        } finally {
          readiness.setReady(true);
          taking = false;
        }
      })();
    });
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log('[PID]', process.pid);
}

void bootstrap();
