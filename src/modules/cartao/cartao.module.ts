import { Module } from '@nestjs/common';
import { CartaoService } from './cartao.service';
import { CartaoController } from './cartao.controller';

@Module({
  controllers: [CartaoController],
  providers: [CartaoService],
})
export class CartaoModule {}
