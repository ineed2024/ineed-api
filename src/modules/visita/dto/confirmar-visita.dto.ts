import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { BooleanTransformHelper } from 'src/shared/helpers/boolean.helper';

export class ConfirmarVisitaDto {
  @IsBoolean({
    message: 'O campo concluído é inválido',
  })
  @IsOptional()
  @Transform(BooleanTransformHelper)
  concluida?: boolean;

  @ValidateIf((obj) => !obj.concluida)
  @IsBoolean({
    message: 'O campo pagamento é inválido',
  })
  @IsOptional()
  @Transform(BooleanTransformHelper)
  pago?: boolean;

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
