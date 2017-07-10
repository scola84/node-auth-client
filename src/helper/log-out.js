export default function logOut(client, state = 'logout') {
  const model = client
    .auth()
    .cache()
    .model();

  client
    .user(false)
    .state('auth', state);

  if (state === 'logout') {
    model.clear();
  }

  const target = client
    .router()
    .target('scola.auth');

  let route = target
    .current();

  if (route === null) {
    route = target.route('login');
  }

  route.go();
}
