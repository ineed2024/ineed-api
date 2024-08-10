import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CriarTaxaExtra {
  @IsInt({
    message: 'O campo orçamento é inválido',
  })
  @IsNotEmpty({
    message: 'O campo orçamento é obrigatório',
  })
  @Type(() => Number)
  orcamentoId: number;

  @IsNumber(
    {},
    {
      message: 'O campo valor é inválido',
    },
  )
  @IsNotEmpty({
    message: 'O campo valor é obrigatório',
  })
  @Type(() => Number)
  valor: number;
}
