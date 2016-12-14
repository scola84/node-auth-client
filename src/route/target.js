import { popOver } from '@scola/d3';

export default function authTarget(router) {
  function render(target) {
    if (router.user()) {
      target.element(false);
      return;
    }

    const popover = popOver()
      .lock(true)
      .move(false)
      .slider(true)
      .media('34em', '34em');

    target.element(popover);

    popover.root().styles({
      background: 'none'
    });

    function handleDestroy() {
      target.removeListener('destroy', handleDestroy);
      popover.destroy();
    }

    function construct() {
      target.on('destroy', handleDestroy);
    }

    construct();
  }

  router.render(
    'scola.auth',
    render
  );
}
