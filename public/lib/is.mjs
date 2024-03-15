export const isString = (s) => typeof s === 'string';
export const isObject = (o) => Object(o) === o;
export const isArray = (a) => Array.isArray(a);
export const isFunc = (f) => typeof f === 'function'
export const isDefined = (componentName) => customElements.get(componentName)
export const isEmpty = (u) => {
  if (isObject(u)) {
    return Object.keys(u).length === 0;
  }
  if (isArray(u) || isString(u)) {
    return u.length === 0;
  }
  return !u;
}