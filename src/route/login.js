import render from './login/render';

export default function renderLogin(client) {
  client.router().render(
    'login@scola.auth',
    render(client)
  ).default();
}
