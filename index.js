import targetRoute from './src/route/target';
import loginRoute from './src/route/login';

import { loadI18n } from '@scola/auth-common';
export { User } from '@scola/auth-common';

export { default as authorize } from './src/filter/authorize';
export { default as logIn } from './src/helper/log-in';
export { default as logOut } from './src/helper/log-out';

export function client(router, connection, i18n) {
  loadI18n();

  targetRoute(router);
  loginRoute(router, connection, i18n);
}
