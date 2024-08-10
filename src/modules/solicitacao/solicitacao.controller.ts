import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { FiltroListarSolicitacaoDto } from './dto/filtro-listar-solicitacao.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { DeletarSolicitacaoDto } from './dto/deletar-solicitacao.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';

@Controller()
@UseGuards(AuthGuard)
export class SolicitacaoController {
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Get('listarSolicitacao')
  async listar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() filtroListarSolicitacaoDto: FiltroListarSolicitacaoDto,
  ) {
    const dados = await this.solicitacaoService.listar(
      usuario,
      filtroListarSolicitacaoDto,
    );

    if (Array.isArray(dados)) {
      if (dados.length)
        return {
          solicit: dados,
        };

      return {
        error: [],
      };
    }

    return dados;
  }

  @Get('solicitacao')
  async listar2(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() filtroListarSolicitacaoDto: FiltroListarSolicitacaoDto,
  ) {
    const dados = await this.solicitacaoService.listar(
      usuario,
      filtroListarSolicitacaoDto,
    );

    if (Array.isArray(dados)) {
      return {
        solicit: dados,
      };
    }

    return dados;
  }

  @Delete('solicitacao')
  async deletar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query() deletarSolicitacaoDto: DeletarSolicitacaoDto,
  ) {
    await this.solicitacaoService.deletar(deletarSolicitacaoDto.id, usuario);

    return {
      message: 'A solicitação foi excluída com sucesso!',
    };
  }

  @Post('solicitacaoComImagems')
  @UseInterceptors(AnyFilesInterceptor())
  async criar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() criarSolicitacaoDto: CriarSolicitacaoDto,
  ) {
    const solicitacao = await this.solicitacaoService.criar(
      usuario.id,
      criarSolicitacaoDto,
      files,
    );

    return {
      message: 'Solicitação cadastrada com sucesso',
      solicitacao,
    };
  }
}
