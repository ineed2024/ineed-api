import { FiltroListarTodosUsuarioDto } from './dto/filtro-listar-todos-usuario.dto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CadastrarUsuarioDto } from './dto/cadastrar-usuario.dto';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { encriptar } from 'src/shared/helpers/encrypt.helper';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { AtualizarAtributoUsuarioDto } from './dto/atualizar-atributo-usuario.dto';
import { AtualizarSenhaUsuarioDto } from './dto/atualizar-senha-usuario.dto';
import { PerfilEnum } from 'src/shared/enums/perfil.enum';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async listarDados(usuario: DadosUsuarioLogado) {
    const dados = await this.prisma.usuario.findFirst({
      where: {
        id: usuario.id,
      },
    });

    dados.senha = null;

    return dados;
  }

  async cadastrar(cadastrarUsuarioDto: CadastrarUsuarioDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        email: cadastrarUsuarioDto.email,
      },
    });

    if (usuario) throw new BadRequestException('Usuário já cadastrado');

    return this.prisma.usuario.create({
      data: {
        email: cadastrarUsuarioDto.email,
        senha: encriptar(cadastrarUsuarioDto.senha),
        nome: cadastrarUsuarioDto.nome,
        perfilId: cadastrarUsuarioDto.perfilId,
        tipoId: cadastrarUsuarioDto.tipoId,
        endereco: cadastrarUsuarioDto.endereco || undefined,
        rg: cadastrarUsuarioDto.rg || undefined,
        cidade: cadastrarUsuarioDto.cidade || undefined,
        uf: cadastrarUsuarioDto.uf || undefined,
        cpfCnpj: cadastrarUsuarioDto.cpfCnpj || undefined,
        numero: cadastrarUsuarioDto.numero || undefined,
        imagemUrl: cadastrarUsuarioDto.imagemUrl || undefined,
        complemento: cadastrarUsuarioDto.complemento || undefined,
        cep: cadastrarUsuarioDto.cep || undefined,
        telefone: cadastrarUsuarioDto.telefone || undefined,
        dataAniversario: cadastrarUsuarioDto.dataAniversario || undefined,
        idTipoRedeSocial: cadastrarUsuarioDto.idTipoRedeSocial || 0,
        idRedeSocial: cadastrarUsuarioDto.idRedeSocial || undefined,
        cupomId: cadastrarUsuarioDto.cupomId || undefined,
        contaRedeSocial:
          cadastrarUsuarioDto.contaRedeSocial != null
            ? cadastrarUsuarioDto.contaRedeSocial
            : false,
        criadoEm: new Date(),
        inativo: false,
      },
    });
  }

  async atualizar(
    id: number,
    atualizarUsuarioDto: AtualizarUsuarioDto | AtualizarAtributoUsuarioDto,
  ) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id: id,
      },
    });

    if (!usuario) throw new BadRequestException('Usuário não cadastrado');

    if (atualizarUsuarioDto.email) {
      const emailExiste = await this.prisma.usuario.findFirst({
        where: {
          email: atualizarUsuarioDto.email,
          id: {
            not: id,
          },
        },
      });

      if (emailExiste) throw new BadRequestException('Email já cadastrado');
    }

    if (atualizarUsuarioDto.cpfCnpj) {
      const cpfCnpjExiste = await this.prisma.usuario.findFirst({
        where: {
          cpfCnpj: atualizarUsuarioDto.cpfCnpj,
          id: {
            not: id,
          },
        },
      });

      if (cpfCnpjExiste)
        throw new BadRequestException('CPF/CNPJ já cadastrado');
    }

    return this.prisma.usuario.update({
      include: { cupom: true, tipo: true },
      data: {
        email: atualizarUsuarioDto.email || undefined,
        senha: atualizarUsuarioDto.senha
          ? encriptar(atualizarUsuarioDto.senha)
          : undefined,
        nome: atualizarUsuarioDto.nome || undefined,
        perfilId: atualizarUsuarioDto.perfilId || undefined,
        tipoId: atualizarUsuarioDto.tipoId || undefined,
        endereco: atualizarUsuarioDto.endereco || undefined,
        rg: atualizarUsuarioDto.rg || undefined,
        cidade: atualizarUsuarioDto.cidade || undefined,
        uf: atualizarUsuarioDto.uf || undefined,
        cpfCnpj: atualizarUsuarioDto.cpfCnpj || undefined,
        numero: atualizarUsuarioDto.numero || undefined,
        imagemUrl: atualizarUsuarioDto.imagemUrl || undefined,
        complemento: atualizarUsuarioDto.complemento || undefined,
        cep: atualizarUsuarioDto.cep || undefined,
        telefone: atualizarUsuarioDto.telefone || undefined,
        dataAniversario: atualizarUsuarioDto.dataAniversario || undefined,
        idTipoRedeSocial: atualizarUsuarioDto.idTipoRedeSocial || undefined,
        idRedeSocial: atualizarUsuarioDto.idRedeSocial || undefined,
        cupomId: atualizarUsuarioDto.cupomId || undefined,
        contaRedeSocial:
          atualizarUsuarioDto.contaRedeSocial != null
            ? atualizarUsuarioDto.contaRedeSocial
            : undefined,
      },
      where: {
        id,
      },
    });
  }

  async atualizarSenha(
    id: number,
    atualizarSenhaUsuarioDto: AtualizarSenhaUsuarioDto,
  ) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id,
      },
    });

    if (!usuario) throw new BadRequestException('Usuário não cadastrado');

    const senhaAtualValida = await this.prisma.usuario.findFirst({
      where: {
        id,
        senha: encriptar(atualizarSenhaUsuarioDto.senhaAtual),
      },
    });

    if (!senhaAtualValida)
      throw new BadRequestException('Senha atual incorreta');

    await this.prisma.usuario.update({
      data: {
        senha: encriptar(atualizarSenhaUsuarioDto.novaSenha),
      },
      where: {
        id,
      },
    });
  }

  async listarTodos(
    usuario: DadosUsuarioLogado,
    filtroListarTodosUsuarioDto: FiltroListarTodosUsuarioDto,
  ) {
    if (![PerfilEnum.ADMIN, PerfilEnum.FORNECEDOR].includes(usuario.perfilId))
      throw new UnauthorizedException('O usuário não tem permissão de acesso');

    const listaUsuarios = await this.prisma.usuario.findMany({
      include: {
        tipo: true,
        cupom: true,
      },
      where: {
        OR: [
          {
            nome: {
              contains: filtroListarTodosUsuarioDto.nome,
            },
          },
          {
            email: {
              contains: filtroListarTodosUsuarioDto.nome,
            },
          },
        ],
        perfilId: filtroListarTodosUsuarioDto.profileId || undefined,
      },
    });

    listaUsuarios.forEach((item) => {
      item.senha = null;
    });

    return listaUsuarios;
  }

  async deletar(id: number) {
    if (isNaN(id)) throw new BadRequestException('Usuário não encontrado');

    const usuario = await this.prisma.usuario.update({
      data: {
        cpfCnpj: null,
        inativo: true,
      },
      where: {
        id,
      },
    });

    if (!usuario) throw new BadRequestException('Usuário não encontrado');

    return this.prisma.usuario.update({
      data: {
        cpfCnpj: null,
        inativo: true,
      },
      where: {
        id,
      },
    });
  }
}
