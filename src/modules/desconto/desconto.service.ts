import { FiltroListarDescontoDto } from './dto/filtro-listar-desconto.dto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { PerfilEnum } from 'src/shared/enums/perfil.enum';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { AtivarDescontoDto } from './dto/ativar-desconto.dto';

@Injectable()
export class DescontoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    usuario: DadosUsuarioLogado,
    filtroListarDescontoDto: FiltroListarDescontoDto,
  ) {
    if (usuario.perfilId == PerfilEnum.CLIENTE) {
      if (!filtroListarDescontoDto.id)
        return this.listarDescontoPorUsuario(usuario.id);
      return this.listarDescontoPorId(filtroListarDescontoDto.id);
    }

    throw new UnauthorizedException('Apenas clientes têm acesso aos descontos');
  }

  async ativar(
    usuario: DadosUsuarioLogado,
    ativarDescontoDto: AtivarDescontoDto,
  ) {
    if (usuario.perfilId == PerfilEnum.CLIENTE) {
      return this.ativarDesconto(ativarDescontoDto.codigo, usuario);
    }

    throw new UnauthorizedException('Apenas clientes têm acesso aos descontos');
  }

  private mapear(desconto: any) {
    return {
      ativado: desconto.ativado,
      cupomId: desconto.cupomId,
      desconto: desconto.taxa,
      id: desconto.id,
    };
  }

  private async listarDescontoPorUsuario(usuarioId: number) {
    return (
      await this.prisma.desconto.findMany({
        where: {
          userId: usuarioId,
        },
        orderBy: {
          taxa: 'desc',
        },
      })
    ).map((desconto) => this.mapear(desconto));
  }

  private async listarDescontoPorId(id: number) {
    return this.mapear(
      await this.prisma.desconto.findUnique({
        where: {
          id,
        },
      }),
    );
  }

  private async ativarDesconto(codigo: string, usuario: DadosUsuarioLogado) {
    const cupom = await this.prisma.cupom.findFirst({
      where: {
        codigo: codigo,
      },
    });

    if (!cupom) throw new BadRequestException('Cupom não encontrado');

    const usoCupom = await this.prisma.desconto.count({
      where: {
        userId: usuario.id,
        cupomId: cupom.id,
      },
    });

    if (usoCupom > 0 || (!!usuario.cupom && cupom.id == usuario.cupom.id))
      throw new BadRequestException('Este cupom não é válido para você');

    const cuponsAtivadosDoAdmin = await this.prisma.$queryRaw<any[]>`
        SELECT 
          d.UserId,
          c.Id,
          c.Codigo,
          ca.Ativo,
          ca.UsosMaximos,
          d.Taxa
        FROM CupomAdmin AS ca
        JOIN Cupom		  AS c	ON ca.CupomId = c.Id
        JOIN Desconto	  AS d	ON c.Id = d.CupomId
        WHERE d.UserId = ${usuario.id}
      `;

    const totalCuponsAtivados = await this.prisma.desconto.count({
      where: {
        userId: usuario.id,
        cupomId: {
          not: null,
        },
      },
    });

    const cupomAdmin = await this.prisma.cupomAdmin.findFirst({
      where: {
        cupomId: cupom.id,
      },
    });

    const configuracao = await this.prisma.configuracao.findFirst();

    if (
      !cupomAdmin &&
      totalCuponsAtivados - cuponsAtivadosDoAdmin.length >=
        configuracao.maximoCupomDescontoDeUsuarios
    )
      throw new BadRequestException(
        'A quantidade de cupons máxima por usuário foi atingida',
      );

    const totalUsoCupom = await this.prisma.desconto.count({
      where: {
        cupomId: cupom.id,
      },
    });

    if (!!cupomAdmin && totalUsoCupom > cupomAdmin.usosMaximos)
      throw new BadRequestException('Este cupom não é válido para você');
    else {
      const compartilhador = await this.prisma.usuario.findFirst({
        where: {
          cupomId: cupom.id,
        },
      });

      if (!!compartilhador)
        await this.prisma.desconto.create({
          data: {
            taxa: configuracao.descontoPadrao,
            ativado: false,
            userId: compartilhador.id,
          },
        });
    }

    return this.prisma.desconto.create({
      data: {
        taxa:
          cupomAdmin == null ? configuracao.descontoPadrao : cupomAdmin.taxa,
        ativado: false,
        cupomId: cupom.id,
        userId: usuario.id,
      },
    });
  }
}
