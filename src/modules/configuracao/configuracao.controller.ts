import { Controller, Get } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';

@Controller('configuracao')
export class ConfiguracaoController {
  constructor(private readonly configuracaoService: ConfiguracaoService) {}

  @Get()
  async listarConfiguracao() {
    return {
      configuracao: await this.configuracaoService.listarConfiguracao(),
    };
  }
}
