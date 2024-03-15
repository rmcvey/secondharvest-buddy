import { isArray } from '../lib/is.mjs';
import { css } from '../lib/dom.mjs';

const hyphenToCamel = (s) => s.split('-')
  .map((a) => a[0].toUpperCase() + a.slice(1))
  .join('');

export default function defineComponent(name, {
  styles,
  html,
  openShadow = true,
}, ParentClass = HTMLElement) {
  const className = hyphenToCamel(name);
  const out = {
    [className]: class extends ParentClass {
      #eventRegistry = {};
      constructor() {
        super();
      }

      static get observedAttributes() {
        return Object.keys(props);
      }

      connectedCallback() {
        const mode = openShadow ? 'open' : 'closed';
        const shadow = this.attachShadow({ mode });
        shadow.adoptedStyleSheets = [css`${style}`];

        const wrapper = shadow.getRootNode(); // document.createElement('div');
        wrapper.innerHTML = this.render();
      }

      on(event, selector, fn) {
        if (!isArray(this.#eventRegistry[event])) {
          this.#eventRegistry[event] = [];
        }

        if (!this.#eventRegistry[event].includes(fn)) {
          return this.#eventRegistry[event].push(fn);
        }
      }

      emit(eventName, detail) {
        this.dispatchEvent(new CustomEvent(eventName, { detail }));
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (this.shadowRoot) {
          const html = this.render();
          this.shadowRoot.adoptedStyleSheets = [css`${style}`];
          this.shadowRoot.getRootNode().innerHTML = html;
        }
      }
    }
  };

  customElements.define(name, out[className])

  return out[className];
}