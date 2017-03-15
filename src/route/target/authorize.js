import { ScolaError } from '@scola/error';

export default function authorize(client) {
  return (target, next) => {
    if (client.user()) {
      next(new ScolaError('500 invalid_user'));
      return;
    }

    next();
  };
}
