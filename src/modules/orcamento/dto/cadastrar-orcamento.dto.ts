import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BooleanTransformHelper } from 'src/shared/helpers/boolean.helper';

export class CadastrarOrcamentoDto {
  @IsInt({
    message: 'O campo usuário é inválido',
  })
  @IsNotEmpty({
    message: 'O campo usuário é obrigatório',
  })
  @Type(() => Number)
  usuarioId: number;

  @IsInt({
    message: 'O campo solicitação é inválido',
  })
  @IsNotEmpty({
    message: 'O campo solicitação é obrigatório',
  })
  @Type(() => Number)
  solicitacaoId: number;

  @IsDate({
    message: 'O campo data entrega é inválido',
  })
  @IsNotEmpty({
    message: 'O campo data entrega é obrigatório',
  })
  @Type(() => Date)
  @Transform(({ value }) => new Date(value.toISOString().slice(0, -1)))
  dataEntrega: Date;

  @IsString({
    message: 'O campo observação é inválido',
  })
  @IsOptional()
  observacao?: string;

  @IsNumber(
    {},
    {
      message: 'O campo mao de obra é inválido',
    },
  )
  @IsNotEmpty({
    message: 'O campo mao de obra é obrigatório',
  })
  @Type(() => Number)
  maoObra: number;

  @IsNumber(
    {},
    {
      message: 'O campo material é inválido',
    },
  )
  @IsNotEmpty({
    message: 'O campo material é obrigatório',
  })
  @Type(() => Number)
  material: number;

  @IsBoolean({
    message: 'O campo concluido é inválido',
  })
  @IsOptional()
  @Transform(BooleanTransformHelper)
  concluido?: boolean;

  @IsInt({
    message: 'O campo usuário colaborador é inválido',
  })
  @IsNotEmpty({
    message: 'O campo usuário colaborador é obrigatório',
  })
  @Type(() => Number)
  usuarioColaboradorId?: number;

  @IsBoolean({
    message: 'O campo pago é inválido',
  })
  @IsOptional()
  @Transform(BooleanTransformHelper)
  pago?: boolean;
}
