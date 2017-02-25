export default function setUser(client) {
  const model = client.auth().model();

  model
    .storage(localStorage)
    .load();

  if (!model.has('user')) {
    model
      .storage(sessionStorage)
      .load();
  }

  if (!model.has('user')) {
    return;
  }

  const user = client
    .auth()
    .user(model.get('user'));

  client.user(user);
}
