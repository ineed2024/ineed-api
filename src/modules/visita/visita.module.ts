import { Module } from '@nestjs/common';
import { VisitaService } from './visita.service';
import { VisitaController } from './visita.controller';
import { MailModule } from 'src/shared/services/mail/mail.module';
import { SmsModule } from 'src/shared/services/sms/sms.module';
import { PushNotificationModule } from 'src/shared/services/push-notification/push-notification.module';
import { EfiPayModule } from 'src/shared/services/efi-pay/efi-pay.module';

@Module({
  imports: [MailModule, SmsModule, PushNotificationModule, EfiPayModule],
  controllers: [VisitaController],
  providers: [VisitaService],
})
export class VisitaModule {}
