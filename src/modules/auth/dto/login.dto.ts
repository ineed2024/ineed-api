import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
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

  @IsString({
    message: 'A senha informada é inválida.',
  })
  @IsNotEmpty({
    message: 'O campo senha é obrigatório.',
  })
  senha: string;
}
