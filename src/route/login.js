import authorize from './login/authorize';
import render from './login/render';

export default function renderLogin(client) {
  client.router().render(
    'login@scola.auth',
    authorize(client),
    render(client)
  ).default();
}
