export default function routeOut(router, model) {
  model
    .set('auth', false)
    .commit();

  router
    .user(null)
    .target('scola.auth')
    .route('login')
    .go('replace');
}
