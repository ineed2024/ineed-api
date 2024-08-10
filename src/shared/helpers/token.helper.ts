import { v4 as uuid } from 'uuid';

export function gerarToken() {
  let token = '';
  for (let i = 0; i < 3; i++) {
    var getToken = uuid();
    token += getToken;
  }
  return token;
}
