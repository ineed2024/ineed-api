import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VisitaService } from './visita.service';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { FiltroListarVisitaDto } from './dto/filtro-listar-visita.dto';
import { CadastrarVisitaDto } from './dto/cadastrar-visita.dto';
import { ConfirmarVisitaDto } from './dto/confirmar-visita.dto';
import { AvaliarVisitaDto } from './dto/avaliar-visita.dto';

@UseGuards(AuthGuard)
@Controller('visita')
export class VisitaController {
  constructor(private readonly visitaService: VisitaService) {}

  @Get()
  async listar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() filtroListarVisitaDto: FiltroListarVisitaDto,
    @Headers('Page') paginaAtual: string,
  ) {
    const dados = await this.visitaService.listar(
      usuario,
      filtroListarVisitaDto,
      +paginaAtual,
    );

    if (filtroListarVisitaDto.id) return dados;

    return {
      visitas: dados,
    };
  }

  @Post()
  async cadastrar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() cadastrarVisitaDto: CadastrarVisitaDto,
  ) {
    const dados = await this.visitaService.cadastrar(
      usuario,
      cadastrarVisitaDto,
    );

    return {
      message: 'Visita cadastrada com sucesso.',
      visita: dados,
    };
  }

  @Patch()
  async confirmar(
    @Query('id') visitaId: string,
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() confirmarVisitaDto: ConfirmarVisitaDto,
  ) {
    const dados = await this.visitaService.confirmar(
      +visitaId,
      usuario.id,
      confirmarVisitaDto,
    );

    return {
      message: 'Alteração salva com sucesso',
      visita: dados,
    };
  }

  @Patch('avaliacao')
  async avaliar(
    @Query('id') visitaId: string,
    @Body() avaliarVisitaDto: AvaliarVisitaDto,
  ) {
    const dados = await this.visitaService.avaliar(+visitaId, avaliarVisitaDto);

    return {
      message: 'Avaliação concluída',
      avaliacao: dados,
    };
  }

  @Delete()
  async deletar(@Query('id') visitaId: string) {
    await this.visitaService.deletar(+visitaId);

    return {
      message: 'Visita deletada',
    };
  }
}
