import { event } from 'd3';
import { setValidator as validator } from '@scola/auth-common';

import {
  action,
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function set(client) {
  const string = client.i18n().string();
  const actions = action();

  const routerModel = client.router().model();
  const setModel = model('/scola.auth.set', true);
  const tokenModel = client.auth().cache().model();

  let loginLink = null;
  let passwordInput = null;
  let password2Input = null;
  let routePanel = null;
  let setForm = null;
  let submitButton = null;

  function handleActionSubmit() {
    submitButton
      .icon()
      .classed('ion-ios-arrow-thin-right', false)
      .classed('ion-load-d', true);

    validator.validate(setModel.local(), (error = null) => {
      if (error === null) {
        setModel.insert();
        return;
      }

      if (error.message.indexOf('password=regexp:false') > -1) {
        error = client.error('400 invalid_password');
      } else if (error.message.indexOf('password2=equal:false') > -1) {
        error = client.error('400 invalid_password2');
      }

      handleSetError(error.prefix('field', 'scola.auth'));
    });
  }

  function handleClientOpen(value) {
    setForm.disabled(!value);
  }

  function handleSetCaps() {
    if (event.detail === false) {
      setForm.comment(string.format('scola.auth.set.comment'));
      return;
    }

    setForm.comment(string.format('scola.auth.caps'));
  }

  function handleSetError(error) {
    submitButton
      .icon()
      .classed('ion-load-d', false)
      .classed('ion-ios-arrow-thin-right', true);

    const pop = popAlert()
      .title(string.format('scola.auth.set.error.title'))
      .text(error.toString(string))
      .ok(string.format('scola.auth.set.pop.ok'), () => {
        passwordInput.input().node().focus();
      });

    pop
      .ok()
      .button()
      .node()
      .focus();
  }

  function handleSetInsert() {
    submitButton
      .icon()
      .classed('ion-load-d', false)
      .classed('ion-ios-arrow-thin-right', true);

    const pop = popAlert()
      .title(string.format('scola.auth.set.success.title'))
      .text(string.format('scola.auth.set.success.text'))
      .ok(string.format('scola.auth.set.pop.ok'), () => {
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

    setModel.on('error', handleSetError);
    setModel.on('insert', handleSetInsert);

    passwordInput.input().on('caps.scola-auth', handleSetCaps);
    password2Input.input().on('caps.scola-auth', handleSetCaps);
    loginLink.on('click.scola-auth', handleLoginClick);

    setModel.set('token', client
      .router()
      .target('scola.auth')
      .route('set')
      .parameter('token'));
  }

  function handleRouteDestroy() {
    setModel.clear();

    setForm.destroy();
    routePanel.destroy();

    loginLink = null;
    passwordInput = null;
    password2Input = null;
    routePanel = null;
    setForm = null;
    submitButton = null;
  }

  function handleRouteRemove() {
    client.removeListener('open', handleClientOpen);

    setModel.removeListener('error', handleSetError);
    setModel.removeListener('insert', handleSetInsert);

    passwordInput.input().on('caps.scola-auth', null);
    password2Input.input().on('caps.scola-auth', null);
    loginLink.on('click.scola-auth', null);
  }

  function renderRoute(route) {
    routePanel = panel()
      .model(actions.model())
      .name('submit');

    routePanel
      .root()
      .classed('auth set', true);

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

    setForm = routePanel
      .append(itemList())
      .inset();

    const password = setForm
      .append(listItem());

    passwordInput = password
      .input('password')
      .model(setModel)
      .name('password');

    passwordInput
      .input()
      .attrs({
        'autocomplete': 'new-password',
        'placeholder': string.get('scola.auth.password'),
        'tabindex': 1
      });

    const password2 = setForm
      .append(listItem());

    password2Input = password2
      .input('password')
      .name('password2')
      .model(setModel);

    password2Input
      .input()
      .attrs({
        'autocomplete': 'new-password',
        'placeholder': string.get('scola.auth.password2'),
        'tabindex': 2
      });

    submitButton = password2
      .button('ion-ios-arrow-thin-right')
      .circle()
      .secondary();

    submitButton
      .button()
      .attrs({
        'tabindex': 3,
        'type': 'submit'
      });

    setForm.comment(string
      .format('scola.auth.set.comment'));

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
      .classed('scola link set', true)
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

  setModel
    .connection(tokenModel.connection());

  client
    .route()
    .authorize((route, next) => {
      next(client.auth().reset() ?
        null : route.error('500 invalid_user'));
    })
    .render('set@scola.auth', (route) => {
      renderRoute(route);
    })
    .on('append', handleRouteAppend)
    .on('destroy', handleRouteDestroy)
    .on('remove', handleRouteRemove);
}
