export function setupTimer(): void {
  setInterval(() => {
    Buffer.alloc(5 * 1024 * 1024); // 5MB
    console.log('Interval with 5MB buffer running');
  }, 1000);
}

setInterval(setupTimer, 2000);
