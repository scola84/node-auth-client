export default function setUser(client, callback = () => {}) {
  const cache = client
    .auth()
    .cache();

  const model = cache.model();

  const persistentStorage = client.storage() ||
    localStorage;

  const temporaryStorage = sessionStorage;

  function handleLoad() {
    if (model.has('user') === false) {
      cache
        .storage(temporaryStorage)
        .load();
    }

    if (model.has('user') === false) {
      callback();
      return;
    }

    const user = client
      .auth()
      .user(model.get('user'));

    client.user(user);
    callback();
  }

  cache
    .storage(persistentStorage)
    .load(handleLoad);
}
