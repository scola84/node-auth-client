import logOut from './log-out';

import {
  AUTH_INVALID_SERVER,
  AUTH_VALID
} from './const';

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
    logOut(client, AUTH_INVALID_SERVER);
  });

  model.once('insert', () => {
    client
      .state('auth', AUTH_VALID);

    client
      .router()
      .popState();
  });

  model.insert();
}
