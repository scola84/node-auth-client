import { resetValidator as validator } from '@scola/auth-common';

import {
  action,
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function renderReset(client) {
  const string = client.i18n().string();

  const routerModel = client.router().model();
  const tokenModel = client.auth().cache().model();

  const passwordModel = model('/scola.auth.password', true);
  const resetModel = model('/scola.auth.reset', true)
    .connection(tokenModel.connection());

  const actions = action();

  client
    .route()
    .authorize((route, next) => {
      next(client.auth().reset() ?
        null : route.error('500 invalid_user'));
    })
    .render('reset@scola.auth', (route) => {
      const resetPanel = panel()
        .model(actions.model())
        .name('submit');

      resetPanel
        .root()
        .classed('auth reset', true);

      resetPanel
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

      const form = resetPanel
        .append(itemList())
        .inset();

      const username = form
        .append(listItem());

      const usernameInput = username
        .input('email')
        .name('username')
        .model(resetModel);

      usernameInput
        .input()
        .attrs({
          'autocomplete': 'username',
          'placeholder': string.get('scola.auth.username'),
          'tabindex': 1
        });

      const submitButton = username
        .button('ion-ios-arrow-thin-right')
        .circle()
        .secondary();

      submitButton
        .button()
        .attrs({
          'tabindex': 2,
          'type': 'submit'
        });

      form.comment(string.format('scola.auth.reset.comment'));

      const links = resetPanel
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

      const loginLink = links
        .append('span')
        .remove()
        .classed('scola link reset', true)
        .styles({
          'cursor': 'pointer',
          'display': 'inline-block',
          'font-size': '0.9em',
          'margin': '0 0.5em'
        })
        .text(string.format('scola.auth.login.link'));

      if (client.auth().password() === true) {
        links.append(() => loginLink.node());
      }

      function handleError(error) {
        submitButton
          .icon()
          .classed('ion-load-d', false)
          .classed('ion-ios-arrow-thin-right', true);

        const pop = popAlert()
          .title(string.format('scola.auth.reset.error.title'))
          .text(error.toString(string))
          .ok(string.format('scola.auth.reset.pop.ok'), () => {
            usernameInput.input().node().focus();
          });

        pop
          .ok()
          .button()
          .node()
          .focus();
      }

      function handleInsert() {
        submitButton
          .icon()
          .classed('ion-load-d', false)
          .classed('ion-ios-arrow-thin-right', true);

        const pop = popAlert()
          .title(string.format('scola.auth.reset.success.title'))
          .text(string.format('scola.auth.reset.success.text'))
          .ok(string.format('scola.auth.reset.pop.ok'), () => {
            loginLink.dispatch('click');
          });

        pop
          .ok()
          .button()
          .node()
          .focus();
      }

      function handleLogin() {
        routerModel.set('scola.auth', {
          path: 'login',
          action: 'backward'
        });
      }

      function handleOpen(value) {
        form.disabled(!value);
      }

      function handleSubmit() {
        submitButton
          .icon()
          .classed('ion-ios-arrow-thin-right', false)
          .classed('ion-load-d', true);

        validator.validate(resetModel.local(), (error) => {
          if (!error) {
            resetModel.insert();
            return;
          }

          handleError(error.prefix('field', 'scola.auth.'));
        });
      }

      function addListeners() {
        client.on('open', handleOpen);

        resetModel.on('error', handleError);
        resetModel.on('insert', handleInsert);

        loginLink.on('click.scola-auth', handleLogin);
      }

      function removeListeners() {
        client.removeListener('open', handleOpen);

        resetModel.removeListener('error', handleError);
        resetModel.removeListener('insert', handleInsert);

        loginLink.on('click.scola-auth', null);
      }

      function handleAppend() {
        addListeners();
        resetModel.set('username', passwordModel.get('username'));
      }

      function handleDestroy() {
        removeListeners();

        route.removeListener('append', handleAppend);
        route.removeListener('destroy', handleDestroy);
        route.removeListener('remove', removeListeners);

        resetModel.clear();

        form.destroy();
        resetPanel.destroy();
      }

      actions
        .register('submit', handleSubmit);

      route
        .on('append', handleAppend)
        .on('destroy', handleDestroy)
        .on('remove', removeListeners)
        .element(resetPanel);
    });
}
