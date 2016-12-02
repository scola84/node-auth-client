import routeOut from './route-out';

export default function logOut(router, model) {
  model
    .flush()
    .cache()
    .flush(true, () => {
      routeOut(router, model);
    });
}
