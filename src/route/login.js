import {
  panel,
  itemList,
  inputItem,
  switchItem,
  objectModel
} from '@scola/d3';

import { User } from '@scola/auth-common';
import routeIn from '../helper/route-in';

export default function authLoginRoute(router, factory, i18n) {
  function render(route) {
    const string = i18n.string();

    const passwordModel = objectModel('scola.auth.password')
      .model(factory
        .model('scola.auth.password')
        .object());

    const tokenModel = objectModel('scola.auth.token')
      .model(factory
        .model('scola.auth.token')
        .object());

    const loginPanel = panel();

    loginPanel.root()
      .classed('login', true);

    loginPanel.body()
      .append('div')
      .classed('scola identity', true)
      .styles({
        'height': '17em',
        'width': '100%'
      });

    const list = itemList()
      .inset(true);

    list.root().styles({
      'padding-bottom': '1em'
    });

    loginPanel.append(list, true);

    const username = inputItem()
      .name('username')
      .placeholder(string.get('scola.auth.username'))
      .model(passwordModel);

    list.append(username, true);

    const password = inputItem()
      .type('password')
      .name('password')
      .placeholder(string.get('scola.auth.password'))
      .model(passwordModel);

    password.secondary().button('ion-ios-arrow-thin-right', '2em', 'submit');

    password.secondary().button().select(':first-child').styles({
      'background': '#007AFF',
      'color': '#FFF',
      'cursor': 'pointer',
      'height': '1em',
      'width': '1em',
      'border-radius': '1em',
      'justify-content': 'center',
      'align-items': 'center',
      'display': 'flex'
    });

    list.append(password, true);

    const persistent = switchItem()
      .name('persistent')
      .text(string.get('scola.auth.persistent'))
      .model(passwordModel);

    list.append(persistent, true);

    function handleSubmit() {
      loginPanel.lock(true);

      passwordModel.insert((error, result) => {
        loginPanel.lock(false);
        list.comment(false);

        if (error) {
          list.comment(error.toString(string, null, 'scola.auth.'));
          list.comment().style('color', 'red');

          return;
        }

        if (passwordModel.get('persistent') === true) {
          tokenModel.storage(localStorage);
        } else {
          tokenModel.storage(sessionStorage);
        }

        tokenModel
          .set('token', result.token)
          .commit()
          .save();

        const user = User.fromObject(result.user)
          .token(result.token);

        route.target().destroy();
        routeIn(router, tokenModel, user);
      });
    }

    function handleDestroy() {
      passwordModel.destroy();
      loginPanel.root().on('destroy', handleDestroy);
      loginPanel.root().on('submit', null);
    }

    function construct() {
      loginPanel.root().on('destroy', handleDestroy);
      loginPanel.root().on('submit', handleSubmit);
    }

    construct();

    return loginPanel;
  }

  router
    .target('scola.auth')
    .route('login')
    .render(render);
}
