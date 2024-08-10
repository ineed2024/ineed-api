import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { CupomService } from './cupom.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { FiltroListarCupomDto } from './dto/filtro-listar-cupom.dto';

@Controller('cupom')
export class CupomController {
  constructor(private readonly cupomService: CupomService) {}

  @Get()
  @UseGuards(AuthGuard)
  async listar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() filtroListarCupomDto: FiltroListarCupomDto,
    @Headers('Page') pagina: string,
  ) {
    const dadosRetorno = await this.cupomService.listar(
      usuario,
      filtroListarCupomDto,
      +pagina,
    );

    return {
      maxPage: dadosRetorno.paginas || undefined,
      cupom: dadosRetorno.dados,
    };
  }
}
