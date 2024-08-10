import { FiltroListarOrcamentoDto } from './dto/filtro-listar-orcamento.dto';
import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrcamentoService } from './orcamento.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { CadastrarOrcamentoDto } from './dto/cadastrar-orcamento.dto';
import { AtualizarOrcamentoDto } from './dto/atualizar-orcamento.dto';
import { ConfirmarOrcamentoDto } from './dto/confirmar-orcamento.dto';
import { FinalizarOrcamentoDto } from './dto/finalizar-orcamento.dto';
import { AvaliarOrcamentoDto } from './dto/avaliar-orcamento.dto';

@Controller('orcamento')
export class OrcamentoController {
  constructor(private readonly orcamentoService: OrcamentoService) {}

  @Get()
  @UseGuards(AuthGuard)
  async listar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() filtroListarOrcamentoDto: FiltroListarOrcamentoDto,
    @Headers('Page') paginaAtual: string,
  ) {
    const dados = await this.orcamentoService.listar(
      usuario,
      filtroListarOrcamentoDto,
      +paginaAtual,
    );

    if (!filtroListarOrcamentoDto.id)
      return {
        listaorcamento: dados,
      };

    return {
      orcamento: dados,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async cadastrar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() cadastrarOrcamentoDto: CadastrarOrcamentoDto,
  ) {
    const dados = await this.orcamentoService.cadastrar(
      usuario,
      cadastrarOrcamentoDto,
    );

    return {
      orcamento: dados,
    };
  }

  @Put()
  @UseGuards(AuthGuard)
  async atualizar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() atualizarOrcamentoDto: AtualizarOrcamentoDto,
  ) {
    await this.orcamentoService.atualizar(usuario, atualizarOrcamentoDto);

    return;
  }

  @Patch('confirmar')
  @UseGuards(AuthGuard)
  async confirmar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() confirmarOrcamentoDto: ConfirmarOrcamentoDto,
  ) {
    return {
      orcamento: await this.orcamentoService.confirmar(confirmarOrcamentoDto),
    };
  }

  @Patch()
  @UseGuards(AuthGuard)
  async finalizar(
    @Query('id') id: string,
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() finalizarOrcamentoDto: FinalizarOrcamentoDto,
  ) {
    return {
      orcamento: await this.orcamentoService.finalizar(
        +id,
        usuario.id,
        finalizarOrcamentoDto,
      ),
      message: 'Alteração salva com sucesso',
    };
  }

  @Post('avaliacao')
  @UseGuards(AuthGuard)
  async avaliar(
    @Query('id') id: string,
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() avaliarOrcamentoDto: AvaliarOrcamentoDto,
  ) {
    return {
      message: 'Avaliação concluída',
      avaliar: await this.orcamentoService.avaliar(+id, avaliarOrcamentoDto),
    };
  }
}
