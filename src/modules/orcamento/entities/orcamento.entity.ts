import { Decimal } from '@prisma/client/runtime/library';

export class Orcamento {
  id: number;
  usuarioId: number;
  dataEntrega: Date;
  dataCriacao: Date;
  solicitacaoId: number;
  observacao: string;
  maoObra: Decimal;
  concluido: boolean;
  pago: boolean;
  material: Decimal;
  diarioObra: string;
  requisicaoId: number;
  avaliacaoId: number;
  transacaoId: number;

  imagem?: ImagemOrcamento[];
  requisicao?: Requisicao;
  avaliacao?: Avaliacao;
  solicitacao?: Solicitacao;
  taxasExtras?: TaxaExtra[];
  usuarioColaborador?: UsuarioColaborador[];
}

class Avaliacao {
  id: number;
  nota: number;
  observacao: string;
}

class ImagemSolicitacao {
  id: number;
  valor: string;
  solicitacaoId: number;
}

class Requisicao {
  id: number;
  merchantOrderId?: string;
  parcela: number;
  usuarioId: number;
  cartaoId: number;
  valorParcela: number;
  status?: string;
  tipoDePagamento?: string;
  chargeId: number;
  total: number;
  descricao?: string;
  creditCardEfi_Id?: number;
}

class Solicitacao {
  id: number;
  dataSolicitacao: Date;
  usuarioId: number;
  dataInicial?: Date;
  dataFinal?: Date;
  avaliacao?: number;
  endereco?: string;
  observacao?: string;
  material: boolean;
  urgente: boolean;
  iMovelId: number;
  ativo: boolean;

  imagem?: ImagemSolicitacao[];
  servicoSolicitacao: ServicoSolicitacao[];
  usuario: Usuario;
}

class ImagemOrcamento {
  id: number;
  valor: string;
  orcamentoId: number;
}

class ServicoSolicitacao {
  id: number;
  servicoId: number;
  solicitacaoId: number;
}

class UsuarioColaborador {
  orcamentoId: number;
  usuarioColaboradorId: number;
  usuario: Usuario;
}

class Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  rg?: string;
  cpfCnpj?: string;
  endereco?: string;
  numero?: number;
  cep?: string;
  telefone?: string;
  cidade?: string;
  imagemUrl?: string;
  uf?: string;
  perfilId: number;
  tipoId: number;
  dataAniversario?: Date;
  contaRedeSocial: Boolean;
  inativo: Boolean;
  complemento?: string;
  criadoEm: Date;
  idTipoRedeSocial: number;
  idRedeSocial?: string;
  cupomId?: number;
  bairro?: string;
}

class TaxaExtra {
  id: number;
  valor: number;
  pago: boolean;
  orcamentoId: number;
}
