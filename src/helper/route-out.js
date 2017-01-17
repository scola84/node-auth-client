export default function routeOut(router, model) {
  router
    .user(false)
    .target('scola.auth')
    .route('login')
    .go('replace');

  model.set('auth', false);
}
