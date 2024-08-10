import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Injectable()
export class ServicoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(categoriaId: number) {
    return this.prisma.servico.findMany({
      include: {
        categoria: true,
      },
      where: {
        categoriaId,
        inativo: false,
      },
    });
  }

  async listarTodos() {
    return this.prisma.servico.findMany({
      include: {
        categoria: true,
      },
      where: {
        inativo: false,
      },
    });
  }
}
