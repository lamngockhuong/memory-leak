import { EventEmitter } from 'events';

const emitter = new EventEmitter();

function createListener(): () => void {
  const bigData = new Array(1e6).fill('event');
  return () => console.log('Big data length:', bigData.length);
}

setInterval(() => {
  emitter.on('data', createListener());
}, 1000);
