import {
  passwordValidator
} from '@scola/auth-common';

import {
  mapCache,
  storageCache
} from '@scola/cache';

import {
  panel,
  itemList,
  listItem,
  model
} from '@scola/d3';

import routeIn from '../helper/route-in';

export default function authLoginRoute(client) {
  const string = client.i18n().string();

  const passwordCache = mapCache('scola.auth.password');
  const tokenCache = storageCache('scola.auth.token')
    .storage(localStorage);

  const tokenModel = client
    .auth()
    .model()
    .cache(tokenCache);

  const passwordModel = model('/scola.auth.password', true)
    .connection(tokenModel.connection())
    .cache(passwordCache);

  function render(route) {
    const loginPanel = panel();

    loginPanel.root()
      .classed('login', true);

    loginPanel.body()
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

    function handleError(error) {
      loginPanel.lock(false);
      form.comment(error.toString(string));
      form.comment().style('color', 'red');
    }

    function handleInsert(result) {
      loginPanel.lock(false);
      form.comment(false);

      if (passwordModel.get('persistent') === true) {
        tokenCache.storage(localStorage);
      } else {
        tokenCache.storage(sessionStorage);
      }

      tokenModel
        .set('token', result.token)
        .save(() => {
          const user = client
            .auth()
            .user(result.user)
            .token(result.token);

          client.user(user);

          passwordModel
            .flush()
            .cache()
            .flush(true, () => {
              route.target().destroy();
              routeIn(client);
            });
        });
    }

    function handleSubmit() {
      loginPanel.lock(true);

      passwordValidator.validate(passwordModel.local(), (error) => {
        if (error) {
          loginPanel.lock(false);
          form.comment(false);

          form.comment(error.toString(string, 'scola.auth.'));
          form.comment().style('color', 'red');

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
