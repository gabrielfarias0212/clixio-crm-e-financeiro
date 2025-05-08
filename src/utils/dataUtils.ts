
/**
 * Utility functions for data processing and performance optimization
 */

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Process data in batches to avoid blocking the main thread
 */
export async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => R,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  // Process data in chunks to avoid blocking the main thread
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Use setTimeout and Promise to yield to the main thread between batches
    await new Promise<void>(resolve => {
      setTimeout(() => {
        batch.forEach(item => {
          results.push(processFn(item));
        });
        resolve();
      }, 0);
    });
  }
  
  return results;
}

/**
 * Simple cache implementation for expensive calculations
 */
export function createCache<K extends string | number, V>(maxSize: number = 100) {
  const cache = new Map<K, { value: V, timestamp: number }>();
  
  return {
    get(key: K): V | undefined {
      const item = cache.get(key);
      return item?.value;
    },
    
    set(key: K, value: V): void {
      // If cache is full, remove oldest item
      if (cache.size >= maxSize) {
        let oldestKey: K | null = null;
        let oldestTime = Infinity;
        
        cache.forEach((item, k) => {
          if (item.timestamp < oldestTime) {
            oldestTime = item.timestamp;
            oldestKey = k;
          }
        });
        
        if (oldestKey !== null) {
          cache.delete(oldestKey);
        }
      }
      
      cache.set(key, { value, timestamp: Date.now() });
    },
    
    has(key: K): boolean {
      return cache.has(key);
    },
    
    clear(): void {
      cache.clear();
    }
  };
}
