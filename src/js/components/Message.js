import { h } from 'hyperapp';

const Message = state => (
  <div>
    <h3 class="plugin-space-heading">Hello, kintone plugin!</h3>
    <p class="plugin-space-message">{state.message}</p>
  </div>
);

export default Message;
