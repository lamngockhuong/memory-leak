import { Injectable } from '@nestjs/common';

@Injectable()
export class ReadinessService {
  private ready = true;

  isReady() {
    return this.ready;
  }

  setReady(v: boolean) {
    this.ready = v;
  }
}
