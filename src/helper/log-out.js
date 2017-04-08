import { AUTH_INVALID_CLIENT } from './const';

export default function logOut(client, state = AUTH_INVALID_CLIENT) {
  const model = client
    .auth()
    .cache()
    .model();

  client
    .user(false)
    .is('auth', state);

  if (state === AUTH_INVALID_CLIENT) {
    model.clear();
  }

  client
    .router()
    .target('scola.auth')
    .route('login')
    .go('replace');
}
