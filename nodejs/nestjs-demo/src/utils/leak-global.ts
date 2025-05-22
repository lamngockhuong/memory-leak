export {};

declare global {
  interface Global {
    leakedArray: Array<string[]>;
  }
}

global.leakedArray = [];

export function leakMemory(): void {
  const largeArray = new Array(1e6).fill('leak') as string[];
  (global.leakedArray as Array<string[]>).push(largeArray);
  console.log('Leaked 1MB+');
}
