import routeOut from './route-out';

export default function logOut(router, model) {
  model.cache().flush(true, () => {
    model.flush();
    routeOut(router, model);
  });
}
