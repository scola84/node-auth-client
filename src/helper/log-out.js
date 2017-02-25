export default function logOut(client) {
  const model = client.auth().model();

  client
    .user(false);

  model
    .set('auth', false)
    .flush(true);

  client
    .router()
    .target('scola.auth')
    .route('login')
    .go('replace');
}
