import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, UserCheck } from "lucide-react";
import { Client } from "@/utils/types";

interface ContractClosedDialogProps {
  open: boolean;
  client: Client;
  onConfirm: (data: ContractClosedFormData) => void;
  onLater: () => void;
  onCancel: () => void;
}

export interface ContractClosedFormData {
  // Dados já existentes (pré-preenchidos)
  name: string;
  coupleName: string;
  email: string;
  phone: string;
  eventCategory: string;
  weddingDate: string | null;
  weddingStartTime: string;
  weddingEndTime: string;
  // Dados novos que precisam ser preenchidos
  contractValue: number;
  downPayment: number;
  eventLocation: string;
  contractLink: string;
  notes: string;
  // Financeiro
  entradaPaga: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ContractClosedDialog({
  open,
  client,
  onConfirm,
  onLater,
  onCancel,
}: ContractClosedDialogProps) {
  const [form, setForm] = useState<ContractClosedFormData>({
    name: "",
    coupleName: "",
    email: "",
    phone: "",
    eventCategory: "Casamento",
    weddingDate: null,
    weddingStartTime: "",
    weddingEndTime: "",
    contractValue: 0,
    downPayment: 0,
    eventLocation: "",
    contractLink: "",
    notes: "",
    entradaPaga: true,
  });

  // Pré-preencher com dados do lead ao abrir
  useEffect(() => {
    if (open && client) {
      setForm({
        name: client.name || "",
        coupleName: client.coupleName || "",
        email: client.email || "",
        phone: client.phone || "",
        eventCategory: client.eventCategory || "Casamento",
        weddingDate: client.weddingDate || null,
        weddingStartTime: client.weddingStartTime || "",
        weddingEndTime: client.weddingEndTime || "",
        contractValue: client.contractValue || 0,
        downPayment: client.downPayment || 0,
        eventLocation: client.eventLocation || "",
        contractLink: client.contractLink || "",
        notes: client.notes || "",
        entradaPaga: true,
      });
    }
  }, [open, client]);

  const set = (field: keyof ContractClosedFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleNumberInput = (field: keyof ContractClosedFormData, value: string) => {
    const num = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
    set(field, num);
  };

  const isValid = form.name.trim().length >= 2 && form.contractValue > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            🎉 Contrato Fechado — Cadastrar Cliente
          </DialogTitle>
          <DialogDescription>
            Complete as informações para cadastrar <strong>{client.name}</strong> como cliente.
            Os dados do lead já foram preenchidos automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* Dados de Contato */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nome do Responsável *</Label>
                <Input
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-1">
                <Label>Nome do Casal</Label>
                <Input
                  value={form.coupleName}
                  onChange={e => set("coupleName", e.target.value)}
                  placeholder="Ex: João e Maria"
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  placeholder="(67) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Dados do Evento */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Dados do Evento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Categoria</Label>
                <CategorySelect value={form.eventCategory} onChange={v => set("eventCategory", v)} />
              </div>
              <div className="space-y-1">
                <Label>Data do Evento</Label>
                <Input
                  type="date"
                  value={form.weddingDate || ""}
                  onChange={e => set("weddingDate", e.target.value || null)}
                />
              </div>
              <div className="space-y-1">
                <Label>Horário Início</Label>
                <Input
                  type="time"
                  value={form.weddingStartTime}
                  onChange={e => set("weddingStartTime", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Horário Término</Label>
                <Input
                  type="time"
                  value={form.weddingEndTime}
                  onChange={e => set("weddingEndTime", e.target.value)}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Local do Evento</Label>
                <Input
                  value={form.eventLocation}
                  onChange={e => set("eventLocation", e.target.value)}
                  placeholder="Igreja, salão, chácara..."
                />
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Valor do Contrato *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.contractValue || ""}
                    onChange={e => handleNumberInput("contractValue", e.target.value)}
                    className="pl-8"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Valor da Entrada</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.downPayment || ""}
                    onChange={e => handleNumberInput("downPayment", e.target.value)}
                    className="pl-8"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Entrada paga? */}
            {form.downPayment > 0 && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => set("entradaPaga", true)}
                  className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    form.entradaPaga
                      ? "bg-green-50 border-green-300 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  ✅ Entrada já recebida ({formatCurrency(form.downPayment)})
                </button>
                <button
                  type="button"
                  onClick={() => set("entradaPaga", false)}
                  className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    !form.entradaPaga
                      ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  ⏳ Entrada ainda não recebida
                </button>
              </div>
            )}
          </div>

          {/* Extras */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Extras
            </h3>
            <div className="space-y-1">
              <Label>Link do Contrato</Label>
              <Input
                value={form.contractLink}
                onChange={e => set("contractLink", e.target.value)}
                placeholder="Google Drive, Docusign..."
              />
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Informações adicionais..."
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel} className="sm:mr-auto">
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={onLater}
            className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            <Clock className="h-4 w-4" />
            Deixar para depois
          </Button>
          <Button
            onClick={() => onConfirm(form)}
            disabled={!isValid}
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Cadastrar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
