import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { encriptar } from 'src/shared/helpers/encrypt.helper';
import { gerarToken } from 'src/shared/helpers/token.helper';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto';
import { gerarSenhaPadrao } from 'src/shared/helpers/password.helper';
import { MailService } from 'src/shared/services/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto, device: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        email: loginDto.email,
        senha: encriptar(loginDto.senha),
      },
    });

    if (!usuario) throw new BadRequestException('Usuário ou senha incorretos');

    const token = gerarToken();

    await this.prisma.acesso.create({
      data: {
        UsuarioId: usuario.id,
        Token: token,
        Device: device,
      },
    });

    if (usuario)
      return {
        acept: ' Acesso permitido',
        device: device,
        perfilId: usuario.perfilId,
        usuarioId: usuario.id,
        token,
      };

    return;
  }

  async logout(token: string) {
    await this.prisma.acesso.deleteMany({
      where: {
        Token: token,
      },
    });

    return;
  }

  async recuperarSenha(recuperarSenhaDto: RecuperarSenhaDto) {
    return this.prisma.$transaction(
      async (transaction) => {
        const usuario = await this.prisma.usuario.findFirst({
          where: {
            email: recuperarSenhaDto.email,
          },
        });

        if (!usuario)
          throw new BadRequestException('Email de recuperação não encontrado');

        const novaSenha = gerarSenhaPadrao();

        await transaction.usuario.update({
          data: {
            senha: encriptar(novaSenha),
          },
          where: {
            id: usuario.id,
          },
        });

        const conteudoEmail = `<b> Você Solicitou a Recuperação de sua Senha<b/><b/><b/><br/> Nesse momento sua senha foi alterada, Por favor utilize essa senha padrão para logar com seu Email. <br/> <br/><b> Email : ${recuperarSenhaDto.email} <b/> <br/> <b> Senha : ${novaSenha} <b/>`;

        await this.mailService.enviarEmailHtml(
          recuperarSenhaDto.email,
          'Recuperação de senha',
          conteudoEmail,
        );
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }
}
