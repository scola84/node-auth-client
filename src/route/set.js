import { setValidator as validator } from '@scola/auth-common';

import {
  action,
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function renderSet(client) {
  const string = client.i18n().string();

  const routerModel = client.router().model();
  const tokenModel = client.auth().cache().model();

  const setModel = model('/scola.auth.set', true)
    .connection(tokenModel.connection());

  const actions = action();

  client
    .route()
    .authorize((route, next) => {
      next(client.auth().reset() ?
        null : route.error('500 invalid_user'));
    })
    .render('set@scola.auth', (route) => {
      const setPanel = panel()
        .model(actions.model())
        .name('submit');

      setPanel
        .root()
        .classed('auth set', true);

      setPanel
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

      const form = setPanel
        .append(itemList())
        .inset();

      const password = form
        .append(listItem());

      const passwordInput = password
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

      const password2 = form
        .append(listItem());

      const password2Input = password2
        .input('password')
        .name('password2')
        .model(setModel);

      password2Input
        .input()
        .input()
        .attrs({
          'autocomplete': 'new-password',
          'placeholder': string.get('scola.auth.password2'),
          'tabindex': 2
        });

      const submitButton = password2
        .button('ion-ios-arrow-thin-right')
        .circle()
        .secondary();

      submitButton
        .button()
        .attrs({
          'tabindex': 3,
          'type': 'submit'
        });

      form.comment(string.format('scola.auth.set.comment'));

      const links = setPanel
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

      function handleCaps() {
        if (event.detail === false) {
          form.comment(string.format('scola.auth.set.comment'));
          return;
        }

        form.comment(string.format('scola.auth.caps'));
      }

      function handleError(error) {
        submitButton
          .icon()
          .classed('ion-load-d', false)
          .classed('ion-ios-arrow-thin-right', true);

        popAlert()
          .title(string.format('scola.auth.set.error.title'))
          .text(error.toString(string))
          .ok(string.format('scola.auth.set.pop.ok'), () => {
            passwordInput.focus();
          })
          .ok()
          .focus();
      }

      function handleInsert() {
        submitButton
          .icon()
          .classed('ion-load-d', false)
          .classed('ion-ios-arrow-thin-right', true);

        popAlert()
          .title(string.format('scola.auth.set.success.title'))
          .text(string.format('scola.auth.set.success.text'))
          .ok(string.format('scola.auth.set.pop.ok'), () => {
            loginLink.dispatch('click');
          })
          .ok()
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

        validator.validate(setModel.local(), (error) => {
          if (!error) {
            setModel.insert();
            return;
          }

          if (error.message.indexOf('password=regexp:false') > -1) {
            error = route.error('400 invalid_password');
          } else if (error.message.indexOf('password2=equal:false') > -1) {
            error = route.error('400 invalid_password2');
          }

          handleError(error.prefix('field', 'scola.auth.'));
        });
      }

      function addListeners() {
        client.on('open', handleOpen);

        setModel.on('error', handleError);
        setModel.on('insert', handleInsert);

        passwordInput.input().on('caps.scola-auth', handleCaps);
        password2Input.input().on('caps.scola-auth', handleCaps);
        loginLink.on('click.scola-auth', handleLogin);
      }

      function removeListeners() {
        client.removeListener('open', handleOpen);

        setModel.removeListener('error', handleError);
        setModel.removeListener('insert', handleInsert);

        passwordInput.input().on('caps.scola-auth', null);
        password2Input.input().on('caps.scola-auth', null);
        loginLink.on('click.scola-auth', null);
      }

      function handleDestroy() {
        removeListeners();

        route.removeListener('append', addListeners);
        route.removeListener('destroy', handleDestroy);
        route.removeListener('remove', removeListeners);

        setModel.clear();

        form.destroy();
        setPanel.destroy();
      }

      actions
        .register('submit', handleSubmit);

      route
        .on('append', addListeners)
        .on('destroy', handleDestroy)
        .on('remove', removeListeners)
        .element(setPanel);

      setModel
        .set('token', route.parameter('token'));
    });
}
