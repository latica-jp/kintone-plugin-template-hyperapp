// jQuery, hyperapp は webpack がロード
import Config from './components/Config';

const PLUGIN_ID = kintone.$PLUGIN_ID;

const config = kintone.plugin.app.getConfig(PLUGIN_ID);

const getSettingsUrl = () => {
  return '/k/admin/app/flow?app=' + kintone.app.getId();
};

const setConfig = state => {
  kintone.plugin.app.setConfig({ message: state.message }, () => {
    alert('Please update the app!');
    window.location.href = getSettingsUrl();
  });
};

const state = {
  message: config.message,
};

const actions = {
  messageChanged: event => ({ message: event.target.value }),
  submit: () => state => setConfig(state),
};

hyperapp.app(
  state,
  actions,
  Config,
  document.getElementById('kintone-plugin-config')
);
