
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trash2, CheckCircle } from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { Client, CalendarEvent } from "@/utils/types";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClientMeetingsListProps {
  client: Client;
  refreshTrigger?: number;
}

export function ClientMeetingsList({ client, refreshTrigger }: ClientMeetingsListProps) {
  const [meetings, setMeetings] = useState<CalendarEvent[]>([]);
  const { events, deleteEvent } = useCalendarEvents();

  useEffect(() => {
    console.log("[ClientMeetingsList] Atualizando lista de reuniões");
    console.log("[ClientMeetingsList] Todos os eventos:", events);
    console.log("[ClientMeetingsList] Cliente ID:", client.id);
    
    // Filter meetings for this specific client - ONLY meetings, not pre-wedding
    const clientMeetings = events.filter(
      event => {
        console.log("[ClientMeetingsList] Verificando evento:", {
          id: event.id,
          type: event.type,
          clientId: event.clientId,
          title: event.title
        });
        return event.clientId === client.id && event.type === "meeting";
      }
    );
    
    console.log("[ClientMeetingsList] Reuniões filtradas:", clientMeetings);
    
    // Sort by date and time (most recent first)
    const sortedMeetings = clientMeetings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });

    setMeetings(sortedMeetings);
  }, [events, client.id, refreshTrigger]);

  const getMeetingStatus = (meeting: CalendarEvent) => {
    // Create date with noon time to avoid timezone issues
    const meetingDate = new Date(`${meeting.date}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (meetingDate < today) {
      return "realizada";
    } else {
      return "agendada";
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    console.log("[ClientMeetingsList] Cancelando reunião:", meetingId);
    try {
      await deleteEvent(meetingId);
      toast({
        title: "Reunião cancelada",
        description: "A reunião foi cancelada com sucesso."
      });
    } catch (error) {
      console.error("[ClientMeetingsList] Erro ao cancelar reunião:", error);
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao cancelar a reunião.",
        variant: "destructive"
      });
    }
  };

  const formatMeetingDate = (date: string) => {
    try {
      // Parse the YYYY-MM-DD date string with noon time to avoid timezone issues
      const parsedDate = new Date(`${date}T12:00:00`);
      return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("[ClientMeetingsList] Erro ao formatar data:", date, error);
      return date;
    }
  };

  if (meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reuniões Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhuma reunião agendada com este cliente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reuniões Agendadas ({meetings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((meeting) => {
          const status = getMeetingStatus(meeting);
          const isCompleted = status === "realizada";
          
          return (
            <div
              key={meeting.id}
              className={`border rounded-lg p-4 ${
                isCompleted ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">
                      {formatMeetingDate(meeting.date)}
                    </span>
                    <Clock className="h-4 w-4 text-gray-500 ml-2" />
                    <span className="text-sm text-gray-600">
                      {meeting.startTime} às {meeting.endTime}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {meeting.description?.split('\n')[0] || meeting.title}
                  </h4>
                  
                  {meeting.description?.includes('Observações:') && (
                    <p className="text-sm text-gray-600 mt-2">
                      {meeting.description.split('Observações: ')[1]}
                    </p>
                  )}
                  
                  <div className="mt-2">
                    <Badge
                      variant={isCompleted ? "secondary" : "default"}
                      className={
                        isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Realizada
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Agendada
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancelar reunião</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja cancelar esta reunião? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Manter</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancelar Reunião
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
