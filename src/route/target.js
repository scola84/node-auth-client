import {
  popOver
} from '@scola/d3';

export default function authTarget(router) {
  router
    .target('scola.auth')
    .render(() => {
      if (router.user()) {
        return null;
      }

      const popover = popOver()
        .lock(true)
        .move(false)
        .slider(true)
        .media('34em', '34em');

      popover.root().styles({
        background: 'none'
      });

      return popover;
    });
}
