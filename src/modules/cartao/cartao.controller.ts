import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CartaoService } from './cartao.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { CadastrarCartaoDto } from './dto/cadastrar-cartao.dto';

@UseGuards(AuthGuard)
@Controller('cartoes')
export class CartaoController {
  constructor(private readonly cartaoService: CartaoService) {}

  @Get()
  async listar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Query('id') cartaoId?: string,
  ) {
    const dados = await this.cartaoService.listar(
      cartaoId ? +cartaoId : null,
      usuario.id,
    );

    return dados;
  }

  @Post()
  async cadastrar(
    @CurrentUser() usuario: DadosUsuarioLogado,
    @Body() cadastrarCartaoDto: CadastrarCartaoDto,
  ) {
    const dados = await this.cartaoService.cadastrar(
      usuario.id,
      cadastrarCartaoDto,
    );

    return {
      message: 'Cartao cadastrado com sucesso',
      cartao: dados,
    };
  }

  @Delete()
  async deletar(@Query('id') cartaoId?: string) {
    await this.cartaoService.deletar(+cartaoId);

    return {
      message: 'Cartao removido com sucesso',
    };
  }
}
