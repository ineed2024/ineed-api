import { Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BooleanTransformHelper } from 'src/shared/helpers/boolean.helper';

export class CriarSolicitacaoDto {
  @IsDate({
    message: 'O campo data inicial é inválido',
  })
  @IsNotEmpty({
    message: 'O campo data inicial é obrigatório',
  })
  @Type(() => Date)
  @Transform(({ value }) => new Date(value.toISOString().slice(0, -1)))
  dataInicial: Date;

  @IsDate({
    message: 'O campo data final é inválido',
  })
  @IsNotEmpty({
    message: 'O campo data final é obrigatório',
  })
  @Type(() => Date)
  @Transform(({ value }) => new Date(value.toISOString().slice(0, -1)))
  dataFinal: Date;

  @IsBoolean({
    message: 'O campo material é inválido',
  })
  @IsNotEmpty({
    message: 'O campo material é obrigatório',
  })
  @Transform(BooleanTransformHelper)
  material: boolean;

  @IsString({
    message: 'O campo endereco é inválido',
  })
  @IsOptional()
  endereco?: string;

  @IsString({
    message: 'O campo observacao é inválido',
  })
  @IsOptional()
  observacao?: string;

  @IsBoolean({
    message: 'O campo urgente é inválido',
  })
  @IsNotEmpty({
    message: 'O campo urgente é obrigatório',
  })
  @Transform(BooleanTransformHelper)
  urgente: boolean;

  @IsInt({
    message: 'O campo imóvel é inválido',
  })
  @IsNotEmpty({
    message: 'O campo imóvel é obrigatório',
  })
  @Type(() => Number)
  @Expose({ name: 'ImovelId' })
  imovelId: number;

  @IsInt({
    message: 'O campo serviço é inválido',
    each: true,
  })
  @IsNotEmpty({
    message: 'O campo serviço é obrigatório',
  })
  @Transform(({ value }) => value.split(',').map((item) => +item))
  @Expose({ name: 'ServicoId' })
  servicoId: number[];
}
