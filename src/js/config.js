// jQuery は webpack がロード
const PLUGIN_ID = kintone.$PLUGIN_ID;

const $form = $('.js-submit-settings');
const $message = $('.js-text-message');

const getSettingsUrl = () => {
  return '/k/admin/app/flow?app=' + kintone.app.getId();
};

const config = kintone.plugin.app.getConfig(PLUGIN_ID);
if (config.message) {
  $message.val(config.message);
}
$form.on('submit', e => {
  e.preventDefault();
  kintone.plugin.app.setConfig({ message: $message.val() }, () => {
    alert('Please update the app!');
    window.location.href = getSettingsUrl();
  });
});
