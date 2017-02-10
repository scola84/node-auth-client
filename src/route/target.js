import { popOver } from '@scola/d3';
import { ScolaError } from '@scola/error';

export default function authTarget(client) {
  function checkUser(target, next) {
    if (client.user()) {
      next(new ScolaError('500 invalid_user'));
      return;
    }

    next();
  }

  function render(target) {
    const popover = popOver()
      .lock(true)
      .move(false)
      .size('34em', '34em');

    popover.root().styles({
      background: 'none'
    });

    target.element(popover, () => {
      popover.hide(() => {
        popover.destroy();
        target.routes(false);
      });
    });
  }

  client.router().render(
    'scola.auth',
    checkUser,
    render
  );
}
