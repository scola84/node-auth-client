import { ScolaError } from '@scola/error';

export default function authorize(route, next) {
  const user = route
    .target()
    .router()
    .user();

  if (!user) {
    next(new ScolaError('500 invalid_user'));
    return;
  }

  const path = [route.path(), route.target().name()].join('@');

  if (!user.may('GET', path)) {
    next(new ScolaError('500 unauthorized'));
    return;
  }

  next();
}
