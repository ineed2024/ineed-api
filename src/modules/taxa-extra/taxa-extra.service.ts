import { DadosUsuarioLogado } from 'src/shared/entities/dados-usuario-logado.entity';
import { CriarTaxaExtra } from './dto/criar-taxa-extra.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { PushNotificationService } from 'src/shared/services/push-notification/push-notification.service';
import { PerfilEnum } from 'src/shared/enums/perfil.enum';
import { PagarTaxaExtra } from './dto/pagar-taxa-extra.dto';
import { TipoTaxaExtraEnum } from './enums/tipo-taxa-extra.enum';
import { EfiPayService } from 'src/shared/services/efi-pay/efi-pay.service';

@Injectable()
export class TaxaExtraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly efiPayService: EfiPayService,
  ) {}

  async criar(usuario: DadosUsuarioLogado, criarTaxaExtra: CriarTaxaExtra) {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: {
        id: criarTaxaExtra.orcamentoId,
      },
    });

    if (!orcamento) throw new BadRequestException('Orçamento não encontrado');

    const solicitacao = await this.prisma.solicitacao.findUnique({
      where: {
        id: orcamento.solicitacaoId,
      },
    });

    if (usuario.perfilId != PerfilEnum.FORNECEDOR) {
      throw new BadRequestException(
        'Você não é um fornecedor para inserir uma taxa extra.',
      );
    }

    if (orcamento.concluido) {
      throw new BadRequestException(
        'Não podemos adicionar uma taxa extra em um orçamento concluído.',
      );
    }

    if (criarTaxaExtra.valor <= 0) {
      throw new BadRequestException('A taxa não pode ser nula ou negativa.');
    }

    const configuracao = await this.prisma.configuracao.findFirst();

    const qtdTaxas = await this.prisma.taxaExtra.count({
      where: {
        orcamentoId: orcamento.id,
      },
    });

    if (qtdTaxas >= configuracao.maximoOrcamentos) {
      throw new BadRequestException(
        'O Orçamento atingiu o número máximo de taxas extras.',
      );
    }

    const taxaExtra = await this.prisma.taxaExtra.create({
      data: {
        orcamentoId: criarTaxaExtra.orcamentoId,
        valor: criarTaxaExtra.valor,
        pago: false,
      },
    });

    const data = {
      status: 'orcamento-taxa-extra',
      solicitacaoId: orcamento.solicitacaoId,
      valor: taxaExtra.valor.toNumber().toLocaleString('pt-BR'),
    };

    await this.enviarNotificacaoPush(
      solicitacao.usuarioId,
      data,
      TipoTaxaExtraEnum.CADASTRO,
    );
  }

  async pagar(usuario: DadosUsuarioLogado, pagarTaxaExtra: PagarTaxaExtra) {
    return this.prisma.$transaction(
      async (transaction) => {
        let taxaExtra = await transaction.taxaExtra.findUnique({
          where: {
            id: pagarTaxaExtra.id,
          },
        });

        if (taxaExtra.pago) throw new BadRequestException('A taxa já foi paga');

        const orcamento = await transaction.orcamento.findUnique({
          where: {
            id: taxaExtra.orcamentoId,
          },
        });

        if (!orcamento)
          throw new BadRequestException('Orçamento não encontrado');

        const solicitacao = await transaction.solicitacao.findUnique({
          where: {
            id: orcamento.solicitacaoId,
          },
        });

        if (usuario.perfilId != PerfilEnum.CLIENTE)
          throw new BadRequestException(
            'Você não é um cliente para pagar uma taxa extra',
          );

        if (usuario.id != solicitacao.usuarioId)
          throw new BadRequestException(
            'Usuário sem permissão para concluir pagamento',
          );

        const cartao = await transaction.creditCardEfi.findFirst({
          where: {
            id: pagarTaxaExtra.requisicao.cartaoId,
            userId: usuario.id,
          },
        });

        if (!cartao) throw new BadRequestException('Cartão não encontrado');

        await this.efiPayService.gerarCobranca({
          valor: taxaExtra.valor.toNumber(),
          parcela: pagarTaxaExtra.requisicao.parcela,
          token: cartao.cardToken,
          usuarioId: usuario.id,
        });

        taxaExtra = await transaction.taxaExtra.update({
          data: {
            pago: true,
          },
          where: {
            id: pagarTaxaExtra.id,
          },
        });

        const data = {
          status: 'orcamento-taxa-extra',
          solicitacaoId: orcamento.solicitacaoId,
          valor: taxaExtra.valor.toNumber().toLocaleString('pt-BR'),
        };

        await this.enviarNotificacaoPush(
          solicitacao.usuarioId,
          data,
          TipoTaxaExtraEnum.PAGAMENTO,
        );

        return taxaExtra;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  private async enviarNotificacaoPush(
    usuarioId: number,
    data: Record<string, any>,
    tipo: TipoTaxaExtraEnum,
  ) {
    const destinatario = await this.prisma.usuario.findUnique({
      include: {
        acesso: true,
      },
      where: {
        id: usuarioId,
      },
    });

    let titulo = '';
    let mensagem = ``;

    switch (tipo) {
      case TipoTaxaExtraEnum.CADASTRO:
        titulo = 'Nova taxa extra';
        mensagem = `Sua obra possui uma nova taxa extra de ${data.valor}`;
        break;
      case TipoTaxaExtraEnum.PAGAMENTO:
        titulo = 'Taxa extra paga';
        mensagem = `A taxa no valor de ${data.valor} foi paga ♥`;
        break;
    }

    if (titulo) {
      await this.pushNotificationService.enviarNotificacaoPush(
        destinatario.acesso.map((acesso) => acesso.FcmToken),
        titulo,
        mensagem,
        data,
      );
    }
  }
}
