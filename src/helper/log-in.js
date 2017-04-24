import logOut from './log-out';

import {
  AUTH_INVALID,
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
    logOut(client, AUTH_INVALID);
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
