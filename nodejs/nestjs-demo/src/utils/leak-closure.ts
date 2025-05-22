type Leaker = () => void;

function createLeaker(): Leaker {
  const hugeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
  return () => {
    console.log('Holding buffer of size:', hugeBuffer.length);
  };
}

const leakers: Leaker[] = [];

setInterval(() => {
  leakers.push(createLeaker());
}, 1000);
