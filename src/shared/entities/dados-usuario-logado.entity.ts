export class DadosUsuarioLogado {
  id: number;
  email: string;
  telefone: string;
  token: string;
  perfilId: number;
  cupom: {
    id: number;
    codigo: string;
  } | null;
}
