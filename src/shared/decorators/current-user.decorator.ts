import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DadosUsuarioLogado } from '../entities/dados-usuario-logado.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): DadosUsuarioLogado => {
    const request = context.switchToHttp().getRequest();

    return request.usuario;
  },
);
