import classNames from '../lib/classnames.mjs';
import Component from '../lib/component.mjs';
import { html } from '../lib/tag/htl.mjs'

export default class TaskProgression extends Component {
  static tagName = 'task-progression';
  static observedAttributes = ['count', 'current'];

  styles({ count }) {
    return /* css */`
      :host {
        width: 100vw;
      }
      :host #task-progression-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      :host .task-bar {
        width: calc(95vw / ${count});
        height: 10px;
        background-color: #ccc;
      }
      :host .task-bar.active {
        background-color: #79e479;
      }
    `;
  }

  render({ count, current }) {
    const cols = new Array(count).fill(0);

    return html`
      <div id="task-progression-container">
        ${cols.map((_, i) => html.fragment`
          <div class="${classNames('task-bar', { active: i <= current })}"></div>
        `)}
      </div>
    `;
  }
}

customElements.define(TaskProgression.tagName, TaskProgression);
