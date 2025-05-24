
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliveredWorkIndicatorProps {
  isDelivered: boolean;
  className?: string;
}

export function DeliveredWorkIndicator({ isDelivered, className }: DeliveredWorkIndicatorProps) {
  if (!isDelivered) return null;
  
  return (
    <div 
      className={cn(
        "absolute -top-2 -right-2 bg-emerald-100 rounded-full p-1 border border-emerald-200",
        className
      )}
      title="Trabalho Entregue"
    >
      <CheckCircle className="text-emerald-600 h-4 w-4" />
    </div>
  );
}
