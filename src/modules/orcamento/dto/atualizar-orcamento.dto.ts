import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CadastrarOrcamentoDto } from './cadastrar-orcamento.dto';
import { PartialType } from '@nestjs/mapped-types';

export class AtualizarOrcamentoDto extends PartialType(CadastrarOrcamentoDto) {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsNotEmpty({
    message: 'O campo id é obrigatório',
  })
  @Type(() => Number)
  id: number;

  @IsString({
    message: 'O campo diario da obra é inválido',
  })
  @IsOptional()
  diarioObra?: string;
}
