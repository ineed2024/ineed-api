import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async enviarSMS(telefone: string, texto: string) {
    try {
      console.log('Envio de SMS não implementado', {
        telefone,
        texto,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
