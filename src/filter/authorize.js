import { ScolaError } from '@scola/error';

export default function authorize(verify = (u, r, c) => c(true)) {
  return (route, next) => {
    const user = route
      .target()
      .router()
      .user();

    if (user === null) {
      next(new ScolaError('401 invalid_user'));
      return;
    }

    verify(user, route, (result) => {
      if (result === false) {
        next(new ScolaError('403 invalid_auth'));
        return;
      }

      next();
    });
  };
}
