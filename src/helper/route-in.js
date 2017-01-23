export default function routeIn(client) {
  client
    .router()
    .popState();

  client
    .auth()
    .model()
    .set('auth', true);
}
