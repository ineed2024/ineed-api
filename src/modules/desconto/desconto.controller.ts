import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DescontoService } from './desconto.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { FiltroListarCupomDto as FiltroListarDescontoDto } from '../cupom/dto/filtro-listar-cupom.dto';
import { AtivarDescontoDto } from './dto/ativar-desconto.dto';

@Controller('desconto')
export class DescontoController {
  constructor(private readonly descontoService: DescontoService) {}

  @Get()
  @UseGuards(AuthGuard)
  async listar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() filtroListarDescontoDto: FiltroListarDescontoDto,
  ) {
    return {
      descontos: await this.descontoService.listar(
        usuario,
        filtroListarDescontoDto,
      ),
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async ativar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() ativarDescontoDto: AtivarDescontoDto,
  ) {
    return {
      desconto: await this.descontoService.ativar(usuario, ativarDescontoDto),
      message: 'O desconto foi ativado com sucesso!',
    };
  }
}
