import { IsNotEmpty, IsString } from 'class-validator';

export class AtivarDescontoDto {
  @IsString({
    message: 'O campo código é inválido',
  })
  @IsNotEmpty({
    message: 'O campo código é obrigatório',
  })
  codigo: string;
}
