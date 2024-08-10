import {
  Controller,
  Post,
  Body,
  Patch,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto, @Headers('device') device: string) {
    return this.authService.login(loginDto, device);
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() usuario: DadosUsuarioLogado) {
    await this.authService.logout(usuario.token);

    return {
      Message: 'Logout efetuado com sucesso',
    };
  }

  @Patch('recuperacaoSenha')
  async recuperarSenha(@Body() recuperarSenhaDto: RecuperarSenhaDto) {
    await this.authService.recuperarSenha(recuperarSenhaDto);

    return {
      message: '',
    };
  }
}
