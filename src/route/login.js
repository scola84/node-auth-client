import { event } from 'd3';
import { passwordValidator as validator } from '@scola/auth-common';

import {
  action,
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function login(client) {
  const string = client.i18n().string();

  const actions = action();
  const tokenCache = client.auth().cache();

  const passwordModel = model('/scola.auth.password', true);
  const routerModel = client.router().model();
  const tokenModel = tokenCache.model();

  const persistentStorage = client.storage() || localStorage;
  const temporaryStorage = sessionStorage;

  let loginForm = null;
  let passwordInput = null;
  let resetLink = null;
  let routePanel = null;
  let submitButton = null;
  let usernameInput = null;

  function handleActionSubmit() {
    submitButton
      .icon()
      .classed('ion-ios-arrow-thin-right', false)
      .classed('ion-load-d', true);

    validator.validate(passwordModel.local(), (error = null) => {
      if (error === null) {
        passwordModel.insert();
        return;
      }

      handlePasswordError(error.prefix('field', 'scola.auth'));
    });
  }

  function handleClientOpen(value) {
    loginForm.disabled(!value);
  }

  function handlePasswordCaps() {
    if (event.detail === false) {
      loginForm.comment(false);
      return;
    }

    loginForm.comment(string.format('scola.auth.caps'));
  }

  function handlePasswordError(error) {
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

  function handlePasswordInsert(data) {
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

    routePanel
      .root()
      .attr('action', null);

    client
      .router()
      .target('scola.auth')
      .destroy();

    client
      .router()
      .popState();
  }

  function handleResetClick() {
    routerModel.set('scola.auth', 'reset');
  }

  function handleRouteAppend() {
    client.on('open', handleClientOpen);

    passwordModel.on('error', handlePasswordError);
    passwordModel.on('insert', handlePasswordInsert);

    passwordInput.input().on('caps.scola-auth', handlePasswordCaps);
    resetLink.on('click.scola-auth', handleResetClick);
  }

  function handleRouteDestroy() {
    passwordModel.clear();

    loginForm.destroy();
    routePanel.destroy();

    loginForm = null;
    passwordInput = null;
    resetLink = null;
    routePanel = null;
    submitButton = null;
    usernameInput = null;
  }

  function handleRouteRemove() {
    client.removeListener('open', handleClientOpen);

    passwordModel.removeListener('error', handlePasswordError);
    passwordModel.removeListener('insert', handlePasswordInsert);

    passwordInput.input().on('caps.scola-auth', null);
    resetLink.on('click.scola-auth', null);
  }

  function renderRoute(route) {
    routePanel = panel()
      .model(actions.model())
      .name('submit');

    routePanel
      .root()
      .attr('action', '/scola.auth.login')
      .classed('auth login', true);

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

    loginForm = routePanel
      .append(itemList())
      .inset();

    const usernameItem = loginForm
      .append(listItem());

    usernameInput = usernameItem
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

    const passwordItem = loginForm
      .append(listItem());

    passwordInput = passwordItem
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

    submitButton = passwordItem
      .button('ion-ios-arrow-thin-right')
      .circle()
      .secondary();

    submitButton
      .button()
      .attrs({
        'tabindex': 4,
        'type': 'submit'
      });

    const persistentItem = loginForm
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

    resetLink = links
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

    route.element(routePanel);
  }

  actions
    .register('submit', handleActionSubmit);

  passwordModel
    .connection(tokenModel.connection());

  client
    .route()
    .default()
    .authorize((route, next) => {
      next(client.auth().password() ?
        null : route.error('500 invalid_user'));
    })
    .render('login@scola.auth', (route) => {
      renderRoute(route);
    })
    .on('append', handleRouteAppend)
    .on('destroy', handleRouteDestroy)
    .on('remove', handleRouteRemove);
}
