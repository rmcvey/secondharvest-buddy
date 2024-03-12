export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function on(elem, eventName, handler) {
  let el = elem;
  if (typeof elem === 'string') {
    el = $(elem);
  }
  if (el) {
    el.addEventListener(eventName, handler);
  }
}

export function delegate(event = "click", parent, child, handler) {
  const p = $(parent);
  if (p) {
    on(p, event, (evt) => {
      if (evt.target.id === child.startsWith("#") ? child.slice(1) : child) {
        return handler(evt);
      }
      return true;
    });
  }
}

export function link(elem, href) {
  on(elem, 'click', () => {
    window.open(href);
  })
}