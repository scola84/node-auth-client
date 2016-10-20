import { User } from '@scola/auth-common';
import logOut from './log-out';
import routeIn from './route-in';
import routeOut from './route-out';

export default function logIn(router, model) {
  const token = model
    .storage(localStorage)
    .load()
    .get('token') || model
    .storage(sessionStorage)
    .load()
    .get('token');

  if (!token) {
    routeOut(router, model);
    return;
  }

  model.insert((error, result) => {
    if (error) {
      logOut(router, model);
      return;
    }

    routeIn(router, model, User.fromObject(result.user));
  });
}
