import {
  passwordValidator
} from '@scola/auth-common';

import {
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function authLoginRoute(client) {
  const string = client.i18n().string();

  const tokenModel = client
    .auth()
    .model();

  const passwordModel = model('/scola.auth.password', true)
    .connection(tokenModel.connection());

  function render(route) {
    const loginPanel = panel();

    loginPanel
      .root()
      .classed('login', true);

    loginPanel
      .body()
      .styles({
        'padding': 0
      })
      .append('div')
      .classed('scola identity', true)
      .styles({
        'height': '17em',
        'width': '100%'
      });

    const form = loginPanel
      .append(itemList())
      .inset();

    form.root().styles({
      'padding-bottom': '1em'
    });

    const username = form
      .append(listItem());

    const usernameInput = username
      .input('email')
      .name('username')
      .model(passwordModel)
      .placeholder(string.get('scola.auth.username'))
      .tabindex(1);

    const password = form
      .append(listItem());

    password
      .input('password')
      .name('password')
      .model(passwordModel)
      .placeholder(string.get('scola.auth.password'))
      .tabindex(2);

    const submitButton = password
      .button('ion-ios-arrow-thin-right')
      .secondary()
      .tabindex(4);

    submitButton.icon().styles({
      'background': '#007AFF',
      'border-radius': '1em',
      'color': '#FFF',
      'cursor': 'pointer',
      'height': '1em',
      'width': '1em'
    });

    const persistent = form
      .append(listItem());

    persistent
      .text(string.get('scola.auth.persistent'));

    persistent
      .switch()
      .name('persistent')
      .model(passwordModel)
      .tabindex(3);

    function handleError(error, prefix) {
      popAlert()
        .text(error.toString(string, prefix))
        .ok(string.format('scola.auth.ok'), () => {
          usernameInput.input().node().focus();
        });
    }

    function handleInsert(result) {
      if (passwordModel.get('persistent') === true) {
        tokenModel.storage(localStorage);
      } else {
        tokenModel.storage(sessionStorage);
      }

      const user = client
        .auth()
        .user(result.user);

      tokenModel
        .set('auth', true)
        .set('user', user.toObject())
        .save();

      client.user(user);
      passwordModel.flush();

      route
        .target()
        .destroy();

      route
        .target()
        .router()
        .popState();
    }

    function handleSubmit() {
      passwordValidator.validate(passwordModel.local(), (error) => {
        if (error) {
          handleError(error, 'scola.auth.');
          return;
        }

        passwordModel.insert();
      });
    }

    function handleDestroy() {
      passwordModel.removeListener('error', handleError);
      passwordModel.removeListener('insert', handleInsert);
      loginPanel.root().on('submit.scola-auth-client', null);

      form.destroy();
      loginPanel.destroy();
    }

    passwordModel.on('error', handleError);
    passwordModel.on('insert', handleInsert);
    loginPanel.root().on('submit.scola-auth-client', handleSubmit);

    route.element(loginPanel, handleDestroy);
    usernameInput.input().node().focus();
  }

  client.router().render(
    'login@scola.auth',
    render
  ).default();
}
