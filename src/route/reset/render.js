import { resetValidator } from '@scola/auth-common';

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

  const passwordModel = model('/scola.auth.password');

  const resetModel = model('/scola.auth.reset', true)
    .connection(tokenModel.connection());

  const routerModel = client.router().model();
  const actionModel = model('scola.auth.action');

  return (route) => {
    const resetPanel = panel()
      .model(actionModel);

    resetPanel
      .root()
      .attr('action', '/reset')
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
      .model(resetModel)
      .placeholder(string.get('scola.auth.username'))
      .tabindex(1);

    usernameInput
      .input()
      .attr('autocomplete', 'username');

    const submitButton = username
      .button('ion-ios-arrow-thin-right')
      .type('submit')
      .circle()
      .secondary()
      .tabindex(4);

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
        .title(string.format('scola.auth.reset.error.title'))
        .text(error.toString(string, 'scola.error.', prefix))
        .ok(string.format('scola.auth.reset.pop.ok'), () => {
          pop = null;
          usernameInput.focus();
        });

      pop.ok().focus();
    }

    function handleInsert() {
      submitButton.class('ion-ios-arrow-thin-right');

      if (pop !== null) {
        pop.destroy();
      }

      pop = popAlert()
        .title(string.format('scola.auth.reset.success.title'))
        .text(string.format('scola.auth.reset.success.text'))
        .ok(string.format('scola.auth.reset.pop.ok'), () => {
          pop = null;
          loginLink.dispatch('click');
        });

      pop.ok().focus();
    }

    function handleSubmit() {
      submitButton.class('ion-load-d');

      resetValidator.validate(resetModel.local(), (error) => {
        if (error instanceof Error === true) {
          handleError(error, 'scola.auth.');
          return;
        }

        resetModel.insert();
      });
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

      resetModel.removeListener('error', handleError);
      resetModel.removeListener('insert', handleInsert);
      resetModel.clear();

      loginLink.on('click.scola-auth', null);

      form.destroy();
      resetPanel.destroy();
    }

    client.on('open', handleOpen);

    actionModel.on('set', handleSubmit);
    resetModel.on('error', handleError);
    resetModel.on('insert', handleInsert);

    loginLink.on('click.scola-auth', handleLogin);

    resetModel.set('username', passwordModel.get('username'));

    route.element(resetPanel, handleDestroy);
  };
}
