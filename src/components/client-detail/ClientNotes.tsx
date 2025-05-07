
import { Client } from "@/utils/types";

interface ClientNotesProps {
  notes: string;
}

export function ClientNotes({ notes }: ClientNotesProps) {
  if (!notes) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-3">Notas</h2>
      <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
        {notes}
      </div>
    </div>
  );
}
