import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Injectable()
export class ConfiguracaoService {
  constructor(private readonly prisma: PrismaService) {}

  async listarConfiguracao() {
    return this.prisma.configuracao.findFirst();
  }
}
