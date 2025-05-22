import { Injectable } from '@nestjs/common';
import { leakMemory } from './utils/leak-global';
import { Heapdump } from './utils/heapdump';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  globalVariableLeak() {
    setInterval(leakMemory, 1000);

    Heapdump.writeSnapshot('global-leak')
      .then((file) => console.log('Snapshot written:', file))
      .catch((err) => console.error('Snapshot error:', err));

    return 'Global variable leak';
  }
}
