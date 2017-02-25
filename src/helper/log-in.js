import logOut from './log-out';

export default function logIn(client) {
  const model = client.auth().model();

  if (!model.has('user')) {
    logOut(client);
    return;
  }

  model.once('error', () => {
    logOut(client);
  });

  model.once('insert', () => {
    model
      .set('auth', true);

    client
      .router()
      .popState();
  });

  model.insert();
}
