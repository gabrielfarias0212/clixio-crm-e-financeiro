
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm, Controller } from "react-hook-form";
import { CalendarEvent } from "@/utils/types";
import { Client } from "@/utils/types";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  initialData?: Partial<CalendarEvent>;
}

export function AddEventDialog({ 
  open, 
  onOpenChange, 
  clients,
  initialData 
}: AddEventDialogProps) {
  const { addEvent, updateEvent } = useCalendarEvents();
  const isEditing = !!initialData?.id;
  
  const { control, handleSubmit, reset, setValue } = useForm<CalendarEvent>({
    defaultValues: {
      id: '',
      title: '',
      description: '',
      date: new Date(),
      time: '10:00',
      type: 'custom',
      color: 'blue',
      clientId: undefined
    }
  });
  
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof CalendarEvent, value);
        }
      });
    } else {
      reset({
        id: '',
        title: '',
        description: '',
        date: new Date(),
        time: '10:00',
        type: 'custom',
        color: 'blue',
        clientId: undefined
      });
    }
  }, [initialData, setValue, reset, open]);

  const onSubmit = (data: CalendarEvent) => {
    try {
      if (isEditing) {
        updateEvent({...data});
        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso."
        });
      } else {
        addEvent({
          ...data,
          id: uuidv4()
        });
        toast({
          title: "Evento adicionado",
          description: "O evento foi adicionado com sucesso ao calendário."
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o evento.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Adicionar Evento"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize os detalhes do evento no calendário." 
              : "Adicione um novo evento ao calendário."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Título é obrigatório" }}
                render={({ field }) => (
                  <Input id="title" placeholder="Título do evento" {...field} />
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Evento</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Evento Personalizado</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="photoshoot">Ensaio Fotográfico</SelectItem>
                      <SelectItem value="delivery">Entrega</SelectItem>
                      <SelectItem value="editing">Prazo de Edição</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <Input id="time" type="time" {...field} />
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                      <SelectItem value="yellow">Amarelo</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="gray">Cinza</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Cliente Relacionado (opcional)</Label>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "none"}
                    defaultValue="none"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea id="description" placeholder="Descrição do evento" {...field} />
                )}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
