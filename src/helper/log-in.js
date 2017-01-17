import logOut from './log-out';
import routeIn from './route-in';
import routeOut from './route-out';

export default function logIn(router, auth, model) {
  function insert(token) {
    model.insert((error, result) => {
      if (error) {
        logOut(router, model);
        return;
      }

      const user = auth
        .user(result.user)
        .token(token);

      routeIn(router, model, user);
    });
  }

  model
    .cache()
    .storage(localStorage);

  model.load(() => {
    let token = model.get('token');

    if (token) {
      insert(token);
      return;
    }

    model
      .cache()
      .storage(sessionStorage);

    model.load(() => {
      token = model.get('token');

      if (token) {
        insert(token);
        return;
      }

      routeOut(router, model);
    });
  });
}
