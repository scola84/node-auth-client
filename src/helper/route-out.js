export default function routeOut(router, model) {
  router
    .user(null)
    .target('scola.auth')
    .route('login')
    .go('replace');

  model.set('auth', false);
}
