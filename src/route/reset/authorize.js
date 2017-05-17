import { ScolaError } from '@scola/error';

export default function authorize(client) {
  return (target, next) => {
    if (client.auth().reset() === true) {
      next();
      return;
    }

    next(new ScolaError('500 invalid_path'));
  };
}
