export default function routeOut(client) {
  client
    .router()
    .target('scola.auth')
    .route('login')
    .go('replace');

  client
    .auth()
    .model()
    .set('auth', false);
}
