import {
  panel,
  itemList,
  inputItem,
  switchItem,
  objectModel
} from '@scola/d3';

import { User } from '@scola/auth-common';
import routeIn from '../helper/route-in';

export default function(router, factory, i18n) {
  const passwordModel = objectModel('scola.auth.password')
    .model(factory
      .model('scola.auth.password')
      .object());

  const tokenModel = objectModel('scola.auth.token')
    .model(factory
      .model('scola.auth.token')
      .object());

  function render(route) {
    const string = i18n.string();

    const loginPanel = panel();

    loginPanel.body().styles({
      background: 'none'
    });

    loginPanel.body()
      .append('div')
      .classed('scola identity', true)
      .styles({
        'height': '17em',
        'width': '100%'
      });

    const list = itemList();

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

    password.secondary(true);

    password.secondary().icon('ion-ios-arrow-thin-right');

    password.secondary().icon().select(':first-child').styles({
      'background': '#AAA',
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

    function handleLogin() {
      passwordModel.insert((error, result) => {
        list.comment(false);

        if (error) {
          list.comment(error.toString(string, null, 'scola.auth.'));
          list.comment().style('color', 'red');
        } else {
          if (passwordModel.get('persistent') === true) {
            tokenModel.storage(localStorage);
          } else {
            tokenModel.storage(sessionStorage);
          }

          tokenModel
            .set('token', result.token)
            .commit()
            .save();

          route.target().destroy();
          routeIn(router, tokenModel, User.fromObject(result.user));
        }
      });
    }

    function handleDestroy() {
      route.removeListener('destroy', handleDestroy);
      password.secondary().icon().on('click', null);
    }

    function construct() {
      route.on('destroy', handleDestroy);
      password.secondary().icon().on('click', handleLogin);
    }

    construct();

    return loginPanel;
  }

  router
    .target('scola.auth')
    .route('login')
    .render(render);
}
