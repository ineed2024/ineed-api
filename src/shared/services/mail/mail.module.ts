import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: `smtp://${config.get('MAIL_USER')}:${config.get('MAIL_PASSWORD')}@${config.get('MAIL_SERVER')}`,
        defaults: {
          secure: !!config.get('MAIL_SECURE'), //para usar 587 ou true para 465
          port: +config.get('MAIL_PORT'),
          from: config.get('MAIL_USER'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
