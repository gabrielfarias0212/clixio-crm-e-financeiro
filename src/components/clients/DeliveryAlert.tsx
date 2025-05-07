
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface DeliveryAlertProps {
  showAlert: boolean;
  deliveredCount: number;
}

export function DeliveryAlert({ showAlert, deliveredCount }: DeliveryAlertProps) {
  if (!showAlert) return null;

  return (
    <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        Trabalho marcado como entregue com sucesso! Total de trabalhos entregues: {deliveredCount}.
      </AlertDescription>
    </Alert>
  );
}
