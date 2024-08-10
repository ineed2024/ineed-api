import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FiltroListarOrcamentoDto {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsOptional()
  @Type(() => Number)
  id: number;

  @IsString({
    message: 'O campo pesquisa é inválido',
  })
  @IsOptional()
  search: string;
}
