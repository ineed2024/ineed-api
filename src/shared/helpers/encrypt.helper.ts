import * as md5 from 'md5';

export function encriptar(value: string) {
  if (!value) return '';

  const textoParaEncriptar = `${value}|fab473a6-c7dd-4548-8228-f07fc1f74385`;
  const arrayBytes = new TextEncoder().encode(textoParaEncriptar);

  return md5(arrayBytes);
}
