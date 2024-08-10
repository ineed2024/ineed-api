import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
} from 'class-validator';
import { ValidarQuantidade } from '../validations/validar-quantidade.validation';

export class FiltroListarSolicitacaoDto {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsOptional()
  @Type(() => Number)
  id: number;

  @IsString({
    message: 'O campo de filtros é inválido',
    each: true,
  })
  @Validate((value) => value)
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  filtrarPor?: string[];

  @ValidateIf((obj) => !!obj.filtrarPor)
  @IsString({
    message: 'O campo de valores é inválido',
    each: true,
  })
  @IsNotEmpty({
    message: 'O campo de valores é obrigatório',
  })
  @Validate(ValidarQuantidade)
  @Transform(({ value }) => value.split(','))
  filtrarValor?: string[];
}
