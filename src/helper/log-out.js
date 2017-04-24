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

  client
    .router()
    .target('scola.auth')
    .route('login')
    .go('replace');
}
