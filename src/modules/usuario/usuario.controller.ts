import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Post,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { CadastrarUsuarioDto } from './dto/cadastrar-usuario.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { AtualizarAtributoUsuarioDto } from './dto/atualizar-atributo-usuario.dto';
import { AtualizarSenhaUsuarioDto } from './dto/atualizar-senha-usuario.dto';
import { FiltroListarTodosUsuarioDto } from './dto/filtro-listar-todos-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @UseGuards(AuthGuard)
  @Get('listar')
  async listarDados(@CurrentUser() usuario: DadosUsuarioLogado) {
    return {
      usuario: await this.usuarioService.listarDados(usuario),
    };
  }

  @Post('cadastrar')
  async cadastrar(@Body() cadastrarUsuarioDto: CadastrarUsuarioDto) {
    const data = await this.usuarioService.cadastrar(cadastrarUsuarioDto);

    return {
      nome: data.nome,
      usuario: data,
      message: 'Usuário cadastrado com sucesso',
    };
  }

  @Put('atualizar')
  @UseGuards(AuthGuard)
  async atualizar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto,
  ) {
    const data = await this.usuarioService.atualizar(
      usuario.id,
      atualizarUsuarioDto,
    );

    return {
      usuario: data,
      message: 'Usuário atualizado com sucesso',
    };
  }

  @Put('atualizar/atributo')
  @UseGuards(AuthGuard)
  async atualizarAtributo(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() atualizarAtributoUsuarioDto: AtualizarAtributoUsuarioDto,
  ) {
    const data = await this.usuarioService.atualizar(
      usuario.id,
      atualizarAtributoUsuarioDto,
    );

    return {
      usuario: data,
      message: 'Usuário atualizado com sucesso',
    };
  }

  @Patch('atualizarSenha')
  @UseGuards(AuthGuard)
  async atualizarSenha(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() atualizarSenhaUsuarioDto: AtualizarSenhaUsuarioDto,
  ) {
    const data = await this.usuarioService.atualizarSenha(
      usuario.id,
      atualizarSenhaUsuarioDto,
    );

    return {
      usuario: data,
      message: 'Senha atualizada com sucesso',
    };
  }

  @Get('listarTodos')
  @UseGuards(AuthGuard)
  async listarTodos(
    @Query() filtroListarTodosUsuarioDto: FiltroListarTodosUsuarioDto,
    @CurrentUser() usuario: DadosUsuarioLogado,
  ) {
    const data = await this.usuarioService.listarTodos(
      usuario,
      filtroListarTodosUsuarioDto,
    );

    return {
      usuario: data,
    };
  }

  @Delete()
  async deletar(@Query('id') id: string) {
    await this.usuarioService.deletar(+id);

    return {
      message: 'Usuário deletado',
    };
  }
}
