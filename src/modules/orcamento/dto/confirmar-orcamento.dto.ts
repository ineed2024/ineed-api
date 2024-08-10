import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { MetodoPagamentoEnum } from 'src/shared/enums/metodo-pagamento.enum';

export class ConfirmarOrcamentoDto {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsNotEmpty({
    message: 'O campo id é obrigatório',
  })
  @Type(() => Number)
  id: number;

  @IsEnum(MetodoPagamentoEnum, {
    message: 'O campo metodo de pagamento é inválido',
  })
  @IsNotEmpty({
    message: 'O campo metodo de pagamento é obrigatório',
  })
  @Type(() => Number)
  metodoPagamento: number;

  @IsString({
    message: 'O campo hash é inválido',
  })
  @IsNotEmpty({
    message: 'O campo hash é obrigatório',
  })
  senderHash: string;
}
