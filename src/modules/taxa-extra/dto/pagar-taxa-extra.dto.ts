import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, ValidateNested } from 'class-validator';

class RequisicaoTaxaExtra {
  @IsInt({
    message: 'O campo parcela é inválido',
  })
  @IsNotEmpty({
    message: 'O campo parcela é obrigatório',
  })
  parcela: number;

  @IsInt({
    message: 'O campo cartão é inválido',
  })
  @IsNotEmpty({
    message: 'O campo cartão é obrigatório',
  })
  cartaoId: number;
}

export class PagarTaxaExtra {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsNotEmpty({
    message: 'O campo id é obrigatório',
  })
  @Type(() => Number)
  id: number;

  @ValidateNested()
  requisicao: RequisicaoTaxaExtra;
}
