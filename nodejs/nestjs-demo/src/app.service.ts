import { Injectable } from '@nestjs/common';
import { leakMemory } from './utils/leak-global';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  globalVariableLeak() {
    const intervalId = setInterval(leakMemory, 1000);

    // After durationMs milliseconds, stop the leak
    setTimeout(() => {
      clearInterval(intervalId);
      console.log('Stopped leaking memory');
    }, 10000);

    return 'Global variable leak started';
  }
}
