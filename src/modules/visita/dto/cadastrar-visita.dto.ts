import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BooleanTransformHelper } from 'src/shared/helpers/boolean.helper';

export class CadastrarVisitaDto {
  @IsInt({
    message: 'O campo solicitação é inválido',
  })
  @IsNotEmpty({
    message: 'O campo solicitação é obrigatório',
  })
  @Type(() => Number)
  solicitacaoId: number;

  @IsDate({
    message: 'O campo data visita é inválido',
  })
  @IsNotEmpty({
    message: 'O campo data visita é obrigatório',
  })
  @Type(() => Date)
  @Transform(({ value }) => new Date(value.toISOString().slice(0, -1)))
  dataVisita: Date;

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

  @IsString({
    message: 'O campo observação é inválido',
  })
  @IsOptional()
  observacao?: string;

  @IsBoolean({
    message: 'O campo concluído é inválido',
  })
  @IsNotEmpty({
    message: 'O campo concluído é obrigatório',
  })
  @Transform(BooleanTransformHelper)
  concluida: boolean;

  @IsBoolean({
    message: 'O campo pagamento é inválido',
  })
  @IsNotEmpty({
    message: 'O campo pagamento é obrigatório',
  })
  @Transform(BooleanTransformHelper)
  pago: boolean;

  @IsInt({
    message: 'O campo solicitação é inválido',
    each: true,
  })
  @IsNotEmpty({
    message: 'O campo solicitação é obrigatório',
  })
  @ArrayMinSize(1, {
    message: 'Uma visita deve ser associada com pelo menos um colaborador',
  })
  @Type(() => Number)
  usuarioColaboradorId: number[];
}
