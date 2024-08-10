import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CadastrarUsuarioDto {
  @IsString({
    message: 'O nome informado é inválido.',
  })
  @IsNotEmpty({
    message: 'O campo nome é obrigatório.',
  })
  nome: string;

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

  @IsString({ message: 'O campo RG é inválido.' })
  @IsOptional()
  rg?: string;

  @IsString({ message: 'O campo CPF/CNPJ é inválido.' })
  @MinLength(14, { message: 'O campo CPF/CNPJ é inválido.' })
  @MaxLength(16, { message: 'O campo CPF/CNPJ é inválido.' })
  @IsOptional()
  cpfCnpj?: string;

  @IsNotEmpty({
    message: 'O campo perfil é obrigatório.',
  })
  @IsInt({
    message: 'O campo perfil é inválido.',
  })
  @Type(() => Number)
  perfilId: number;

  @IsNotEmpty({
    message: 'O campo tipo é obrigatório.',
  })
  @IsInt({
    message: 'O campo tipo é inválido.',
  })
  @Type(() => Number)
  tipoId: number;

  @IsString({
    message: 'O campo endereço é inválido.',
  })
  @IsOptional()
  endereco?: string;

  @IsInt({
    message: 'O campo tipo número é inválido.',
  })
  @Type(() => Number)
  @IsOptional()
  numero?: number;

  @IsString({
    message: 'O campo endereço é inválido.',
  })
  @IsOptional()
  cep?: string;

  @IsString({
    message: 'O campo endereço é inválido.',
  })
  @IsOptional()
  telefone?: string;

  @IsString({
    message: 'O campo endereço é inválido.',
  })
  @IsOptional()
  cidade?: string;

  @IsString({
    message: 'O campo endereço é inválido.',
  })
  @IsOptional()
  imagemUrl?: string;

  @IsString({
    message: 'O campo endereço é inválido.',
  })
  @IsOptional()
  uf?: string;

  @IsString({
    message: 'O campo complemento é inválido.',
  })
  @IsOptional()
  complemento?: string;

  @IsDate({
    message: 'O campo data de aniversário é inválido',
  })
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value.toISOString().slice(0, -1)))
  dataAniversario?: Date;

  @IsBoolean({
    message: 'O campo conta rede social é inválido',
  })
  @IsOptional()
  contaRedeSocial?: boolean;

  @IsInt({
    message: 'O campo tipo rede social é inválido.',
  })
  @Type(() => Number)
  @IsOptional()
  idTipoRedeSocial?: number;

  @IsString({
    message: 'O campo rede social é inválido.',
  })
  @IsOptional()
  idRedeSocial?: string;

  @IsInt({
    message: 'O campo cupom é inválido.',
  })
  @Type(() => Number)
  @IsOptional()
  cupomId?: number;
}
