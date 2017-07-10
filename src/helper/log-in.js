/*eslint no-use-before-define: [2, "nofunc"]*/

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

  function handleError() {
    model.removeListener('insert', handleInsert);
    logOut(client, 'invalid');
  }

  function handleInsert() {
    model.removeListener('error', handleError);

    client
      .state('auth', 'valid');

    client
      .router()
      .popState();
  }

  model.once('error', handleError);
  model.once('insert', handleInsert);

  model.insert();
}
