
export interface Contract {
  id: string;
  user_id: string;
  template_id?: string;
  contract_type: string;
  contractor_name: string;
  contractor_email: string;
  contractor_phone: string;
  contractor_address: string;
  contractor_city: string;
  couple_names: string;
  data_evento: string;
  horario_cerimonia: string;
  event_city: string;
  event_address: string;
  guest_count: number;
  package_name: string;
  included_items: string;
  payment_method: string;
  amount: number;
  bride_rg: string;
  groom_rg: string;
  contract_content?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface ContractTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractFormData {
  contractorName: string;
  coupleNames: string;
  eventDate: string;
  brideRg: string;
  groomRg: string;
  cpf: string;
  phone: string;
  email: string;
  contractorAddress: string;
  contractorCity: string;
  eventCity: string;
  eventAddress: string;
  eventTime: string;
  guestCount: number;
  packageName: string;
  includedItems: string;
  paymentMethod: string;
  totalPrice: number;
  eventType: string;
}

export interface ContractPlaceholders {
  nomeContratante: string;
  nomeCasal: string;
  dataEvento: string;
  rg: string;
  cpf: string;
  telefone: string;
  email: string;
  enderecoContratante: string;
  cidadeContratante: string;
  cidadeEvento: string;
  enderecoEvento: string;
  horarioEvento: string;
  numeroConvidados: string;
  pacoteEscolhido: string;
  itensInclusos: string;
  formaPagamento: string;
  precoTotal: string;
  tipoEvento: string;
  dataAtual: string;
}
