import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import { MailModule } from './shared/services/mail/mail.module';
import { ConfiguracaoModule } from './modules/configuracao/configuracao.module';
import { CupomModule } from './modules/cupom/cupom.module';
import { DescontoModule } from './modules/desconto/desconto.module';
import { OrcamentoModule } from './modules/orcamento/orcamento.module';
import { SmsModule } from './shared/services/sms/sms.module';
import { PushNotificationModule } from './shared/services/push-notification/push-notification.module';
import { SolicitacaoModule } from './modules/solicitacao/solicitacao.module';
import { S3Module } from './shared/services/s3/s3.module';
import { CategoriaModule } from './modules/categoria/categoria.module';
import { ServicoModule } from './modules/servico/servico.module';
import { TaxaExtraModule } from './modules/taxa-extra/taxa-extra.module';
import { VisitaModule } from './modules/visita/visita.module';
import { CartaoModule } from './modules/cartao/cartao.module';
import { EfiPayModule } from './shared/services/efi-pay/efi-pay.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsuarioModule,
    MailModule,
    ConfiguracaoModule,
    CupomModule,
    DescontoModule,
    OrcamentoModule,
    SmsModule,
    PushNotificationModule,
    SolicitacaoModule,
    S3Module,
    CategoriaModule,
    ServicoModule,
    TaxaExtraModule,
    VisitaModule,
    CartaoModule,
    EfiPayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
