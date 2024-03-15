import classNames from '../lib/classnames.mjs';
import Component, { register } from '../lib/component.mjs';
import { html } from '../lib/tag/htl.mjs'

export default class ClientDetail extends Component {
  static tagName = 'client-detail';
  static observedAttributes = [
    'name', 'address', 'phone', 'language', 'instructions',
  ];

  styles() {
    return /* css */`
      :host {
        width: 100vw;
      }
      #current {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        height: 80svh;
      }
      
      #current p {
        padding: 2px 15px;
        font-size: 1rem;
      }
      
      #current a,
      #current a:visited {
        color: blue;
      }
      
      #current #instructions {
        flex-basis: 20%;
      }
    `;
  }

  render({ name, address, phone, language, instructions, total }) {
    const searchParams = new URLSearchParams({
      api: 1,
      query: `${address} ${city}, ${zip}`,
    });

    const res = `
      <div id="current">
        <h1>${index + 1} <sup> / ${total}</sup></h1>
        <h2>${name}</h2>
        <a class="address" href="${MAP_BASE}/?${searchParams}">${address}</a>
        <div id="phone-lang">
          <a class="phone" href="tel:+1${phone}">${phoneIcon}${phone}</a>
          <span class="language">${language || "English"}</span>
        </div>
        <p id="instructions">${instructions.replace(/["]{2,}/g, '"')}</p>
        <div id="quickhelp">
          ${gasIcon}
          ${coffeeIcon}
          ${foodIcon}
          ${helpIcon}
        </div>
        <!-- <div id="capture-container"></div> -->
      </div>
    `;

    return html`${res}`;
  }
}

customElements.define(ClientDetail.tagName, ClientDetail);
