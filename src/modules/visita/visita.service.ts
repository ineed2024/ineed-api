import { CadastrarVisitaDto } from './dto/cadastrar-visita.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { FiltroListarVisitaDto } from './dto/filtro-listar-visita.dto';
import { PerfilEnum } from 'src/shared/enums/perfil.enum';
import { TipoVisitaEnum } from './enums/tipo-visita.enum';
import { PushNotificationService } from 'src/shared/services/push-notification/push-notification.service';
import { MailService } from 'src/shared/services/mail/mail.service';
import { SmsService } from 'src/shared/services/sms/sms.service';
import { ConfirmarVisitaDto } from './dto/confirmar-visita.dto';
import { AvaliarVisitaDto } from './dto/avaliar-visita.dto';
import { EfiPayService } from 'src/shared/services/efi-pay/efi-pay.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VisitaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly efiPayService: EfiPayService,
  ) {}

  async listar(
    usuario: DadosUsuarioLogado,
    filtroListarVisitaDto: FiltroListarVisitaDto,
    paginaAtual = 1,
  ) {
    if (filtroListarVisitaDto.id) {
      return this.listarPorId(filtroListarVisitaDto.id);
    } else {
      return this.listarTodos(usuario.id, usuario.perfilId, paginaAtual);
    }
  }

  async cadastrar(
    usuario: DadosUsuarioLogado,
    cadastrarVisitaDto: CadastrarVisitaDto,
  ) {
    const solicitacao = await this.prisma.solicitacao.findFirst({
      where: {
        id: cadastrarVisitaDto.solicitacaoId,
      },
    });

    if (!solicitacao)
      throw new BadRequestException('Solicitação não encontrada');

    let visita = await this.prisma.visita.findFirst({
      where: {
        solicitacaoId: cadastrarVisitaDto.solicitacaoId,
      },
    });

    if (visita)
      throw new BadRequestException(
        'Já existe uma visita cadastrada para essa solicitação',
      );

    if (usuario.perfilId != PerfilEnum.FORNECEDOR)
      throw new BadRequestException('Usuário não tem perfil de fornecedor');

    const qtdUsuarios = await this.prisma.usuario.count({
      where: {
        id: {
          in: cadastrarVisitaDto.usuarioColaboradorId,
        },
      },
    });

    if (qtdUsuarios < cadastrarVisitaDto.usuarioColaboradorId.length)
      throw new BadRequestException(
        'Os colaboradores selecionados não são válidos',
      );

    visita = await this.prisma.visita.create({
      data: {
        dataCriacao: new Date(),
        dataVisita: cadastrarVisitaDto.dataVisita,
        concluida: cadastrarVisitaDto.concluida,
        observacao: cadastrarVisitaDto.observacao,
        solicitacaoId: cadastrarVisitaDto.solicitacaoId,
        pago: cadastrarVisitaDto.pago,
        valor: cadastrarVisitaDto.valor,
        usuarioColaborador: {
          createMany: {
            data: cadastrarVisitaDto.usuarioColaboradorId.map((usuarioId) => ({
              usuarioColaboradorId: usuarioId,
            })),
          },
        },
      },
    });

    const valores = [
      `Data da criação: ${visita.dataCriacao.toLocaleString('pt-BR')}`,
      `Data da visita: ${visita.dataVisita.toLocaleString('pt-BR')}`,
      `Valor: R$ ${visita.valor.toNumber().toLocaleString('pt-BR')}`,
    ];

    const data = {
      status: 'visita-criada',
      visitaId: visita.id,
      solicitacaoId: solicitacao.id,
      hasMaterial: solicitacao.material,
    };

    await this.enviarNotificacao(
      solicitacao.usuarioId,
      valores,
      data,
      TipoVisitaEnum.CADASTRO,
    );

    return visita;
  }

  async confirmar(
    visitaId: number,
    usuarioId: number,
    confirmarVisitaDto: ConfirmarVisitaDto,
  ) {
    if (isNaN(visitaId)) throw new BadRequestException('Visita inválida');

    return this.prisma.$transaction(
      async (transaction) => {
        let visita;
        const include = {
          avaliacao: true,
          requisicao: {
            include: {
              usuario: true,
            },
          },
          transacao: true,
          solicitacao: {
            include: {
              servicoSolicitacao: {
                include: {
                  servico: {
                    include: {
                      categoria: true,
                    },
                  },
                },
              },
            },
          },
        };

        if (confirmarVisitaDto.concluida) {
          visita = await transaction.visita.update({
            include,
            data: {
              concluida: true,
            },
            where: {
              id: visitaId,
            },
          });
        } else if (confirmarVisitaDto.pago) {
          if (confirmarVisitaDto.valor > 0) {
            const cartao = await transaction.creditCardEfi.findFirst({
              where: {
                userId: usuarioId,
              },
              orderBy: {
                id: 'desc',
              },
            });

            if (!cartao) throw new BadRequestException('Cartão não encontrado');

            const requisicaoEfiPay = await this.efiPayService.gerarCobranca({
              valor: confirmarVisitaDto.valor,
              parcela: 1,
              token: cartao.cardToken,
              usuarioId,
            });

            const idCobranca = uuid().substring(0, 15);

            const requisicao = await transaction.requisicao.create({
              data: {
                merchantOrderId: idCobranca,
                chargeId: requisicaoEfiPay.charge_id,
                total: requisicaoEfiPay.total,
                status: requisicaoEfiPay.status,
                creditCardEfi_Id: cartao.id,
                cartaoId: cartao.id,
                parcela: requisicaoEfiPay.installments,
                usuarioId: usuarioId,
              },
            });

            visita = await transaction.visita.update({
              include,
              data: {
                pago: true,
                requisicaoId: requisicao.id,
              },
              where: {
                id: visitaId,
              },
            });
          } else {
            visita = await transaction.visita.update({
              include,
              data: {
                pago: true,
              },
              where: {
                id: visitaId,
              },
            });
          }
        } else {
          throw new BadRequestException('Dados inválidos');
        }

        const solicitacao = await transaction.solicitacao.findFirst({
          where: {
            id: visita.solicitacaoId,
          },
        });

        if (visita)
          visita['usuarioColaborador'] = await this.prisma.usuario.findMany({
            where: {
              visitaUsuarioColaborador: {
                some: {
                  visitaId: visita.id,
                },
              },
            },
          });

        const valores = [
          `Data da criação: ${visita.dataCriacao.toLocaleString('pt-BR')}`,
          `Data da visita: ${visita.dataVisita.toLocaleString('pt-BR')}`,
          `Valor: R$ ${visita.valor.toNumber().toLocaleString('pt-BR')}`,
        ];

        const data = {
          visitaId: visita.id,
          solicitacaoId: solicitacao.id,
          hasMaterial: solicitacao.material,
        };

        await this.enviarNotificacao(
          solicitacao.usuarioId,
          valores,
          data,
          TipoVisitaEnum.CADASTRO,
        );

        return visita;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  async avaliar(visitaId: number, avaliarVisitaDto: AvaliarVisitaDto) {
    if (isNaN(visitaId)) throw new BadRequestException('Visita inválida');

    return this.prisma.$transaction(
      async (transaction) => {
        const avaliacao = await transaction.avaliacao.create({
          data: {
            nota: avaliarVisitaDto.nota,
            observacao: avaliarVisitaDto.observacao,
          },
        });

        await transaction.visita.update({
          data: {
            avaliacaoId: avaliacao.id,
          },
          where: {
            id: visitaId,
          },
        });

        return avaliacao;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  async deletar(id: number) {
    if (isNaN(id)) throw new BadRequestException('Visita não encontrada');

    const visita = await this.prisma.visita.delete({
      where: {
        id,
      },
    });

    if (!visita) throw new BadRequestException('Visita não encontrada');

    return this.prisma.visita.delete({
      where: {
        id,
      },
    });
  }

  private async listarPorId(id: number) {
    const visita = await this.prisma.visita.findFirst({
      include: {
        avaliacao: true,
        requisicao: true,
        transacao: true,
        solicitacao: {
          include: {
            servicoSolicitacao: {
              include: {
                servico: {
                  include: {
                    categoria: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id,
      },
    });

    if (!visita) throw new BadRequestException('Visita não encontrada');

    visita['usuarioColaborador'] = await this.prisma.usuario.findMany({
      where: {
        visitaUsuarioColaborador: {
          some: {
            visitaId: visita.id,
          },
        },
      },
    });

    const solicitacao = await this.prisma.solicitacao.findUnique({
      include: {
        usuario: true,
      },
      where: {
        id: visita.solicitacaoId,
      },
    });

    const orcamento = await this.prisma.orcamento.count({
      where: {
        solicitacaoId: solicitacao.id,
      },
    });

    return {
      visita,
      solicitacao,
      hasOrcamento: orcamento > 0,
    };
  }

  private async listarTodos(
    usuarioId: number,
    perfilId: PerfilEnum,
    paginaAtual = 1,
    totalPaginas = 10,
  ) {
    let visitas = [];

    switch (perfilId) {
      case PerfilEnum.CLIENTE:
        visitas = await this.prisma.visita.findMany({
          include: {
            avaliacao: true,
            requisicao: true,
            transacao: true,
            solicitacao: {
              include: {
                servicoSolicitacao: {
                  include: {
                    servico: {
                      include: {
                        categoria: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where: {
            solicitacao: {
              usuarioId: usuarioId,
            },
          },
          orderBy: {
            dataCriacao: 'desc',
          },
          skip: paginaAtual > 0 ? (paginaAtual - 1) * totalPaginas : 0,
          take: totalPaginas,
        });
      case PerfilEnum.ADMIN:
      case PerfilEnum.FORNECEDOR:
        visitas = await this.prisma.visita.findMany({
          include: {
            avaliacao: true,
            requisicao: true,
            transacao: true,
            solicitacao: {
              include: {
                servicoSolicitacao: {
                  include: {
                    servico: {
                      include: {
                        categoria: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            dataCriacao: 'desc',
          },
          skip: paginaAtual > 0 ? (paginaAtual - 1) * totalPaginas : 0,
          take: totalPaginas,
        });
    }

    for (const visita of visitas) {
      visita['usuarioColaborador'] = await this.prisma.usuario.findMany({
        where: {
          visitaUsuarioColaborador: {
            some: {
              visitaId: visita.id,
            },
          },
        },
      });
    }

    // if (!visitas.length) throw new BadRequestException('Não há nenhuma visita');

    return visitas;
  }

  private async enviarNotificacao(
    usuarioId: number,
    valores: string[] = [],
    data: Record<string, any> = {},
    tipo: TipoVisitaEnum,
  ) {
    const destinatario = await this.prisma.usuario.findUnique({
      include: {
        acesso: true,
      },
      where: {
        id: usuarioId,
      },
    });

    await this.enviarSMS(destinatario.telefone, tipo);
    await this.enviarEmail(destinatario.email, valores, tipo);
    await this.enviarNotificacaoPush(
      destinatario.acesso.map((acesso) => acesso.FcmToken),
      data,
      tipo,
    );
  }

  private async enviarEmail(
    email: string,
    valores: string[] = [],
    tipo: TipoVisitaEnum,
  ) {
    let assunto = '';
    let mensagem = `<div style="background-color: #DFDFDF; padding: 10px; min-height: 400px;"><div style="max-width: 800px; background-color: #ffffff; border: solid 1px #707070; border-radius: 3px; margin: 3em auto; padding: 0px;"><div style="text-align:center;"><img style="padding-top: 25px" src="http://fixit-togo.com.br/images/logo.png"></img><br/>`;

    switch (tipo) {
      case TipoVisitaEnum.CADASTRO:
        assunto = 'FixIt - Nova visita agendada';
        mensagem += `<div style="background-color: #3E3E3E; text-align: center;"><h1 style="font-family: sans-serif; font-size: 2em; color: #ffffff; padding: 0.5em">${assunto.substring(8)}</h1></div><div style="padding: 3em; ">Olá, <br/><br/>Você tem uma nova visita agendada,<br/> acesse o aplicativo do FixIt para mais informações.<br />`;
        break;
      case TipoVisitaEnum.PAGAMENTO:
        assunto = 'FixIt - Visita confirmada';
        mensagem += `<div style="background-color: #3E3E3E; text-align: center;"><h1 style="font-family: sans-serif; font-size: 2em; color: #ffffff; padding: 0.5em">${assunto.substring(8)}</h1></div><div style="padding: 3em; ">Olá, <br/><br/>A sua visita foi confirmada,<br/>acesse o aplicativo do FixIt para mais informações.<br/>`;
        break;
      case TipoVisitaEnum.CONCLUIDO:
        assunto = 'FixIt - Visita concluída';
        mensagem += `<div style="background-color: #3E3E3E; text-align: center;"><h1 style="font-family: sans-serif; font-size: 2em; color: #ffffff; padding: 0.5em">${assunto.substring(8)}</h1></div><div style="padding: 3em; ">Olá, <br/><br/>Sua visita foi concluída,<br/>acesse o aplicativo do FixIt para avaliar.<br />`;
        break;
    }

    if (assunto) {
      for (const valor in valores) {
        mensagem += `<br/>${valor}<br/>`;
      }

      mensagem += `<br/>Abraços da equipe FixIt.<br/></div></div></div><div style="color: #787878; text-align: center;"><p>Não responda este e-mail, e-mail automático.</p><p>Aplicativo disponível na <a href="https://play.google.com/store/apps/details?id=br.com.prolins.fixitToGo">Google Play</a> e na <a href="https://itunes.apple.com/br/app/fixit/id1373851231?mt=8">App Store</a></p><p>Em caso de qualquer dúvida, fique à vontade<br/>para enviar um e-mail para <a href="mailto:fixit@fixit-togo.com.br">fixit@fixit-togo.com.br</a></p></div>`;

      await this.mailService.enviarEmailHtml(email, assunto, mensagem);
    }
  }

  private async enviarSMS(telefone: string, tipo: TipoVisitaEnum) {
    let mensagem;
    switch (tipo) {
      case TipoVisitaEnum.CONCLUIDO:
        mensagem =
          'Fixit: Sua visita foi concluida, acesse o aplicativo para avaliar.';
        break;
    }

    if (mensagem) await this.smsService.enviarSMS(telefone, mensagem);

    return;
  }

  private async enviarNotificacaoPush(
    tokens: string[],
    data: Record<string, any>,
    tipo: TipoVisitaEnum,
  ) {
    let titulo = '';
    let mensagem = ``;
    let status = ``;

    switch (tipo) {
      case TipoVisitaEnum.CADASTRO:
        titulo = 'Nova visita';
        mensagem = 'Uma nova visita foi criada. Deseja ver agora?';
        status = 'visita-criada';
        break;
      case TipoVisitaEnum.CONCLUIDO:
        titulo = 'Visita concluida';
        mensagem = 'Sua visita foi concluída. Deseja avaliar agora?';
        status = 'visita-concluida';
        break;
    }

    if (titulo)
      await this.pushNotificationService.enviarNotificacaoPush(
        tokens,
        titulo,
        mensagem,
        { status, ...data },
      );
  }
}
