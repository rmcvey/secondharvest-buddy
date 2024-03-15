import { chevronLeft, chevronRight } from "../lib/images.mjs";
import { isElemOrChild } from '../lib/dom.mjs';

const template = /* html */`
  <footer class="hide">
    <span id="left">${chevronLeft}</span>
    <span id="right">${chevronRight}</span>
  </footer>
`;

const sheet = new CSSStyleSheet();
const styles = /* css */`
  :host {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
  }
  :host footer {
    box-sizing: border-box;
    height: 10vh;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f8f8;
  }
  :host span {
    cursor: pointer;
    margin: 0 20px;
    width: 50px;
  }
  :host([hidden]) {
    display: none;
  }
`;

export default class FooterNav extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    sheet.replaceSync(styles);
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    wrapper.innerHTML = template;

    const left = wrapper.querySelector('#left');
    const right = wrapper.querySelector('#right');

    wrapper.addEventListener('click', (e) => {
      const { id } = e.target;
      if (id === 'left' || left.contains(e.target)) {
        this.dispatchEvent(new CustomEvent('prev-page'));
      } else if (id === 'right' || right.contains(e.target)) {
        this.dispatchEvent(new CustomEvent('next-page'));
      }
    });

    shadow.appendChild(wrapper);
  }
}

customElements.define('footer-nav', FooterNav);