import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TaxaExtraService } from './taxa-extra.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { CriarTaxaExtra } from './dto/criar-taxa-extra.dto';
import { PagarTaxaExtra } from './dto/pagar-taxa-extra.dto';

@UseGuards(AuthGuard)
@Controller('taxa-extra')
export class TaxaExtraController {
  constructor(private readonly taxaExtraService: TaxaExtraService) {}

  @Post()
  async criar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() criarTaxaExtra: CriarTaxaExtra,
  ) {
    const dados = await this.taxaExtraService.criar(usuario, criarTaxaExtra);

    return {
      message: 'Taxa inserida com sucesso',
      taxa: dados,
    };
  }

  @Post()
  async pagar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() pagarTaxaExtra: PagarTaxaExtra,
  ) {
    const dados = await this.taxaExtraService.pagar(usuario, pagarTaxaExtra);

    return {
      taxa: dados,
    };
  }
}
