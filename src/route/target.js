import authorize from './target/authorize';
import render from './target/render';

export default function renderTarget(client) {
  client.router().render(
    'scola.auth',
    authorize(client),
    render()
  );
}
