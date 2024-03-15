import fetchPlus from './fetch-plus.mjs';
import { css } from '../lib/dom.mjs';
import { isEmpty, isFunc, isObject } from '../lib/is.mjs';

const saferParse = (v) => {
  let value = v;
  if (/^([\d]+)$/.test(value)) {
    value = parseInt(value, 10);
  } else if (/^([\d.]+)$/.test(value)) {
    value = parseFloat(value);
  } else if (['{', '['].includes(value[0])) {
    value = JSON.parse(value);
  }
  return value;
}

export default class Component extends HTMLElement {
  #props = {};
  state = {};
  #prepareProps() {
    for (const attr of this.attributes) {
      this.#props[attr.name] = saferParse(attr.value);
    }
  }

  #setStyles(styles) {

  }

  styles() {
    return css``;
  }

  setState(nextState, postUpdate) {
    if (isFunc(nextState)) {
      this.state = nextState(this.state);
    } else if (isObject(nextState)) {
      this.state = { ...this.state, ...nextState };
    } else {
      throw new Error('Invalid state supplied');
    }

    if (isFunc(postUpdate)) {
      postUpdate();
    }

    // trigger re-render
    this.attributeChangedCallback('state', this.state, nextState);
  }

  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    // turn attributes into parsed props
    this.#prepareProps();
    console.log(this.styles)
    let styles = this.styles(this.#props);
    if (!isEmpty(styles) && typeof styles === 'string') {
      styles = css`${styles}`;
    }
    shadow.adoptedStyleSheets = [styles];

    const html = await this.render(this.#props);
    const wrapper = document.createElement('div');
    wrapper.id = "component-root";
    wrapper.replaceChildren(html);
    shadow.appendChild(wrapper);
  }

  emit(eventName) {
    this.dispatchEvent(new CustomEvent(eventName));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this.#props[name] = saferParse(newValue);
    if (this.shadowRoot) {
      let styles = this.styles(this.#props);
      if (!isEmpty(styles) && typeof styles === 'string') {
        styles = css`${styles}`;
      }
      this.shadowRoot.adoptedStyleSheets = [styles];
      const html = this.render(this.#props);
      this.shadowRoot.replaceChildren(html);
    }
  }
}

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const useState = memoize((initalValue) => {
  let value = initalValue;

  return [
    value,
    (nextValue) => {
      value = nextValue;
    }
  ]
});


export const register = (cls) => {
  if (!customElements.get(cls)) {
    customElements.define(cls.tagName, cls);
  }
}
