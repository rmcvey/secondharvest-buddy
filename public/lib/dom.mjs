export const $ = (sel, root = document) =>
  (root ?? document).querySelector(sel);
export const $$ = (sel, root = document) =>
  Array.from((root ?? document).querySelectorAll(sel));

export function on(elem, eventName, handler) {
  let el = elem;
  if (typeof elem === "string") {
    el = $(elem);
  }
  if (el) {
    el.addEventListener(eventName, handler, false);
  }
}

export function delegate(event = "click", parent, child, handler) {
  const p = $(parent);
  if (p) {
    on(p, event, (evt) => {
      const c = $(child);
      if (isElemOrChild(evt.target, child)) {
        return handler(evt);
      }
      return false;
    });
  }
}

export function isElemOrChild(target, selector, parent) {
  return target.matches(selector) || $(selector, parent).contains(target);
}

export function css(strings, ...keys) {
  const evaluated = strings.reduce((acc, string, i) => {
    acc.push(string)
    if (keys[i]) acc.push(keys[i].toString())

    return acc
  }, []);

  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(evaluated);

  return stylesheet;
}

export function link(elem, href) {
  on(elem, "click", (e) => {
    window.open(href);
    e.preventDefault();
  });
}

export const inline = (fn) => `(${fn})()`;