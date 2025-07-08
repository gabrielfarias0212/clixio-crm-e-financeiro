
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Package, Undo2, Loader2 } from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { CalendarEvent } from "@/utils/types";
import { toast } from "sonner";
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

interface EventStatusActionsProps {
  event: CalendarEvent;
  onStatusUpdate?: () => void;
}

export function EventStatusActions({ event, onStatusUpdate }: EventStatusActionsProps) {
  const { updateEventStatus } = useCalendarEvents();
  const [loading, setLoading] = useState(false);
  const [showEditedDialog, setShowEditedDialog] = useState(false);
  const [showDeliveredDialog, setShowDeliveredDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);
  const [undoAction, setUndoAction] = useState<'edited' | 'delivered' | null>(null);

  const handleMarkAsEdited = async () => {
    setLoading(true);
    try {
      await updateEventStatus(event.id, { isEdited: true });
      toast.success("Evento marcado como editado!");
      onStatusUpdate?.();
    } catch (error) {
      toast.error("Erro ao atualizar status do evento");
    } finally {
      setLoading(false);
      setShowEditedDialog(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    setLoading(true);
    try {
      await updateEventStatus(event.id, { isDelivered: true });
      toast.success("Evento marcado como entregue!");
      onStatusUpdate?.();
    } catch (error) {
      toast.error("Erro ao atualizar status do evento");
    } finally {
      setLoading(false);
      setShowDeliveredDialog(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      const updates = undoAction === 'edited' 
        ? { isEdited: false } 
        : { isDelivered: false };
      
      await updateEventStatus(event.id, updates);
      
      const message = undoAction === 'edited' 
        ? "Evento desmarcado como editado" 
        : "Evento desmarcado como entregue";
      
      toast.success(message);
      onStatusUpdate?.();
    } catch (error) {
      toast.error("Erro ao desfazer ação");
    } finally {
      setLoading(false);
      setShowUndoDialog(false);
      setUndoAction(null);
    }
  };

  const openUndoDialog = (action: 'edited' | 'delivered') => {
    setUndoAction(action);
    setShowUndoDialog(true);
  };

  // Se o evento já foi editado e entregue, não mostra ações
  if (event.isEdited && event.isDelivered) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Concluído</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Botão para marcar como editado */}
      {!event.isEdited ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEditedDialog(true)}
          disabled={loading}
          className="text-xs"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Check className="h-3 w-3 mr-1" />
          )}
          Marcar como Editado
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <Check className="h-3 w-3" />
            Editado
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openUndoDialog('edited')}
            disabled={loading}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          >
            <Undo2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Botão para marcar como entregue (só aparece se já foi editado) */}
      {event.isEdited && !event.isDelivered ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeliveredDialog(true)}
          disabled={loading}
          className="text-xs"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Package className="h-3 w-3 mr-1" />
          )}
          Marcar como Entregue
        </Button>
      ) : event.isDelivered ? (
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Package className="h-3 w-3" />
            Entregue
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openUndoDialog('delivered')}
            disabled={loading}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          >
            <Undo2 className="h-3 w-3" />
          </Button>
        </div>
      ) : null}

      {/* Dialog de confirmação para marcar como editado */}
      <AlertDialog open={showEditedDialog} onOpenChange={setShowEditedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Editado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar "{event.title}" como editado? 
              Isso removerá o evento da lista de edição pendente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsEdited} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para marcar como entregue */}
      <AlertDialog open={showDeliveredDialog} onOpenChange={setShowDeliveredDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Entregue</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar "{event.title}" como entregue? 
              Isso finalizará completamente o processo deste evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsDelivered} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Package className="h-4 w-4 mr-2" />
              )}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para desfazer */}
      <AlertDialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desfazer Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desfazer a marcação de "{event.title}" como {undoAction === 'edited' ? 'editado' : 'entregue'}?
              O evento voltará para a lista de pendências.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUndo} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Undo2 className="h-4 w-4 mr-2" />
              )}
              Desfazer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
