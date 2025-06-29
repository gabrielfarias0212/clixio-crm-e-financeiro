
export interface TransactionImportData {
  date: string;
  description: string;
  amount: number;
  type?: 'entrada' | 'saída';
  category?: string;
  clientName?: string;
}

export interface ImportSummary {
  total: number;
  added: number;
  skipped: number;
  errors: number;
}

export type ImportOption = "skip" | "update";
