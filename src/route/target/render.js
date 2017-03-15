import { popOver } from '@scola/d3';

export default function render() {
  return (target) => {
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
  };
}
