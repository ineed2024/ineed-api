import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CadastrarCartaoDto } from './dto/cadastrar-cartao.dto';

@Injectable()
export class CartaoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(cartaoId: number, usuarioId: number) {
    if (cartaoId) return this.listarPorId(cartaoId);

    return this.listarTodos(usuarioId);
  }

  async cadastrar(usuarioId: number, cadastrarCartaoDto: CadastrarCartaoDto) {
    return this.prisma.creditCardEfi.create({
      select: {
        id: true,
        numberMask: true,
        userId: true,
        inativo: true,
      },
      data: {
        numberMask: cadastrarCartaoDto.numberMask,
        cardToken: cadastrarCartaoDto.cardToken,
        inativo: cadastrarCartaoDto.inativo,
        userId: usuarioId,
      },
    });
  }

  async deletar(cartaoId: number) {
    await this.listarPorId(cartaoId);

    await this.prisma.creditCardEfi.update({
      data: {
        cardToken: '',
        inativo: true,
      },
      where: {
        id: cartaoId,
      },
    });
  }

  private async listarTodos(usuarioId: number) {
    return this.prisma.creditCardEfi.findMany({
      select: {
        id: true,
        numberMask: true,
        userId: true,
        inativo: true,
      },
      where: {
        userId: usuarioId,
        inativo: false,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  private async listarPorId(cartaoId: number) {
    if (isNaN(cartaoId)) throw new BadRequestException('Cartão inválido');

    const cartao = await this.prisma.creditCardEfi.findFirst({
      select: {
        id: true,
        numberMask: true,
        userId: true,
        inativo: true,
      },
      where: {
        id: cartaoId,
        inativo: false,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!cartao) throw new BadRequestException('Cartão não encontrado');

    return cartao;
  }
}
