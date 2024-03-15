import { isObject, isArray } from "./is.mjs";

export default function classNames(...classes) {
  return classes.map((className) => {
    const type = typeof className;
    switch (type) {
      case 'string':
        return className;
      case 'object':
        if (isArray(className)) {
          return className;
        }

        if (isObject(className)) {
          return Object.entries(className).filter(([, truthy]) => {
            return !!truthy;
          }).map(([cn]) => cn);
        }
        break;
      default:
        break;
    }

    return className;
  }).flat().join(' ');
}