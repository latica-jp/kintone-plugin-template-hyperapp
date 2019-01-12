// jQuery, hyperapp は webpack がロード
import Message from './components/Message';

const PLUGIN_ID = kintone.$PLUGIN_ID;
const config = kintone.plugin.app.getConfig(PLUGIN_ID);

const state = { message: config.message };

kintone.events.on('app.record.index.show', () => {
  const spaceElement = kintone.app.getHeaderSpaceElement();
  hyperapp.app(state, {}, Message, spaceElement);
});
