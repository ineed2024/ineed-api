import { IsNotEmpty, IsString } from 'class-validator';

export class AtualizarSenhaUsuarioDto {
  @IsString({
    message: 'A senha atual informada é inválida.',
  })
  @IsNotEmpty({
    message: 'O campo senha atual é obrigatório.',
  })
  senhaAtual: string;

  @IsString({
    message: 'A nova senha informada é inválida.',
  })
  @IsNotEmpty({
    message: 'O campo nova senha é obrigatório.',
  })
  novaSenha: string;
}
