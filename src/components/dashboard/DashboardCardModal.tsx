
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "@/utils/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { formatDate } from "@/utils/clientUtils";

interface DashboardCardModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  clients: Client[];
  type: "leads" | "contracts" | "delivered" | "pending";
}

export function DashboardCardModal({ title, open, onClose, clients, type }: DashboardCardModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {clients.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    {client.weddingDate ? formatDate(new Date(client.weddingDate)) : "Não definida"}
                  </TableCell>
                  <TableCell>
                    <span className={client.status === "orçamento enviado" || client.status === "follow-up" ? "text-gray-400 italic" : "font-medium"}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.contractValue)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      <div>{client.email}</div>
                      <div className="mt-1">{client.phone}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum cliente encontrado para esta categoria.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
