import { Module } from '@nestjs/common';
import { OrcamentoService } from './orcamento.service';
import { OrcamentoController } from './orcamento.controller';
import { MailModule } from 'src/shared/services/mail/mail.module';
import { SmsModule } from 'src/shared/services/sms/sms.module';
import { PushNotificationModule } from 'src/shared/services/push-notification/push-notification.module';
import { EfiPayModule } from 'src/shared/services/efi-pay/efi-pay.module';

@Module({
  imports: [MailModule, SmsModule, PushNotificationModule, EfiPayModule],
  controllers: [OrcamentoController],
  providers: [OrcamentoService],
})
export class OrcamentoModule {}
