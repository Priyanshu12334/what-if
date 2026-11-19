const cache = new Map();

export const getCachedData = (key) => {
  const entry = cache.get(key);
  return entry?.status === 'ready' ? entry.data : undefined;
};

export const fetchCachedData = (key, fetcher) => {
  const entry = cache.get(key);
  if (entry?.status === 'ready') return Promise.resolve(entry.data);
  if (entry?.status === 'pending') return entry.promise;

  const promise = fetcher().then((data) => {
    cache.set(key, { status: 'ready', data });
    return data;
  }).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { status: 'pending', promise });
  return promise;
};

export const setCachedData = (key, data) => cache.set(key, { status: 'ready', data });

export const clearCachedData = (key) => cache.delete(key);
