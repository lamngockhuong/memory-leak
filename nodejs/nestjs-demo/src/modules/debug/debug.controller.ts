// debug.controller.ts
import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReadinessService } from './readiness.service';
import { GlobalWithGC, Heapdump } from '../../utils/heapdump';
import { AdminTokenGuard } from './admin-token.guard';

@Controller('internal/debug')
export class DebugController {
  private taking = false;
  constructor(private readonly readiness: ReadinessService) {}

  @UseGuards(AdminTokenGuard)
  @Post('heapdump')
  async take(@Res() res: Response) {
    if (this.taking) return res.status(429).send('already in progress');
    this.taking = true;
    res.status(202).send('dump started'); // respond immediately, process in background

    try {
      this.readiness.setReady(false); // temporarily drain
      if (typeof (global as GlobalWithGC).gc === 'function') {
        (global as GlobalWithGC).gc?.();
      }
      await Heapdump.writeSnapshot('manual');
      // await Heapdump.snapEvery(3, { label: 'manual', intervalMs: 10000 });
      // (optional) upload, compress, clean old files…
    } catch (e) {
      console.error('[heapdump] failed:', e);
    } finally {
      this.readiness.setReady(true);
      this.taking = false;
    }
  }
}
