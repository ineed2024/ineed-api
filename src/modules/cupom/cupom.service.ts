import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { PerfilEnum } from 'src/shared/enums/perfil.enum';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { FiltroListarCupomDto } from './dto/filtro-listar-cupom.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CupomService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    usuario: DadosUsuarioLogado,
    filtroListarCupomDto: FiltroListarCupomDto,
    paginaAtual = 1,
  ): Promise<{ dados: any; paginas?: number }> {
    if (isNaN(paginaAtual)) paginaAtual = 1;

    switch (usuario.perfilId) {
      case PerfilEnum.ADMIN:
        if (!filtroListarCupomDto.id)
          return await this.listarCupomAdmin(
            filtroListarCupomDto.all,
            paginaAtual,
          );
        return { dados: await this.listarCupomPorId(usuario.id) };
      case PerfilEnum.CLIENTE:
        return { dados: await this.listarCupomPorUsuario(usuario) };
      default:
        throw new UnauthorizedException(
          'Apenas clientes têm acesso aos cupons',
        );
    }
  }

  private async mapear(cupom: any) {
    return {
      id: cupom.id,
      codigo: cupom.cupom.Codigo,
      desconto: cupom.taxa,
      usoMaximo: cupom.usosMaximos,
      utilizado: await this.prisma.desconto.count({
        where: { cupomId: cupom.cupomId },
      }),
      ativo: cupom.ativo,
    };
  }

  private async listarCupomAdmin(
    mostrarInativos = false,
    paginaAtual = 1,
    totalPaginas = 10,
  ) {
    const where: Prisma.CupomAdminWhereInput = {
      ativo: mostrarInativos ? undefined : true,
    };

    return {
      dados: await Promise.all(
        (
          await this.prisma.cupomAdmin.findMany({
            include: { cupom: true },
            where,
            skip: paginaAtual > 0 ? (paginaAtual - 1) * totalPaginas : 0,
            take: totalPaginas,
            orderBy: {
              id: 'desc',
            },
          })
        ).map(this.mapear),
      ),
      paginas: Math.ceil(
        (await this.prisma.cupomAdmin.count({
          where,
        })) / totalPaginas,
      ),
    };
  }

  private async listarCupomPorId(id: number) {
    return this.mapear(
      await this.prisma.cupomAdmin.findUnique({
        where: {
          id,
        },
      }),
    );
  }

  private async listarCupomPorUsuario(usuario: DadosUsuarioLogado) {
    if (usuario.cupom) return usuario.cupom;

    const cupom = await this.gerarCupom();

    await this.prisma.usuario.update({
      data: {
        cupomId: cupom.id,
      },
      where: {
        id: usuario.id,
      },
    });

    return cupom;
  }

  private async gerarCupom() {
    const caracteres: string[] = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
    ];
    let novoCupom: string;

    do {
      novoCupom = '';
      for (let i = 0; i < 6; i++)
        novoCupom += caracteres[Math.floor(Math.random() * caracteres.length)];
    } while (
      (await this.prisma.cupom.findFirst({ where: { codigo: novoCupom } })) !=
      null
    );

    var cupom = await this.prisma.cupom.create({
      data: {
        codigo: novoCupom,
      },
    });

    return cupom;
  }
}
