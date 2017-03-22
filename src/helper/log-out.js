export default function logOut(client) {
  const model = client
    .auth()
    .cache()
    .model();

  client
    .user(false);

  model
    .set('auth', false)
    .clear();

  client
    .router()
    .target('scola.auth')
    .route('login')
    .go('replace');
}
