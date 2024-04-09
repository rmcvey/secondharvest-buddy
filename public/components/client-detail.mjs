import {
  coffeeIcon,
  foodIcon,
  gasIcon,
  helpIcon,
  phoneIcon,
} from "../lib/images.mjs";
import Component from '../lib/component.mjs';
import { html } from '../lib/tag/htl.mjs'

const MAP_BASE = 'https://www.google.com/maps/search';
const translateLink = 'https://translate.google.com';
const languages = {
  spanish: 'es',
  vietnamese: 'vi',
  english: 'en',
  chinese: 'zh-CN',
}

const translateParams = new URLSearchParams({
  hl: 'en',
  sl: 'en',
  text: 'Food bank',
  op: 'translate',
});

function guessLang(lang) {
  for (const [language, short] of Object.entries(languages)) {
    if (lang.toLowerCase().includes(language)) {
      return short;
    }
  }
  return 'es';
}

export default class ClientDetail extends Component {
  static tagName = 'client-detail';
  static watch = [
    'name', 'address', 'city', 'phone', 'language', 'instructions', 'index', 'total'
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
      .address {
        font-size: 1.5rem;
      }
      
      .phone {
        border: 1px solid #efefef;
        padding: 10px 15px;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        text-decoration: none;
        color: #333;
        border-radius: 3px;
        background-color: rgb(255, 255, 255);
        box-shadow: rgba(50, 50, 93, 0.25) 0 6px 12px -2px, rgba(0, 0, 0, 0.3) 0 3px 7px -3px;
        box-shadow: rgba(0, 0, 0, 0.12) 0 1px 3px, rgba(0, 0, 0, 0.24) 0 1px 2px;
      }
      
      .phone svg {
        margin-right: 5px;
        width: 20px;
        height: auto;
      }
      
      #phone-lang {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
      }
      
      .language {
        margin-left: 10px;
      }
      
      #quickhelp {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        width: 50vw;
        margin-bottom: 20px;
      }
      
      #camera-launch {
        cursor: pointer;
        margin: 0 auto;
        width: 50px;
      }
      
      h1 {
        margin-top: 0px;
        /* flex-basis: 20%; */
        align-self: flex-start;
        padding-left: 3svh;
        padding-top: 1svh;
      }

      h2 {
        margin: 5px;
        font-size: 3rem;
        flex-grow: 0;
        font-weight: 400;
        flex-basis: 20%;
      }

      sup {
        font-size: 1rem;
      }

      a {
        text-underline-offset: 5px;
      }
    `;
  }

  render({ name, address, city, phone, language, instructions = '', zip, index, total }) {
    const searchParams = new URLSearchParams({
      api: 1,
      query: `${address} ${city}, ${zip}`.trim(),
    });

    const lang = guessLang(language || 'Spanish');
    translateParams.set('tl', lang);

    if (!name || !address) {
      return html`
        <aside>
          Unable to render empty row
        </aside>
      `;
    }

    return html`
      <div id="current">
        <h1>${index + 1} <sup> / ${total}</sup></h1>
        <h2>${name}</h2>
        <a class="address" href="${MAP_BASE}/?${searchParams}">${address}</a>
        <div id="phone-lang">
          <a class="phone" href="tel:+1${phone}">${phoneIcon}${phone}</a>
          <a class="language" target="_blank" href="${translateLink}?${translateParams}">
            ${languages[lang] || "English"}
          </a>
        </div>
        <p id="instructions">${instructions.replace(/["]{2,}/g, '"')}</p>
      </div> 
    `;

    // return html`${res}`;
  }
}

customElements.define(ClientDetail.tagName, ClientDetail);
