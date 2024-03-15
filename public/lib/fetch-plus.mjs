const MINIMUM_TIMEOUT = 100;
const DEFAULT_TIMEOUT = 20000;
const cache = new Map();

/**
 * fetchPlus adds request timeouts and client side caching to native fetch
 * @param {String|Object} url standard fetch url param
 * @param {Object} options normal + clientCache: { key, ttl } option
 * @param {Number} timeout seconds
 */
export default function fetchPlus(
  url,
  options,
  timeout = DEFAULT_TIMEOUT,
) {
  const { key = false, ttl = false } = options.clientCache || {};

  delete options.clientCache;

  const ignoreResponse = !!options.ignoreResponse;
  delete options.ignoreResponse;

  const usingCache = key && ttl;
  if (usingCache && cache.has(key)) {
    return Promise.resolve(cache.get(key));
  }

  const controller = new AbortController();
  options.signal = controller.signal;

  const stopTryingToMakeFetchHappen = () => controller.abort();

  setTimeout(stopTryingToMakeFetchHappen, Math.max(MINIMUM_TIMEOUT, timeout));

  return fetch(url, options)
    .then(async (res) => {
      if (!res.ok) {
        throw Error(`${res.status}: ${res.statusText}`);
      }

      try {
        const data = await res.json();
        if (usingCache) {
          cache.set(key, data, 1000 * 60 * ttl);
        }
        return data;
      } catch (e) {
        if (ignoreResponse) {
          return {};
        }
        throw Error(`${res.status}: ${e.message}`);
      }
    })
    .catch((err) => {
      let errorMessage = err.message;
      if (err instanceof DOMException) {
        errorMessage = 'Request timeout';
      }
      throw new Error(`${errorMessage} (${url})`);
    });
}
