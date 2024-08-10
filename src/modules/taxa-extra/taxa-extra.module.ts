import { Module } from '@nestjs/common';
import { TaxaExtraService } from './taxa-extra.service';
import { TaxaExtraController } from './taxa-extra.controller';
import { PushNotificationModule } from 'src/shared/services/push-notification/push-notification.module';
import { EfiPayModule } from 'src/shared/services/efi-pay/efi-pay.module';

@Module({
  imports: [PushNotificationModule, EfiPayModule],
  controllers: [TaxaExtraController],
  providers: [TaxaExtraService],
})
export class TaxaExtraModule {}
