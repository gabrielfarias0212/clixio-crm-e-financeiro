
import { Badge } from "@/components/ui/badge";

interface FormStatusBadgeProps {
  status: string;
}

export function FormStatusBadge({ status }: FormStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Preenchido</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
}
