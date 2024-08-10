import { Module } from '@nestjs/common';
import { EfiPayService } from './efi-pay.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('EFI_PAY_URL'),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EfiPayService],
  exports: [EfiPayService],
})
export class EfiPayModule {}
