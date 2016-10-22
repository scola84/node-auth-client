export default function routeIn(router, model, user) {
  router
    .user(user)
    .popState();

  model
    .set('auth', true)
    .rollback();
}
