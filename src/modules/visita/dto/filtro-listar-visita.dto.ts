import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class FiltroListarVisitaDto {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsOptional()
  @Type(() => Number)
  id?: number;
}
