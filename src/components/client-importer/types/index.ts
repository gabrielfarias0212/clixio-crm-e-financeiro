
export type ImportOption = "skip" | "update" | "replace";

export interface ImportSummary {
  total: number;
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicateCount: number;
  importOption: ImportOption;
  setImportOption: (option: ImportOption) => void;
  onConfirm: () => Promise<void>;
}
