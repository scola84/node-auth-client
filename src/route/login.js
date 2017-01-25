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
  inputItem,
  switchItem,
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

  const passwordModel = model('/scola.auth.password')
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

    const formList = itemList()
      .inset();

    formList.root().styles({
      'padding-bottom': '1em'
    });

    loginPanel.append(formList);

    const username = inputItem()
      .name('username')
      .model(passwordModel);

    const usernameInput = username
      .input('email')
      .placeholder(string.get('scola.auth.username'));

    formList.append(username);

    const password = inputItem()
      .name('password')
      .model(passwordModel);

    password
      .input('password')
      .placeholder(string.get('scola.auth.password'));

    const submitButton = password
      .button('ion-ios-arrow-thin-right')
      .secondary();

    submitButton.icon().styles({
      'color': '#FFF',
      'cursor': 'pointer',
      'height': '1em',
      'width': '1em',
      'border-radius': '1em',
      'justify-content': 'center',
      'align-items': 'center',
      'display': 'flex'
    });

    formList.append(password);

    const persistent = switchItem()
      .name('persistent')
      .model(passwordModel);

    persistent.text(string.get('scola.auth.persistent'));
    persistent.knob();

    formList.append(persistent);

    function handleError(error) {
      loginPanel.lock(false);
      formList.comment(error.toString(string));
      formList.comment().style('color', 'red');
    }

    function handleInsert(result) {
      loginPanel.lock(false);
      formList.comment(false);

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
          formList.comment(false);

          formList.comment(error.toString(string, 'scola.auth.'));
          formList.comment().style('color', 'red');

          return;
        }

        passwordModel.insert();
      });
    }

    function handleDestroy() {
      passwordModel.removeListener('error', handleError);
      passwordModel.removeListener('insert', handleInsert);

      loginPanel.root().on('destroy', null);
      loginPanel.root().on('submit', null);

      formList.destroy();
    }

    function construct() {
      passwordModel.on('error', handleError);
      passwordModel.on('insert', handleInsert);

      loginPanel.root().on('destroy', handleDestroy);
      loginPanel.root().on('submit', handleSubmit);

      route.element(loginPanel);

      usernameInput.input().node().focus();
    }

    construct();
  }

  client.router().render(
    'login@scola.auth',
    render
  );
}
