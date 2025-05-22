const cache: Record<string, string[]> = {};

function getData(key: string): string[] {
  if (!cache[key]) {
    cache[key] = new Array(1e6).fill(key) as string[];
  }
  return cache[key];
}

let counter = 0;
setInterval(() => {
  getData(`key-${counter++}`);
}, 1000);
