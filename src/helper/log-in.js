import logOut from './log-out';
import routeIn from './route-in';
import routeOut from './route-out';

export default function logIn(client) {
  const model = client.auth().model();

  function insert(token) {
    model.once('error', () => {
      logOut(client);
    });

    model.once('insert', (result) => {
      const user = client
        .auth()
        .user(result.user)
        .token(token);

      client.user(user);
      routeIn(client);
    });

    model.insert();
  }

  model
    .storage(localStorage)
    .load();

  let token = model.get('token');

  if (token) {
    insert(token);
    return;
  }

  model
    .storage(sessionStorage)
    .load();

  token = model.get('token');

  if (token) {
    insert(token);
    return;
  }

  routeOut(client);
}
