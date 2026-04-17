import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle } from "lucide-react";
import { Client } from "@/utils/types";

interface ContractClosedDialogProps {
  open: boolean;
  client: Client;
  onConfirm: (entradaPaga: boolean, valorEntrada: number) => void;
  onCancel: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ContractClosedDialog({
  open,
  client,
  onConfirm,
  onCancel,
}: ContractClosedDialogProps) {
  const [entradaPaga, setEntradaPaga] = useState<"sim" | "nao">("sim");
  const [valorEntrada, setValorEntrada] = useState(
    String(client.downPayment > 0 ? client.downPayment : client.contractValue)
  );

  const valorNumerico = parseFloat(valorEntrada.replace(",", ".")) || 0;

  const handleConfirm = () => {
    onConfirm(entradaPaga === "sim", valorNumerico);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎉 Contrato fechado!
          </DialogTitle>
          <DialogDescription>
            A entrada do contrato de <strong>{client.name}</strong> foi recebida?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Valor da entrada */}
          <div className="space-y-2">
            <Label>Valor da entrada</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={valorEntrada}
                onChange={(e) => setValorEntrada(e.target.value)}
                className="pl-8"
              />
            </div>
            {client.contractValue > 0 && (
              <p className="text-xs text-muted-foreground">
                Valor total do contrato: {formatCurrency(client.contractValue)}
              </p>
            )}
          </div>

          {/* Já foi recebida? */}
          <div className="space-y-3">
            <Label>A entrada já foi recebida?</Label>
            <RadioGroup
              value={entradaPaga}
              onValueChange={(v) => setEntradaPaga(v as "sim" | "nao")}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 cursor-pointer">
                <RadioGroupItem value="sim" id="sim" />
                <label htmlFor="sim" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Sim — registrar {valorNumerico > 0 ? formatCurrency(valorNumerico) : "entrada"} no financeiro
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer">
                <RadioGroupItem value="nao" id="nao" />
                <label htmlFor="nao" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <XCircle className="h-4 w-4 text-gray-400" />
                  Não — fechar contrato sem registrar entrada agora
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
