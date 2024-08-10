import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma/prisma.service';
import { DadosUsuarioLogado } from '../entities/dados-usuario-logado.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) throw new UnauthorizedException('Token inválido');

    try {
      const acesso = await this.prisma.acesso.findFirst({
        include: {
          Usuario: {
            include: {
              cupom: true,
            },
          },
        },
        where: {
          Token: token,
        },
      });

      if (!acesso) throw new UnauthorizedException('Token inválido');

      const dadosUsuario: DadosUsuarioLogado = {
        id: acesso.UsuarioId,
        email: acesso.Usuario.email,
        telefone: acesso.Usuario.telefone,
        token,
        perfilId: acesso.Usuario.perfilId,
        cupom: acesso.Usuario.cupom
          ? {
              id: acesso.Usuario.cupom.id,
              codigo: acesso.Usuario.cupom.codigo,
            }
          : null,
      };

      request['usuario'] = dadosUsuario;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }
}
