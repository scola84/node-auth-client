export default function logOut(client) {
  const model = client
    .auth()
    .cache()
    .model();

  client
    .user(false)
    .is('auth', false);

  model
    .clear();

  client
    .router()
    .target('scola.auth')
    .route('login')
    .go('replace');
}
