export default function authorize(allow = (u, r, c) => c(true)) {
  return (route, next) => {
    const user = route.user();

    if (user === null) {
      next(route.error('401 invalid_user'));
      return;
    }

    allow(user, route, (result) => {
      if (result === false) {
        next(route.error('403 invalid_auth'));
        return;
      }

      next();
    });
  };
}
