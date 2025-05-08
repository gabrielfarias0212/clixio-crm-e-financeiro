
// Cache for expensive calculations
export function createCache<K extends string, V>(maxSize: number) {
  const cache = new Map<K, V>();
  
  return {
    get(key: K): V | undefined {
      return cache.get(key);
    },
    set(key: K, value: V): void {
      // If the cache is full, remove the oldest entry
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      cache.set(key, value);
    },
    clear(): void {
      cache.clear();
    }
  };
}
