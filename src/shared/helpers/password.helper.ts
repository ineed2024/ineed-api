import { v4 as uuid } from 'uuid';

export function gerarSenhaPadrao() {
  let token = '';
  for (let i = 0; i < 1; i++) {
    var getToken = uuid();
    token += getToken;
  }
  return token.substring(1, 6);
}
