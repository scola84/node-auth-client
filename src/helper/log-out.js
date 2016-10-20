import routeOut from './route-out';

export default function logOut(router, model) {
  model
    .clear()
    .unload();

  routeOut(router, model);
}
