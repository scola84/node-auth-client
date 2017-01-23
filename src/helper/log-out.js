import routeOut from './route-out';

export default function logOut(client) {
  const model = client.auth().model();

  client
    .user(false);

  model
    .flush();

  model
    .cache()
    .flush(true, () => {
      routeOut(client);
    });
}
