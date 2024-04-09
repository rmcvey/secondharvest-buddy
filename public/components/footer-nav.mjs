import { chevronLeft, chevronRight } from "../lib/images.mjs";
import Component from "../lib/component.mjs";
import { css } from '../lib/dom.mjs';
import { html } from "../lib/tag/htl.mjs";

export default class FooterNav extends Component {
  static tagName = 'footer-nav';
  styles() {
    return /* css */css`
      :host {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 12vh;
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
  }

  render() {
    return html`
      <footer class="hide">
        <span id="left" onclick=${() => this.emit('prev-page')}>${chevronLeft}</span>
        <span id="right" onclick=${() => this.emit('next-page')}>${chevronRight}</span>
      </footer>
    `;
  }
}

customElements.define('footer-nav', FooterNav);