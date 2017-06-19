import { setValidator } from '@scola/auth-common';
import { ScolaError } from '@scola/error';

import {
  panel,
  itemList,
  listItem,
  model,
  popAlert
} from '@scola/d3';

export default function render(client) {
  const string = client.i18n().string();

  const tokenModel = client
    .auth()
    .cache()
    .model();

  const setModel = model('/scola.auth.set', true)
    .connection(tokenModel.connection());

  const routerModel = client.router().model();
  const actionModel = model('scola.auth.action');

  return (route) => {
    const setPanel = panel()
      .model(actionModel);

    setPanel
      .root()
      .attr('action', '/set')
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
      .name('password')
      .model(setModel)
      .placeholder(string.get('scola.auth.password'))
      .tabindex(1);

    passwordInput
      .input()
      .attr('autocomplete', 'new-password');

    const password2 = form
      .append(listItem());

    const password2Input = password2
      .input('password')
      .name('password2')
      .model(setModel)
      .placeholder(string.get('scola.auth.password2'))
      .tabindex(1);

    password2Input
      .input()
      .attr('autocomplete', 'new-password');

    const submitButton = password2
      .button('ion-ios-arrow-thin-right')
      .type('submit')
      .circle()
      .secondary()
      .tabindex(4);

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

    let pop = null;

    function handleOpen(value) {
      form.disabled(!value);
    }

    function handleError(error, prefix) {
      if (error.code !== 'invalid_state') {
        submitButton.class('ion-ios-arrow-thin-right');
      }

      if (pop !== null) {
        pop.destroy();
      }

      pop = popAlert()
        .title(string.format('scola.auth.set.error.title'))
        .text(error.toString(string, 'scola.error.', prefix))
        .ok(string.format('scola.auth.set.pop.ok'), () => {
          pop = null;
          passwordInput.focus();
        });

      pop.ok().focus();
    }

    function handleInsert() {
      submitButton.class('ion-ios-arrow-thin-right');

      if (pop !== null) {
        pop.destroy();
      }

      pop = popAlert()
        .title(string.format('scola.auth.set.success.title'))
        .text(string.format('scola.auth.set.success.text'))
        .ok(string.format('scola.auth.set.pop.ok'), () => {
          pop = null;
          loginLink.dispatch('click');
        });

      pop.ok().focus();
    }

    function handleSubmit() {
      submitButton.class('ion-load-d');

      setValidator.validate(setModel.local(), (error) => {
        if (error instanceof Error === true) {
          if (error.message.indexOf('password=regexp:false') > -1) {
            error = new ScolaError('400 invalid_password');
          } else if (error.message.indexOf('password2=equal:false') > -1) {
            error = new ScolaError('400 invalid_password2');
          }

          handleError(error, 'scola.auth.');
          return;
        }

        setModel.insert();
      });
    }

    function handleCaps() {
      if (event.detail === false) {
        form.comment(string.format('scola.auth.set.comment'));
        return;
      }

      form.comment(string.format('scola.auth.caps'));
    }

    function handleLogin() {
      routerModel.set('scola.auth', {
        path: 'login',
        action: 'backward'
      });
    }

    function handleDestroy() {
      client.removeListener('open', handleOpen);

      actionModel.removeListener('set', handleSubmit);

      setModel.removeListener('error', handleError);
      setModel.removeListener('insert', handleInsert);
      setModel.clear();

      passwordInput.input().on('caps.scola-auth', null);
      password2Input.input().on('caps.scola-auth', null);
      loginLink.on('click.scola-auth', null);

      form.destroy();
      setPanel.destroy();
    }

    client.on('open', handleOpen);

    actionModel.on('set', handleSubmit);
    setModel.on('error', handleError);
    setModel.on('insert', handleInsert);

    passwordInput.input().on('caps.scola-auth', handleCaps);
    password2Input.input().on('caps.scola-auth', handleCaps);
    loginLink.on('click.scola-auth', handleLogin);

    setModel.set('token', route.parameter('token'));

    route.element(setPanel, handleDestroy);
  };
}
