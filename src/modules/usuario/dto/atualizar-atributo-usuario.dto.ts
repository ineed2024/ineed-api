import { PartialType } from '@nestjs/mapped-types';
import { CadastrarUsuarioDto } from './cadastrar-usuario.dto';
import { IsOptional } from 'class-validator';

export class AtualizarAtributoUsuarioDto extends PartialType(
  CadastrarUsuarioDto,
) {}
