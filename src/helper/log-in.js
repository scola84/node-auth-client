import logOut from './log-out';

export default function logIn(client) {
  const model = client
    .auth()
    .cache()
    .model();

  if (model.has('user') === false) {
    logOut(client);
    return;
  }

  model.once('error', () => {
    logOut(client);
  });

  model.once('insert', () => {
    client
      .is('auth', true);

    client
      .router()
      .popState();
  });

  model.insert();
}
