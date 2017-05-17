import authorize from './reset/authorize';
import render from './reset/render';

export default function renderReset(client) {
  client.router().render(
    'reset@scola.auth',
    authorize(client),
    render(client)
  );
}
