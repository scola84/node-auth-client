import { passwordValidator as validator } from '@scola/auth-common';

import {
  action,
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function renderLogin(client) {
  const string = client.i18n().string();

  const tokenCache = client.auth().cache();

  const routerModel = client.router().model();
  const tokenModel = tokenCache.model();

  const passwordModel = model('/scola.auth.password', true)
    .connection(tokenModel.connection());

  const persistentStorage = client.storage() || localStorage;
  const temporaryStorage = sessionStorage;

  const actions = action();

  client
    .route()
    .default()
    .authorize((route, next) => {
      next(client.auth().password() ?
        null : route.error('500 invalid_user'));
    })
    .render('login@scola.auth', (route) => {
      const loginPanel = panel()
        .model(actions.model())
        .name('submit');

      loginPanel
        .root()
        .classed('auth login', true);

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

      const usernameItem = form
        .append(listItem());

      const usernameInput = usernameItem
        .input('email')
        .name('username')
        .model(passwordModel);

      usernameInput
        .input()
        .attrs({
          'autocomplete': 'username',
          'placeholder': string.get('scola.auth.username'),
          'tabindex': 1
        });

      const passwordItem = form
        .append(listItem());

      const passwordInput = passwordItem
        .input('password')
        .name('password')
        .model(passwordModel);

      passwordInput
        .input()
        .attrs({
          'autocomplete': 'current-password',
          'placeholder': string.get('scola.auth.password'),
          'tabindex': 2
        });

      const submitButton = passwordItem
        .button('ion-ios-arrow-thin-right')
        .circle()
        .secondary();

      submitButton
        .button()
        .attrs({
          'tabindex': 4,
          'type': 'submit'
        });

      const persistentItem = form
        .append(listItem());

      persistentItem
        .text(string.get('scola.auth.persistent'));

      const persistentSwitch = persistentItem
        .switch()
        .model(passwordModel)
        .name('persistent');

      persistentSwitch
        .knob()
        .attrs({
          'tabindex': 3
        });

      const links = loginPanel
        .body()
        .append('div')
        .classed('scola links', true)
        .styles({
          'align-items': 'center',
          'bottom': '0.5em',
          'color': '#AAA',
          'display': 'flex',
          'flex-direction': 'row',
          'justify-content': 'center',
          'line-height': '1.5em',
          'padding': '0 1em',
          'position': 'absolute',
          'width': '100%'
        });

      const resetLink = links
        .append('span')
        .remove()
        .classed('scola link reset', true)
        .styles({
          'cursor': 'pointer',
          'display': 'inline-block',
          'font-size': '0.9em',
          'margin': '0 0.5em'
        })
        .text(string.format('scola.auth.reset.link'));

      if (client.auth().reset() === true) {
        links.append(() => resetLink.node());
      }

      function handleCaps() {
        if (event.detail === false) {
          form.comment(false);
          return;
        }

        form.comment(string.format('scola.auth.caps'));
      }

      function handleError(error) {
        submitButton
          .icon()
          .classed('ion-load-d', false)
          .classed('ion-ios-arrow-thin-right', true);

        const pop = popAlert()
          .title(string.format('scola.auth.login.pop.title'))
          .text(error.toString(string))
          .ok(string.format('scola.auth.login.pop.ok'), () => {
            usernameInput.input().node().focus();
          });

        pop
          .ok()
          .button()
          .node()
          .focus();
      }

      function handleInsert(data) {
        submitButton
          .icon()
          .classed('ion-load-d', false)
          .classed('ion-ios-arrow-thin-right', true);

        if (passwordModel.get('persistent') === true) {
          tokenCache.storage(persistentStorage);
        } else {
          tokenCache.storage(temporaryStorage);
        }

        const user = client
          .auth()
          .user(data);

        tokenModel
          .set('user', user.toObject());

        client
          .user(user)
          .state('auth', 'valid');

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

      function handleOpen(value) {
        form.disabled(!value);
      }

      function handleReset() {
        routerModel.set('scola.auth', 'reset');
      }

      function handleSubmit() {
        submitButton
          .icon()
          .classed('ion-ios-arrow-thin-right', false)
          .classed('ion-load-d', true);

        validator.validate(passwordModel.local(), (error) => {
          if (!error) {
            passwordModel.insert();
            return;
          }

          handleError(error.prefix('field', 'scola.auth.'));
        });
      }

      function addListeners() {
        client.on('open', handleOpen);

        passwordModel.on('error', handleError);
        passwordModel.on('insert', handleInsert);

        passwordInput.input().on('caps.scola-auth', handleCaps);
        resetLink.on('click.scola-auth', handleReset);
      }

      function removeListeners() {
        client.removeListener('open', handleOpen);

        passwordModel.removeListener('error', handleError);
        passwordModel.removeListener('insert', handleInsert);

        passwordInput.input().on('caps.scola-auth', null);
        resetLink.on('click.scola-auth', null);
      }

      function handleDestroy() {
        removeListeners();

        route.removeListener('append', addListeners);
        route.removeListener('destroy', handleDestroy);
        route.removeListener('remove', removeListeners);

        passwordModel.clear();

        form.destroy();
        loginPanel.destroy();
      }

      actions
        .register('submit', handleSubmit);

      route
        .on('append', addListeners)
        .on('destroy', handleDestroy)
        .on('remove', removeListeners)
        .element(loginPanel);
    });
}
