import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class DeletarSolicitacaoDto {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsOptional()
  @Type(() => Number)
  id: number;
}
