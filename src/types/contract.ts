
export interface ContractClause {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  category: string;
  variables: string[];
  is_required: boolean;
  is_default: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContractField {
  id: string;
  template_id: string;
  name: string;
  label: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
  required: boolean;
  default_value?: string;
  options?: string[];
  order_position: number;
  created_at?: string;
}

export interface ContractTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  category: string;
  description?: string;
  is_default: boolean;
  clauses_order: string[];
  created_at: string;
  updated_at: string;
}

export interface ContractVersion {
  id: string;
  template_id: string;
  version_number: number;
  content_snapshot: any;
  changes_description?: string;
  created_at: string;
  created_by: string;
}

export interface GeneratedContract {
  id: string;
  user_id: string;
  template_id: string;
  client_id?: string;
  title: string;
  filled_data: Record<string, any>;
  pdf_url?: string;
  status: 'draft' | 'completed' | 'sent' | 'signed';
  created_at: string;
  updated_at: string;
}

export interface ContractFormData {
  [key: string]: any;
}
