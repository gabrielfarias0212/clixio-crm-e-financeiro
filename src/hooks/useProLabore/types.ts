
export type CalculationType = 'mensal' | 'semanal';

export interface ProLaboreConfig {
  id: string;
  user_id: string;
  percentual: number;
  tipo_calculo: CalculationType;
  base_calculo: string;
  created_at: string;
  updated_at: string;
}

export interface ProLaboreRegistro {
  id: string;
  user_id: string;
  valor: number;
  data: string;
  observacao?: string;
  tipo_calculo: CalculationType;
  periodo_referencia: string;
  created_at: string;
}
