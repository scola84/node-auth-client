import authorize from './set/authorize';
import render from './set/render';

export default function renderSet(client) {
  client.router().render(
    'set@scola.auth',
    authorize(client),
    render(client)
  );
}
