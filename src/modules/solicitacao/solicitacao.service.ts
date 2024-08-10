import { S3Service } from './../../shared/services/s3/s3.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { FiltroListarSolicitacaoDto } from './dto/filtro-listar-solicitacao.dto';
import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { PerfilEnum } from 'src/shared/enums/perfil.enum';
import { Prisma } from '@prisma/client';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';
import { MailService } from 'src/shared/services/mail/mail.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SolicitacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly s3Service: S3Service,
  ) {}

  async listar(
    usuario: DadosUsuarioLogado,
    filtroListarSolicitacaoDto: FiltroListarSolicitacaoDto,
  ) {
    if (filtroListarSolicitacaoDto.id) {
      const solicitacao = await this.listarPorId(filtroListarSolicitacaoDto.id);

      return this.listarDados(solicitacao);
    }

    const solicitacoes = await this.listarPorFiltros(
      usuario,
      filtroListarSolicitacaoDto,
    );

    await Promise.all(
      solicitacoes.map(async (solicitacao) => ({
        ...(await this.listarDados(solicitacao)).solicitacao,
      })),
    );

    return solicitacoes;
  }

  async deletar(id: number, usuario: DadosUsuarioLogado) {
    const solicitacao = await this.prisma.solicitacao.findUnique({
      where: {
        id,
      },
    });

    if (!solicitacao) throw new ForbiddenException('Solicitação inválida.');

    if (!solicitacao.ativo)
      throw new ForbiddenException(
        'A ação que você está tentando executar já foi executada',
      );

    if (
      usuario.perfilId == PerfilEnum.CLIENTE &&
      solicitacao.usuarioId != usuario.id
    )
      throw new ForbiddenException('A solicitação não pertence a esse usuário');

    const orcamento = await this.prisma.orcamento.findFirst({
      where: {
        solicitacaoId: solicitacao.id,
      },
    });

    const taxaExtra = await this.prisma.taxaExtra.findFirst({
      where: {
        orcamentoId: orcamento.id,
      },
    });

    if (
      (orcamento != null && orcamento.pago) ||
      (taxaExtra != null && taxaExtra.pago)
    )
      throw new BadRequestException(
        'Esta ação não pode ser feita, pois uma operação financeira já foi realizada.',
      );

    return this.prisma.solicitacao.update({
      data: {
        ativo: false,
      },
      where: {
        id,
      },
    });
  }

  async criar(
    usuarioId: number,
    criarSolicitacaoDto: CriarSolicitacaoDto,
    files: Array<Express.Multer.File>,
  ) {
    const solicitacao = await this.prisma.$transaction(
      async (transaction) => {
        let solicitacao = await transaction.solicitacao.findFirst({
          where: {
            usuarioId,
            dataInicial: criarSolicitacaoDto.dataInicial,
            urgente: criarSolicitacaoDto.urgente,
            dataFinal: criarSolicitacaoDto.dataFinal,
            endereco: criarSolicitacaoDto.endereco,
            observacao: criarSolicitacaoDto.observacao,
            material: criarSolicitacaoDto.material,
            iMovelId: criarSolicitacaoDto.imovelId,
          },
        });

        if (solicitacao)
          throw new BadRequestException('Solicitação já cadastrada');

        solicitacao = await transaction.solicitacao.create({
          include: {
            servicoSolicitacao: {
              select: {
                servico: {
                  include: { categoria: true },
                },
              },
            },
            imagem: true,
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
          data: {
            dataSolicitacao: new Date(),
            usuarioId,
            dataInicial: criarSolicitacaoDto.dataInicial,
            urgente: criarSolicitacaoDto.urgente,
            dataFinal: criarSolicitacaoDto.dataFinal,
            endereco: criarSolicitacaoDto.endereco,
            observacao: criarSolicitacaoDto.observacao,
            material: criarSolicitacaoDto.material,
            iMovelId: criarSolicitacaoDto.imovelId,
            ativo: true,
            servicoSolicitacao: {
              createMany: {
                data: criarSolicitacaoDto.servicoId.map((servicoId) => ({
                  servicoId,
                })),
              },
            },
          },
        });

        for (const file in files) {
          const url = await this.s3Service.upload(files[file]);

          await transaction.imagemSolicitacao.create({
            data: {
              solicitacaoId: solicitacao.id,
              valor: url,
            },
          });
        }

        return solicitacao;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    const valores = [
      solicitacao.urgente ? 'Solicitação de extrema urgência!' : '',
      solicitacao.dataInicial.getFullYear() > 1000
        ? `Data inicial: ${solicitacao.dataInicial.toLocaleDateString('pt-BR')}`
        : '',
      solicitacao.dataSolicitacao.getFullYear() > 1000
        ? `Data da solicitação: ${solicitacao.dataSolicitacao.toLocaleDateString('pt-BR')}`
        : '',
      `Endereço: ${solicitacao.endereco}`,
      solicitacao.observacao != null && solicitacao.observacao != ''
        ? `◊Observação: ${solicitacao.observacao}`
        : '',
    ];

    await this.enviarNotificacao(solicitacao.usuarioId, valores);

    return solicitacao;
  }

  private async listarPorId(id: number) {
    const solicitacao = await this.prisma.solicitacao.findUnique({
      include: {
        servicoSolicitacao: {
          select: {
            servico: {
              include: { categoria: true },
            },
          },
        },
        imagem: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      where: {
        id,
      },
    });

    solicitacao['solicitacoes'] = solicitacao.servicoSolicitacao;

    delete solicitacao.servicoSolicitacao;

    if (!solicitacao)
      throw new BadRequestException('Não há solicitações para esse usuário');

    return solicitacao;
  }

  private async listarDados(solicitacao: any) {
    const visita = await this.prisma.visita.findFirst({
      include: {
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
      },
      where: {
        solicitacaoId: solicitacao.id,
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

    let orcamento: any = await this.prisma.orcamento.findFirst({
      select: {
        id: true,
        usuarioId: true,
        dataEntrega: true,
        dataCriacao: true,
        solicitacaoId: true,
        observacao: true,
        maoObra: true,
        concluido: true,
        pago: true,
        material: true,
        diarioObra: true,
        requisicaoId: true,
        avaliacaoId: true,
        transacaoId: true,
        imagem: true,
        usuarioColaborador: true,
        requisicao: {
          include: {
            usuario: true,
          },
        },
        avaliacao: true,
        solicitacao: true,
        taxasExtras: true,
        transacao: true,
      },
      where: {
        solicitacaoId: solicitacao.id,
      },
    });

    if (orcamento) {
      const descontoData = await this.prisma.desconto.findFirst({
        where: {
          userId: solicitacao.usuarioId,
          ativado: false,
        },
        orderBy: {
          taxa: 'desc',
        },
      });

      if (descontoData) orcamento['desconto'] = descontoData.taxa;
      else orcamento['desconto'] = 0;
    } else {
      orcamento = {
        id: 0,
        solicitacaoId: 0,
        dataEntrega: '0001-01-01T00:00:00',
        dataCriacao: '0001-01-01T00:00:00',
        material: new Decimal(0.0),
        maoObra: new Decimal(0.0),
        pago: false,
        desconto: 0,
        concluido: false,
      };
    }

    solicitacao['visita'] = visita;
    if (orcamento.id != 0) solicitacao['orcamento'] = orcamento;

    return {
      solicitacao,
      visita,
      orcamento,
    };
  }

  private async listarPorFiltros(
    usuario: DadosUsuarioLogado,
    filtroListarSolicitacaoDto: FiltroListarSolicitacaoDto,
  ) {
    const include = this.getTabelas(filtroListarSolicitacaoDto);
    const where = this.getFiltros(filtroListarSolicitacaoDto);

    let solicitacoes;
    switch (usuario.perfilId) {
      case PerfilEnum.CLIENTE:
        solicitacoes = await this.prisma.solicitacao.findMany({
          include: {
            ...include,
            servicoSolicitacao: {
              select: {
                servico: {
                  include: { categoria: true },
                },
              },
            },
            imagem: true,
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
          where: {
            ...where,
            usuarioId: usuario.id,
          },
          orderBy: {
            dataSolicitacao: 'desc',
          },
        });
        break;

      case PerfilEnum.ADMIN:
      case PerfilEnum.COLABORADOR:
      case PerfilEnum.FORNECEDOR:
        solicitacoes = await this.prisma.solicitacao.findMany({
          include: {
            ...include,
            servicoSolicitacao: {
              select: {
                servico: {
                  include: { categoria: true },
                },
              },
            },
            imagem: true,
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
          where,
          orderBy: {
            dataSolicitacao: 'desc',
          },
        });
        break;
    }

    return solicitacoes.map((solicitacao) => ({
      ...solicitacao,
      nomeCliente: solicitacao.usuario.nome,
      emailCliente: solicitacao.usuario.email,
    }));
  }

  private getFiltros(
    filtroListarSolicitacaoDto: FiltroListarSolicitacaoDto,
  ): Prisma.SolicitacaoWhereInput {
    if (
      !filtroListarSolicitacaoDto.filtrarPor ||
      !filtroListarSolicitacaoDto.filtrarPor.length ||
      filtroListarSolicitacaoDto.filtrarPor.includes('')
    )
      return {
        orcamentos: {
          every: {
            OR: [
              {
                concluido: false,
              },
              {
                avaliacaoId: null,
              },
            ],
          },
        },
        ativo: true,
      };

    return {
      id: filtroListarSolicitacaoDto.filtrarPor?.includes('id')
        ? +filtroListarSolicitacaoDto.filtrarValor.at(
            filtroListarSolicitacaoDto.filtrarPor?.findIndex(
              (value) => value == 'id',
            ),
          )
        : undefined,
      endereco: filtroListarSolicitacaoDto.filtrarPor?.includes('endereco')
        ? filtroListarSolicitacaoDto.filtrarValor.at(
            filtroListarSolicitacaoDto.filtrarPor?.findIndex(
              (value) => value == 'endereco',
            ),
          )
        : undefined,
      dataFinal: filtroListarSolicitacaoDto.filtrarPor?.includes('dataFinal')
        ? filtroListarSolicitacaoDto.filtrarValor.at(
            filtroListarSolicitacaoDto.filtrarPor?.findIndex(
              (value) => value == 'dataFinal',
            ),
          )
        : undefined,
      servicoSolicitacao:
        filtroListarSolicitacaoDto.filtrarPor?.includes('categoriaId') ||
        filtroListarSolicitacaoDto.filtrarPor?.includes('servicoId')
          ? {
              some: {
                servico: filtroListarSolicitacaoDto.filtrarPor?.includes(
                  'categoriaId',
                )
                  ? {
                      categoriaId: +filtroListarSolicitacaoDto.filtrarValor.at(
                        filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                          (value) => value == 'categoriaId',
                        ),
                      ),
                    }
                  : undefined,
                servicoId: filtroListarSolicitacaoDto.filtrarPor?.includes(
                  'servicoId',
                )
                  ? +filtroListarSolicitacaoDto.filtrarValor.at(
                      filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                        (value) => value == 'servicoId',
                      ),
                    )
                  : undefined,
              },
            }
          : undefined,
      usuario:
        filtroListarSolicitacaoDto.filtrarPor?.includes('emailCliente') ||
        filtroListarSolicitacaoDto.filtrarPor?.includes('nomeCliente')
          ? {
              nome: filtroListarSolicitacaoDto.filtrarPor?.includes(
                'nomeCliente',
              )
                ? {
                    contains: filtroListarSolicitacaoDto.filtrarValor.at(
                      filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                        (value) => value == 'nomeCliente',
                      ),
                    ),
                  }
                : undefined,
              email: filtroListarSolicitacaoDto.filtrarPor?.includes(
                'emailCliente',
              )
                ? {
                    contains: filtroListarSolicitacaoDto.filtrarValor.at(
                      filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                        (value) => value == 'emailCliente',
                      ),
                    ),
                  }
                : undefined,
            }
          : undefined,
      ativo:
        (filtroListarSolicitacaoDto.filtrarPor?.includes('exibirCancelados') &&
          ['false', '0'].includes(
            filtroListarSolicitacaoDto.filtrarValor.at(
              filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                (value) => value == 'exibirCancelados',
              ),
            ),
          )) ||
        (filtroListarSolicitacaoDto.filtrarPor?.includes('ativo') &&
          ['true', '1'].includes(
            filtroListarSolicitacaoDto.filtrarValor.at(
              filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                (value) => value == 'ativo',
              ),
            ),
          )) ||
        undefined,

      orcamentos: {
        every:
          filtroListarSolicitacaoDto.filtrarPor?.includes('exibirConcluidos') &&
          ['false', '0'].includes(
            filtroListarSolicitacaoDto.filtrarValor.at(
              filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                (value) => value == 'exibirConcluidos',
              ),
            ),
          )
            ? {
                OR: [
                  {
                    concluido: false,
                  },
                  {
                    avaliacaoId: null,
                  },
                ],
              }
            : undefined,
        some: filtroListarSolicitacaoDto.filtrarPor?.includes('status')
          ? {
              OR: [
                +filtroListarSolicitacaoDto.filtrarValor.at(
                  filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                    (value) => value == 'status',
                  ),
                ) == 3
                  ? {
                      pago: false,
                      taxasExtras: {
                        some: {},
                      },
                    }
                  : null,

                +filtroListarSolicitacaoDto.filtrarValor.at(
                  filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                    (value) => value == 'status',
                  ),
                ) == 4
                  ? {
                      pago: true,
                      concluido: false,
                    }
                  : null,

                +filtroListarSolicitacaoDto.filtrarValor.at(
                  filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                    (value) => value == 'status',
                  ),
                ) == 5
                  ? {
                      pago: true,
                      concluido: true,
                      avaliacaoId: null,
                    }
                  : null,

                +filtroListarSolicitacaoDto.filtrarValor.at(
                  filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                    (value) => value == 'status',
                  ),
                ) == 6
                  ? {
                      pago: true,
                      concluido: true,
                      avaliacaoId: {
                        not: null,
                      },
                    }
                  : null,
              ].filter((value) => !!value),
            }
          : undefined,
        none:
          filtroListarSolicitacaoDto.filtrarPor?.includes(
            'exibirSemOrcamento',
          ) &&
          ['true', '1'].includes(
            filtroListarSolicitacaoDto.filtrarValor.at(
              filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                (value) => value == 'exibirSemOrcamento',
              ),
            ),
          )
            ? {}
            : undefined,
      },
      visitas:
        filtroListarSolicitacaoDto.filtrarPor?.includes('status') ||
        filtroListarSolicitacaoDto.filtrarPor?.includes('exibirSemVisita') ||
        filtroListarSolicitacaoDto.filtrarPor?.includes('exibirSemOrcamento')
          ? {
              some:
                filtroListarSolicitacaoDto.filtrarPor?.includes(
                  'exibirSemOrcamento',
                ) &&
                ['true', '1'].includes(
                  filtroListarSolicitacaoDto.filtrarValor.at(
                    filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                      (value) => value == 'exibirSemOrcamento',
                    ),
                  ),
                )
                  ? {}
                  : filtroListarSolicitacaoDto.filtrarPor?.includes('status') &&
                      +filtroListarSolicitacaoDto.filtrarValor.at(
                        filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                          (value) => value == 'status',
                        ),
                      ) == 2
                    ? {
                        pago: false,
                      }
                    : undefined,
              none:
                filtroListarSolicitacaoDto.filtrarPor?.includes(
                  'exibirSemVisita',
                ) &&
                ['true', '1'].includes(
                  filtroListarSolicitacaoDto.filtrarValor.at(
                    filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                      (value) => value == 'exibirSemVisita',
                    ),
                  ),
                )
                  ? {}
                  : undefined,
            }
          : undefined,
    };
  }

  private getTabelas(filtroListarSolicitacaoDto: FiltroListarSolicitacaoDto) {
    return filtroListarSolicitacaoDto?.filtrarPor?.includes('status')
      ? {
          orcamentos: [3, 4, 5, 6].includes(
            +filtroListarSolicitacaoDto.filtrarValor.at(
              filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                (value) => value == 'status',
              ),
            ),
          ),
          visitas: [1, 2].includes(
            +filtroListarSolicitacaoDto.filtrarValor.at(
              filtroListarSolicitacaoDto.filtrarPor?.findIndex(
                (value) => value == 'status',
              ),
            ),
          ),
        }
      : undefined;
  }

  private async enviarNotificacao(usuarioId: number, valores: string[] = []) {
    const destinatario = await this.prisma.usuario.findUnique({
      include: {
        acesso: true,
      },
      where: {
        id: usuarioId,
      },
    });

    await this.enviarEmail(destinatario.email, valores);
  }

  private async enviarEmail(email: string, valores: string[] = []) {
    const assunto = 'FixIt - Nova solicitação';
    let mensagem = `<div style="background-color: #DFDFDF; padding: 10px; min-height: 400px;"><div style="max-width: 800px; background-color: #ffffff; border: solid 1px #707070; border-radius: 3px; margin: 3em auto; padding: 0px;"><div style="text-align:center;"><img style="padding-top: 25px" src="http://fixit-togo.com.br/images/logo.png"></img><br/><div style="background-color: #3E3E3E; text-align: center;"><h1 style="font-family: sans-serif; font-size: 2em; color: #ffffff; padding: 0.5em">${assunto.substring(8)}</h1></div><div style="padding: 3em; ">Olá, <br/><br/>Uma nova solicitação foi criada,<br/>acesse o aplicativo do FixIt para visualizá-la.<br/>`;

    for (const valor in valores) {
      mensagem += `<br/>${valor}<br/>`;
    }

    mensagem += `<br/>Abraços da equipe FixIt.<br/></div></div></div><div style=\"color: #787878; text-align: center;\"><p>Não responda este e-mail, e-mail automático.</p><p>Aplicativo disponível na <a href=\"https://play.google.com/store/apps/details?id=br.com.prolins.fixitToGo\">Google Play</a> e na <a href=\"https://itunes.apple.com/br/app/fixit/id1373851231?mt=8\">App Store</a></p><p>Em caso de qualquer dúvida, fique à vontade<br/>para enviar um e-mail para <a href=\"mailto:fixit@fixit-togo.com.br\">fixit@fixit-togo.com.br</a></p></div>`;

    await this.mailService.enviarEmailHtml(email, assunto, mensagem);
  }
}
