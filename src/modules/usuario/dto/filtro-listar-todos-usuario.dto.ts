import { Type } from 'class-transformer';
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

export class FiltroListarTodosUsuarioDto {
  @IsString({
    message: 'O nome informado é inválido.',
  })
  @IsOptional()
  nome?: string;

  // @IsString({ message: 'O campo RG é inválido.' })
  // @IsOptional()
  // Rg?: string;

  // @IsString({ message: 'O campo CPF/CNPJ é inválido.' })
  // @MinLength(14, { message: 'O campo CPF/CNPJ é inválido.' })
  // @MaxLength(16, { message: 'O campo CPF/CNPJ é inválido.' })
  // @IsOptional()
  // CpfCnpj?: string;

  @IsInt({
    message: 'O campo perfil é inválido.',
  })
  @Type(() => Number)
  @IsOptional()
  profileId?: number;

  // @IsInt({
  //   message: 'O campo tipo é inválido.',
  // })
  // @Type(() => Number)
  // @IsOptional()
  // TipoId?: number;

  // @IsString({
  //   message: 'O campo endereço é inválido.',
  // })
  // @IsOptional()
  // Endereco?: string;

  // @IsInt({
  //   message: 'O campo tipo número é inválido.',
  // })
  // @Type(() => Number)
  // @IsOptional()
  // Numero?: number;

  // @IsString({
  //   message: 'O campo endereço é inválido.',
  // })
  // @IsOptional()
  // Cidade?: string;

  // @IsString({
  //   message: 'O campo endereço é inválido.',
  // })
  // @IsOptional()
  // Uf?: string;

  // id
  // nome
  // profileId
  // tipoId
  // cpfCnpj
  // rg
  // endereco
  // email
  // cidade
  // uf
  // inativo
}
