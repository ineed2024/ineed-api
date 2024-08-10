import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AvaliarVisitaDto {
  @IsInt({
    message: 'O campo nota é inválido',
  })
  @IsNotEmpty({
    message: 'O campo nota é obrigatório',
  })
  @Type(() => Number)
  nota: number;

  @IsString({
    message: 'O campo observação é inválido',
  })
  @IsOptional()
  observacao?: string;
}
