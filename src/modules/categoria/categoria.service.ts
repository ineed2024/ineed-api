import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Injectable()
export class CategoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.categoria.findMany({
      where: {
        inativo: false,
      },
      orderBy: {
        valor: 'desc',
      },
    });
  }

  async listarPorId(id: number) {
    if (isNaN(id)) throw new BadRequestException('Id inválido');

    return this.prisma.categoria.findFirst({
      where: {
        id,
      },
    });
  }
}
