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

  const actionModel = model('scola.auth.action');

  const persistentStorage = client.storage() ||
    localStorage;

  const temporaryStorage = sessionStorage;

  return (route) => {
    const loginPanel = panel()
      .model(actionModel);

    loginPanel
      .root()
      .attr('action', '/login')
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

    const passwordInput = password
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
          usernameInput.focus();
        });

      pop.ok().focus();
    }

    function handleInsert(result) {
      submitButton.class('ion-ios-arrow-thin-right');

      if (pop !== null) {
        pop.destroy();
      }

      if (passwordModel.get('persistent') === true) {
        tokenCache.storage(persistentStorage);
      } else {
        tokenCache.storage(temporaryStorage);
      }

      const user = client
        .auth()
        .user(result.user);

      tokenModel
        .set('user', user.toObject());

      client
        .user(user)
        .state('auth', AUTH_VALID);

      loginPanel
        .root()
        .attr('action', null);

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

    function handleCaps() {
      if (event.detail === false) {
        form.comment(false);
        return;
      }

      form
        .comment(string.format('scola.auth.caps'))
        .comment()
        .style('color', '#000');
    }

    function handleDestroy() {
      client.removeListener('open', handleOpen);

      passwordModel.removeListener('error', handleError);
      passwordModel.removeListener('insert', handleInsert);
      passwordModel.clear();

      actionModel.removeListener('set', handleSubmit);

      passwordInput.input().on('caps.scola-auth', null);

      form.destroy();
      loginPanel.destroy();
    }

    client.on('open', handleOpen);

    passwordModel.on('error', handleError);
    passwordModel.on('insert', handleInsert);

    actionModel.on('set', handleSubmit);

    passwordInput.input().on('caps.scola-auth', handleCaps);

    route.element(loginPanel, handleDestroy);
  };
}
