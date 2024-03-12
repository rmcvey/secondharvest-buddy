export default class Component extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    sheet.replaceSync(styles);
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;
    wrapper.addEventListener('click', (e) => {
      const { id } = e.target;
      if (id === 'left') {
        this.dispatchEvent(new CustomEvent('prev-page'));
      } else if (id === 'right') {
        this.dispatchEvent(new CustomEvent('next-page'));
      }
    });
    shadow.appendChild(wrapper);
  }
  on(eventName, selector, callback) {
    return (e) => {
      if (e.target.matches(selector)) {
        callback(e);
      }
    }
  }
  render(html, styles) {

  }
}