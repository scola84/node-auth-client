import {
  popOver
} from '@scola/d3';

export default function (router) {
  router
    .target('scola.auth')
    .authorize((user) => {
      return user === null;
    })
    .render((target) => {
      const popover = popOver()
        .lock(true)
        .move(false)
        .slider(true)
        .media('34em', '34em');

      popover.root().styles({
        background: 'none'
      });

      popover.root().on('destroy', () => {
        target.destroy(false);
      });

      return popover;
    });
}
