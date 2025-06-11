
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientStatus, NextAction } from "@/utils/types";

interface AutomationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newStatus: ClientStatus;
  currentAction: NextAction;
  suggestedAction: NextAction;
  onConfirm: () => void;
  onReject: () => void;
}

export function AutomationConfirmDialog({
  open,
  onOpenChange,
  newStatus,
  currentAction,
  suggestedAction,
  onConfirm,
  onReject
}: AutomationConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Automação da Próxima Ação</AlertDialogTitle>
          <AlertDialogDescription>
            O status foi alterado para "{newStatus}". 
            <br /><br />
            <strong>Ação atual:</strong> {currentAction}
            <br />
            <strong>Ação sugerida:</strong> {suggestedAction}
            <br /><br />
            Deseja aplicar a ação sugerida automaticamente?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReject}>
            Manter Ação Atual
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Aplicar Sugestão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
