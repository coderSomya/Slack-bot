const { App } = require('@slack/bolt');
const dotenv = require('dotenv');

dotenv.config()

const app = new App({
  token: process.env.TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN 
});


app.shortcut('send_message', async ({ shortcut, ack, client }) => {
  await ack();
  try {
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'send_message_view',
        title: {
          type: 'plain_text',
          text: 'Send a Message'
        },
        blocks: [
          {
            type: 'input',
            block_id: 'user_block',
            element: {
              type: 'users_select',
              action_id: 'user_select'
            },
            label: {
              type: 'plain_text',
              text: 'Select a user'
            }
          },
          {
            type: 'input',
            block_id: 'message_block',
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'message_input'
            },
            label: {
              type: 'plain_text',
              text: 'Message'
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Send'
        }
      }
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

app.view('send_message_view', async ({ ack, body, view, client }) => {
  await ack();

  const user = view.state.values.user_block.user_select.selected_user;
  const message = view.state.values.message_block.message_input.value;

  try {
    await client.chat.postMessage({
      channel: user,
      text: message
    });
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 80);
  console.log('Slack app is running!');
})();
