import { passwordValidator } from '@scola/auth-common';

import {
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

import { AUTH_VALID } from '../../helper/const';

export default function render(client) {
  const string = client.i18n().string();

  const tokenCache = client
    .auth()
    .cache();

  const tokenModel = tokenCache.model();

  const passwordModel = model('/scola.auth.password', true)
    .connection(tokenModel.connection());

  return (route) => {
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

    username
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
      .circle()
      .secondary()
      .tabindex(4);

    const persistent = form
      .append(listItem());

    persistent
      .text(string.get('scola.auth.persistent'));

    persistent
      .switch()
      .name('persistent')
      .model(passwordModel)
      .tabindex(3);

    let pop = null;

    function handleError(error, prefix) {
      if (error.code !== 'invalid_state') {
        submitButton.class('ion-ios-arrow-thin-right');
      }

      if (pop !== null) {
        pop.destroy();
      }

      pop = popAlert()
        .title(string.format('scola.auth.pop.title'))
        .text(error.toString(string, prefix))
        .ok(string.format('scola.auth.pop.ok'), () => {
          pop = null;
        });
    }

    function handleInsert(result) {
      submitButton.class('ion-ios-arrow-thin-right');

      if (pop !== null) {
        pop.destroy();
      }

      if (passwordModel.get('persistent') === true) {
        tokenCache.storage(localStorage);
      } else {
        tokenCache.storage(sessionStorage);
      }

      const user = client
        .auth()
        .user(result.user);

      tokenModel
        .set('user', user.toObject());

      client
        .user(user)
        .is('auth', AUTH_VALID);

      route
        .target()
        .destroy();

      route
        .target()
        .router()
        .popState();
    }

    function handleSubmit() {
      submitButton.class('ion-load-d');

      passwordValidator.validate(passwordModel.local(), (error) => {
        if (error instanceof Error === true) {
          handleError(error, 'scola.auth.');
          return;
        }

        passwordModel.insert();
      });
    }

    function handleOpen(value) {
      form.disabled(!value);

      if (value === true) {
        form.comment(false);
        return;
      }

      form
        .comment(string.format('scola.auth.closed'))
        .comment()
        .style('color', '#000');
    }

    function handleDestroy() {
      client.removeListener('open', handleOpen);

      passwordModel.removeListener('error', handleError);
      passwordModel.removeListener('insert', handleInsert);
      passwordModel.clear();

      loginPanel.root().on('submit.scola-auth-client', null);

      form.destroy();
      loginPanel.destroy();
    }

    client.on('open', handleOpen);

    passwordModel.on('error', handleError);
    passwordModel.on('insert', handleInsert);

    loginPanel.root().on('submit.scola-auth-client', handleSubmit);

    route.element(loginPanel, handleDestroy);
  };
}
