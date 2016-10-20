export default function routeIn(router, model, user) {
  model
    .set('auth', true)
    .commit();

  router
    .user(user)
    .popState();
}
