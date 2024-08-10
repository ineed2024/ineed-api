import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecuperarSenhaDto {
  @IsEmail(
    {},
    {
      message: 'O email informado é inválido.',
    },
  )
  @IsNotEmpty({
    message: 'O campo email é obrigatório.',
  })
  email: string;
}
