import { AUTH_LOGOUT } from './const';

export default function logOut(client, state = AUTH_LOGOUT) {
  const model = client
    .auth()
    .cache()
    .model();

  client
    .user(false)
    .state('auth', state);

  if (state === AUTH_LOGOUT) {
    model.clear();
  }

  const target = client
    .router()
    .target('scola.auth');

  let route = target
    .current();

  if (route === null) {
    route = target.route('login');
  }

  route.go();
}
