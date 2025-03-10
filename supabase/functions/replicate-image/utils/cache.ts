
// Cache for recent results to reduce API calls
const resultCache = new Map();
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

// Check if cache entry is valid
export function isCacheValid(cacheKey: string): boolean {
  if (!resultCache.has(cacheKey)) return false;
  const entry = resultCache.get(cacheKey);
  return (Date.now() - entry.timestamp) < CACHE_EXPIRY;
}

// Get cached result
export function getCachedResult(cacheKey: string): any {
  return resultCache.get(cacheKey);
}

// Store result in cache
export function cacheResult(cacheKey: string, output: any): void {
  resultCache.set(cacheKey, {
    output,
    timestamp: Date.now()
  });
}
