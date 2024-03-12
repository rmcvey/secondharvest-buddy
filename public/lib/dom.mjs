export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function on(elem, eventName, handler) {
  let el = elem;
  if (typeof elem === 'string') {
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
      if (evt.target.matches(child) || c.contains(evt.target)) {
        return handler(evt);
      }
      return false;
    });
  }
}

export function link(elem, href) {
  on(elem, 'click', (e) => {
    window.open(href);
    e.preventDefault();
  })
}