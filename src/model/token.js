import { tokenValidator } from '@scola/auth-common';

export default function authModelToken(factory, connection) {
  function validate(data, callback) {
    callback(tokenValidator.validate(data));
  }

  factory
    .model('scola.auth.token')
    .object()
    .connection(connection)
    .validate(validate);
}
