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

export default function authLoginRoute(router, connection, auth, i18n) {
  const string = i18n.string();

  const passwordCache = mapCache('scola.auth.password');
  const tokenCache = storageCache('scola.auth.token')
    .storage(localStorage);

  const passwordModel = model('/scola.auth.password')
    .connection(connection)
    .cache(passwordCache);

  const tokenModel = model('/scola.auth.token')
    .connection(connection)
    .cache(tokenCache);

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
      .type('email')
      .name('username')
      .placeholder(string.get('scola.auth.username'))
      .model(passwordModel);

    formList.append(username);

    const password = inputItem()
      .type('password')
      .name('password')
      .placeholder(string.get('scola.auth.password'))
      .model(passwordModel);

    password.secondary().button('ion-ios-arrow-thin-right', '2em', 'submit');

    password.secondary().button().select(':first-child').styles({
      'background': '#007AFF',
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
      .text(string.get('scola.auth.persistent'))
      .model(passwordModel);

    formList.append(persistent);

    function handleSubmit() {
      loginPanel.lock(true);

      passwordValidator.validate(passwordModel.local(), (error) => {
        if (error) {
          loginPanel.lock(false);
          formList.comment(false);

          formList.comment(error.toString(string, null, 'scola.auth.'));
          formList.comment().style('color', 'red');

          return;
        }

        passwordModel.insert((insertError, result) => {
          loginPanel.lock(false);
          formList.comment(false);

          if (insertError) {
            formList.comment(insertError.toString(string, null, 'scola.auth.'));
            formList.comment().style('color', 'red');

            return;
          }

          if (passwordModel.get('persistent') === true) {
            tokenCache.storage(localStorage);
          } else {
            tokenCache.storage(sessionStorage);
          }

          tokenModel
            .set('token', result.token)
            .save(() => {
              const user = auth
                .user(result.user)
                .token(result.token);

              passwordModel
                .flush()
                .cache()
                .flush(true, () => {
                  route.target().destroy();
                  routeIn(router, tokenModel, user);
                });
            });
        });
      });
    }

    function handleDestroy() {
      loginPanel.root().on('destroy', null);
      loginPanel.root().on('submit', null);

      formList.destroy();
    }

    function construct() {
      loginPanel.root().on('destroy', handleDestroy);
      loginPanel.root().on('submit', handleSubmit);

      route.element(loginPanel);
    }

    construct();
  }

  router.render(
    'login@scola.auth',
    render
  );
}
