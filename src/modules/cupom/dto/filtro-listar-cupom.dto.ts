import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { BooleanTransformHelper } from 'src/shared/helpers/boolean.helper';

export class FiltroListarCupomDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  id: number;

  @IsBoolean()
  @IsOptional()
  @Transform(BooleanTransformHelper)
  all: boolean;
}
