import passwordModel from './src/model/password';
import tokenModel from './src/model/token';

import targetRoute from './src/route/target';
import loginRoute from './src/route/login';

import { data } from '@scola/auth-common';

export { User } from '@scola/auth-common';
export { default as logIn } from './src/helper/log-in';
export { default as logOut } from './src/helper/log-out';

export function authClient(router, factory, i18n, connection) {
  data(i18n);
  
  passwordModel(factory, connection);
  tokenModel(factory, connection);

  targetRoute(router);
  loginRoute(router, factory, i18n);
}
