import { ScolaError } from '@scola/error';

export default function authorize(verify = () => true) {
  return (route, next) => {
    const user = route
      .target()
      .router()
      .user();

    if (!user) {
      next(new ScolaError('401 invalid_user'));
      return;
    }

    if (!verify(user)) {
      next(new ScolaError('403 invalid_auth'));
      return;
    }

    next();
  };
}
