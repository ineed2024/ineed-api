import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async enviarEmailHtml(destinatario: string, assunto: string, html: string) {
    try {
      // await this.mailerService.sendMail({
      //   to: destinatario,
      //   subject: assunto,
      //   html,
      // });

      console.log('Envio de email não implementado', {
        destinatario,
        assunto,
        html,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async enviarEmailTexto(destinatario: string, assunto: string, texto: string) {
    try {
      // await this.mailerService.sendMail({
      //   to: [destinatario],
      //   subject: assunto,
      //   text: texto,
      // });

      console.log('Envio de email não implementado', {
        destinatario,
        assunto,
        texto,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
