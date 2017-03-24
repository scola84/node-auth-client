export default function setUser(client) {
  const cache = client
    .auth()
    .cache();

  const model = cache.model();

  cache
    .storage(localStorage)
    .load();

  if (model.has('user') === false) {
    cache
      .storage(sessionStorage)
      .load();
  }

  if (model.has('user') === false) {
    return;
  }

  const user = client
    .auth()
    .user(model.get('user'));

  client.user(user);
}
