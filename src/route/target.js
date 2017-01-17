import { popOver } from '@scola/d3';

export default function authTarget(router) {
  function checkUser(target, next) {
    if (router.user()) {
      next(new Error('500 invalid_user'));
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
      popover.destroy();
    }

    function construct() {
      target.on('destroy', handleDestroy);
      target.element(popover);
    }

    construct();
  }

  router.render(
    'scola.auth',
    checkUser,
    render
  );
}
