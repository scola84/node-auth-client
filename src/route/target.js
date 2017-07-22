import { select } from 'd3';
import { popOver } from '@scola/d3';

export default function pop(client) {
  function renderTarget(target) {
    const body = select('body');
    const popover = popOver()
      .lock(true)
      .move(false)
      .size('34em', '34em');

    popover
      .root()
      .classed('auth', true)
      .styles({
        background: 'none'
      });

    target
      .element(popover)
      .once('destroy', () => {
        popover
          .show(false)
          .on('end', () => {
            popover.destroy();
            target.routes(false);
            body.classed('scola auth', false);
          });
      });

    body.classed('scola auth', true);
  }

  client
    .route()
    .authorize((target, next) => {
      next(target.user() === null ?
        null : target.error('500 invalid_user'));
    })
    .render('scola.auth', (target) => {
      renderTarget(target);
    });
}
