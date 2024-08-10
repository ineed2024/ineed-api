import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('FCM_URL'),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${configService.get('FCM_TOKEN')}`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
