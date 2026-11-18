export type TipoLinhaCartao = "compra" | "estorno" | "credito_a_confirmar" | "tarifa";

export interface LinhaCartao {
  data: string; // ISO yyyy-mm-dd
  cartaoFinal: string;
  categoriaBanco: string | null; // categoria do banco: NÃO confiável
  descricao: string;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
  valor: number; // BRL, já somado ao IOF quando houver
  iof: number;
  usd: number | null;
  tipo: TipoLinhaCartao;
}

export type TipoLinhaConta =
  | "entrada" | "saida" | "pagamento_fatura" | "investimento" | "tarifa";

export interface LinhaConta {
  data: string;
  dataContabil: string;
  titulo: string;
  descricao: string;
  valor: number; // sempre positivo
  sentido: "entrada" | "saida";
  tipo: TipoLinhaConta;
}

export interface ResultadoParse<T> {
  linhas: T[];
  total: number; // soma com sinal (entradas - saídas / compras - créditos)
  avisos: string[];
}
