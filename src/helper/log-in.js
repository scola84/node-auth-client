/*eslint no-use-before-define: [2, "nofunc"]*/

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

  function handleError() {
    model.removeListener('insert', handleInsert);
    logOut(client, AUTH_INVALID);
  }

  function handleInsert() {
    model.removeListener('error', handleError);

    client
      .state('auth', AUTH_VALID);

    client
      .router()
      .popState();
  }

  model.once('error', handleError);
  model.once('insert', handleInsert);

  model.insert();
}
