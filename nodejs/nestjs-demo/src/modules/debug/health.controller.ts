import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReadinessService } from './readiness.service';

@Controller('health')
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}
  @Get('ready')
  ready(@Res() res: Response) {
    if (this.readiness.isReady()) return res.status(200).send('ok');
    return res.status(503).send('draining');
  }
}
