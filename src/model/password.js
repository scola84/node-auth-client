import { passwordValidator } from '@scola/auth-common';

export default function authModelPassword(factory, connection) {
  function validate(data, callback) {
    callback(passwordValidator.validate(data));
  }

  factory
    .model('scola.auth.password')
    .object()
    .connection(connection)
    .validate(validate);
}
