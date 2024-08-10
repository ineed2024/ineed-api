import { Controller, Get, Query } from '@nestjs/common';
import { ServicoService } from './servico.service';

@Controller()
export class ServicoController {
  constructor(private readonly servicoService: ServicoService) {}

  @Get('servico')
  async listar(@Query('id') categoriaId: string) {
    return {
      servico: await this.servicoService.listar(+categoriaId),
    };
  }

  @Get('listarservico')
  async listarTodos() {
    return {
      servico: await this.servicoService.listarTodos(),
    };
  }
}
