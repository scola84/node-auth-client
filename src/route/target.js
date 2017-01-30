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
      .media('34em', '34em');

    popover.root().styles({
      background: 'none'
    });

    function handleDestroy() {
      target.removeListener('destroy', handleDestroy);

      popover.hide(() => {
        popover.destroy();
        target.routes(false);
      });
    }

    function construct() {
      target.on('destroy', handleDestroy);
      target.element(popover);
    }

    construct();
  }

  client.router().render(
    'scola.auth',
    checkUser,
    render
  );
}
