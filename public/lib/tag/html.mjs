import { $$, on } from "../dom.mjs";
import { isArray, isFunc, isObject } from "../is.mjs"

const html = (strings, ...keys) => {
  const handlerMap = {};
  let count = 0;
  const evaluated = strings.reduce((acc, string, i) => {
    acc.push(string);
    if (keys[i]) {
      if (isFunc(keys[i])) {
        if (string.includes('onClick=')) {
          handlerMap[count] = keys[i];
          acc[acc.length - 1] = string.replace(/(onClick="?(.*)["\s]+)/, `" data-call-id="${count}"`);
          count++;
        }
      } else if (isArray(keys[i]) || isObject(keys[i])) {
        acc.push(JSON.stringify(keys[i]));
      } else {
        acc.push(keys[i].toString())
      }
    }

    return acc
  }, []);

  const parser = new DOMParser();
  const dom = parser.parseFromString(evaluated.join(''), 'text/html');

  $$('[data-call-id]', dom.querySelector('body')).forEach((node, i) => {
    on(node, 'click', handlerMap[i]);
  });

  return dom.querySelector('body').firstElementChild;
}

export default html;