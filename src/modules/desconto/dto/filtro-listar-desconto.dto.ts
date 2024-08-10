import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { BooleanTransformHelper } from 'src/shared/helpers/boolean.helper';

export class FiltroListarDescontoDto {
  @IsInt({
    message: 'O campo id é inválido',
  })
  @IsOptional()
  @Type(() => Number)
  id: number;

  @IsBoolean({
    message: 'O campo todos é inválido',
  })
  @IsOptional()
  @Transform(BooleanTransformHelper)
  all: boolean;
}
