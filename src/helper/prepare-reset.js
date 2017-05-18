export default function prepareReset(client) {
  const hash = client.router().parseHash();
  const auth = hash['scola.auth'] || {};

  if (auth.path === 'set') {
    client
      .auth()
      .cache()
      .storage(client.storage())
      .model()
      .clear();
  }
}
