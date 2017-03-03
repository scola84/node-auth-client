import {
  Auth,
  User,
  load as loadAuth
} from '@scola/auth-common';

import authorize from './src/filter/authorize';
import logIn from './src/helper/log-in';
import logOut from './src/helper/log-out';
import setUser from './src/helper/set-user';
import targetRoute from './src/route/target';
import loginRoute from './src/route/login';

function load(client) {
  loadAuth(client);
  targetRoute(client);
  loginRoute(client);
}

export {
  Auth,
  User,
  authorize,
  load,
  logIn,
  logOut,
  setUser
};
