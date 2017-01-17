import { load as loadAuth } from '@scola/auth-common';
import targetRoute from './src/route/target';
import loginRoute from './src/route/login';

export {
  Auth,
  User
} from '@scola/auth-common';

export { default as authorize } from './src/filter/authorize';
export { default as logIn } from './src/helper/log-in';
export { default as logOut } from './src/helper/log-out';

export function load(router, connection, auth, i18n) {
  loadAuth(i18n);
  targetRoute(router);
  loginRoute(router, connection, auth, i18n);
}
