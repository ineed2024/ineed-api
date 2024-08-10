import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PushNotificationService {
  constructor(private readonly httpService: HttpService) {}

  async enviarNotificacaoPush(
    tokens: string[],
    titulo: string,
    mensagem: string,
    data: Record<string, any>,
  ) {
    try {
      const notificacao = {
        registration_ids: tokens,
        notification: {
          body: mensagem,
          title: titulo,
          sound: 'default',
          click_action: 'FCM_PLUGIN_ACTIVITY',
          icon: 'notification',
          color: '#000000',
        },
        data: {
          body: mensagem,
          title: titulo,
          sound: 'default',
          click_action: 'FCM_PLUGIN_ACTIVITY',
          icon: 'notification',
          color: '#000000',
          ...data,
        },
      };

      this.httpService.post('/', notificacao);
    } catch (err) {
      console.error(err);
    }
  }
}
