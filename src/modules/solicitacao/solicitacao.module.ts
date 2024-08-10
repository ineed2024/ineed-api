import { Module } from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { SolicitacaoController } from './solicitacao.controller';
import { ValidarQuantidade } from './validations/validar-quantidade.validation';
import { MailModule } from 'src/shared/services/mail/mail.module';
import { S3Module } from 'src/shared/services/s3/s3.module';

@Module({
  imports: [MailModule, S3Module],
  controllers: [SolicitacaoController],
  providers: [SolicitacaoService, ValidarQuantidade],
})
export class SolicitacaoModule {}
