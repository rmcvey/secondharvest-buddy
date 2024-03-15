export default class Storage {
  static get(key, defaultValue) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const res = JSON.parse(localStorage.getItem(key));
        if (res.ttl && Date.now() > res.ttl) {
          Storage.del(key);
          return defaultValue;
        }
        return res.data;
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  }
  static del(key) {
    localStorage.removeItem(key);
  }
  static set(key, value, ttlSeconds) {
    const datum = {
      data: value,
    };
    if (ttlSeconds) {
      const expires = ttlSeconds * 1000;
      datum.ttl = Date.now() + expires;
    }
    localStorage.setItem(key, JSON.stringify(datum));
  }
}