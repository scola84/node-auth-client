import { resetValidator as validator } from '@scola/auth-common';

import {
  action,
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function reset(client) {
  const string = client.i18n().string();
  const actions = action();

  const passwordModel = model('/scola.auth.password', true);
  const resetModel = model('/scola.auth.reset', true);
  const routerModel = client.router().model();
  const tokenModel = client.auth().cache().model();

  let resetForm = null;
  let loginLink = null;
  let routePanel = null;
  let submitButton = null;
  let usernameInput = null;

  function handleActionSubmit() {
    submitButton
      .icon()
      .classed('ion-ios-arrow-thin-right', false)
      .classed('ion-load-d', true);

    validator.validate(resetModel.local(), (error = null) => {
      if (error === null) {
        resetModel.insert();
        return;
      }

      handleResetError(error.prefix('field', 'scola.auth'));
    });
  }

  function handleClientOpen(value) {
    resetForm.disabled(!value);
  }

  function handleResetError(error) {
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

  function handleResetInsert() {
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

  function handleLoginClick() {
    routerModel.set('scola.auth', {
      path: 'login',
      action: 'backward'
    });
  }

  function handleRouteAppend() {
    client.on('open', handleClientOpen);

    resetModel.on('error', handleResetError);
    resetModel.on('insert', handleResetInsert);

    loginLink.on('click.scola-auth', handleLoginClick);

    resetModel.set('username', passwordModel.get('username'));
  }

  function handleRouteDestroy() {
    resetModel.clear();

    resetForm.destroy();
    routePanel.destroy();

    loginLink = null;
    resetForm = null;
    routePanel = null;
    submitButton = null;
    usernameInput = null;
  }

  function handleRouteRemove() {
    client.removeListener('open', handleClientOpen);

    resetModel.removeListener('error', handleResetError);
    resetModel.removeListener('insert', handleResetInsert);

    loginLink.on('click.scola-auth', null);
  }

  function renderRoute(route) {
    routePanel = panel()
      .model(actions.model())
      .name('submit');

    routePanel
      .root()
      .classed('auth reset', true);

    routePanel
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

    resetForm = routePanel
      .append(itemList())
      .inset();

    const username = resetForm
      .append(listItem());

    usernameInput = username
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

    submitButton = username
      .button('ion-ios-arrow-thin-right')
      .circle()
      .secondary();

    submitButton
      .button()
      .attrs({
        'tabindex': 2,
        'type': 'submit'
      });

    resetForm.comment(string
      .format('scola.auth.reset.comment'));

    const links = routePanel
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

    loginLink = links
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

    route.element(routePanel);
  }

  actions
    .register('submit', handleActionSubmit);

  resetModel
    .connection(tokenModel.connection());

  client
    .route()
    .authorize((route, next) => {
      next(client.auth().reset() ?
        null : route.error('500 invalid_user'));
    })
    .render('reset@scola.auth', (route) => {
      renderRoute(route);
    })
    .on('append', handleRouteAppend)
    .on('destroy', handleRouteDestroy)
    .on('remove', handleRouteRemove);
}
