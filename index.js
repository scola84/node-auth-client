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
import resetRoute from './src/route/reset';
import setRoute from './src/route/set';

import {
  AUTH_INVALID,
  AUTH_LOGOUT,
  AUTH_VALID
} from './src/helper/const';

function load(client) {
  loadAuth(client);
  targetRoute(client);
  loginRoute(client);
  resetRoute(client);
  setRoute(client);
}

export {
  AUTH_INVALID,
  AUTH_LOGOUT,
  AUTH_VALID,
  Auth,
  User,
  authorize,
  load,
  logIn,
  logOut,
  setUser
};
