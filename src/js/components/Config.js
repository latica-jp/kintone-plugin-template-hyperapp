import { h } from 'hyperapp';

const Config = (state, actions) => (
  <section class="settings">
    <h2 class="settings-heading">Settings for kintone-plugin-template</h2>
    <p class="kintoneplugin-desc">
      This message is displayed on the app page after the app has been updated.
    </p>
    <p class="kintoneplugin-row">
      <label for="message">
        Message:
        <input
          type="text"
          value={state.message}
          onchange={actions.messageChanged}
          class="js-text-message kintoneplugin-input-text"
        />
      </label>
    </p>
    <p class="kintoneplugin-row">
      <button class="kintoneplugin-button-normal" onclick={actions.submit}>
        Save
      </button>
    </p>
  </section>
);

export default Config;
