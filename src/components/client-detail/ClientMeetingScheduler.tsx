
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Plus } from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { Client, CalendarEvent } from "@/utils/types";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

interface ClientMeetingSchedulerProps {
  client: Client;
  onMeetingScheduled?: () => void;
}

export function ClientMeetingScheduler({ client, onMeetingScheduled }: ClientMeetingSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { addEvent } = useCalendarEvents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("[ClientMeetingScheduler] Iniciando agendamento de reunião");
    console.log("[ClientMeetingScheduler] Dados do formulário:", {
      date,
      startTime,
      endTime,
      subject,
      notes,
      clientId: client.id,
      clientName: client.name
    });
    
    if (!date || !startTime || !endTime || !subject.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validate that end time is after start time
    if (endTime <= startTime) {
      toast({
        title: "Horário inválido",
        description: "O horário de término deve ser posterior ao horário de início.",
        variant: "destructive"
      });
      return;
    }

    // Validate that date is not in the past - using string comparison to avoid timezone issues
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    if (date < todayString) {
      console.log("[ClientMeetingScheduler] Data inválida - passado:", { date, todayString });
      toast({
        title: "Data inválida",
        description: "Não é possível agendar reuniões em datas passadas.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create the meeting event with proper data
      const meetingEvent: CalendarEvent = {
        id: uuidv4(),
        title: `Reunião - ${client.name}`,
        description: `${subject}${notes ? `\n\nObservações: ${notes}` : ''}`,
        date: date, // Keep as YYYY-MM-DD string format
        startTime: startTime,
        endTime: endTime,
        type: "meeting", // Explicitly set as meeting type
        color: "blue", // Blue color for meetings
        clientId: client.id
      };

      console.log("[ClientMeetingScheduler] Evento de reunião criado:", meetingEvent);

      await addEvent(meetingEvent);

      console.log("[ClientMeetingScheduler] Reunião salva com sucesso");

      // Parse the date for display purposes only
      const displayDate = new Date(date + 'T12:00:00'); // Add noon time to avoid timezone issues
      const formattedDisplayDate = format(displayDate, 'dd/MM/yyyy');

      toast({
        title: "Reunião agendada",
        description: `Reunião com ${client.name} agendada para ${formattedDisplayDate} às ${startTime}.`
      });

      // Reset form
      setDate("");
      setStartTime("");
      setEndTime("");
      setSubject("");
      setNotes("");
      setOpen(false);
      
      if (onMeetingScheduled) {
        onMeetingScheduled();
      }
    } catch (error) {
      console.error("[ClientMeetingScheduler] Erro ao agendar reunião:", error);
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro ao agendar a reunião. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agendar Reunião
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar Reunião - {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Horário Início *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">Horário Término *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                placeholder="Ex: Apresentação de proposta"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais sobre a reunião..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Clock className="h-4 w-4 mr-2" />
              {loading ? "Agendando..." : "Agendar Reunião"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
