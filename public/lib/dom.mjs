export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function delegate(event = "click", parent, child, handler) {
  const p = $(parent);
  if (p) {
    p.addEventListener(event, (evt) => {
      if (evt.target.id === child.startsWith("#") ? child.slice(1) : child) {
        return handler(evt);
      }
      return true;
    });
  }
}