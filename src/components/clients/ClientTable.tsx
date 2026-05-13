import React from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@/utils/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DeleteClientDialog } from "@/components/client-detail/DeleteClientDialog";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";

interface ClientTableProps {
  clients: Client[];
  sortBy: "name" | "date" | "value" | "status";
  setSortBy: (sort: "name" | "date" | "value" | "status") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

const C = {
  navy:    "#1E3A5F",
  text:    "#1a1a1a",
  textSub: "#9A9590",
  divider: "#F0EDE8",
  itemBg:  "#FAFAF8",
  danger:  "#E05252",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  // YYYY-MM-DD → DD/MM/YY
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1].slice(2)}`;
  return d;
};

export function ClientTable({ clients, sortBy, setSortBy, sortOrder, setSortOrder }: ClientTableProps) {
  const navigate = useNavigate();
  const { removeClient } = useClients();

  const handleDelete = async (clientId: string) => {
    try {
      const success = await removeClient(clientId);
      if (success) {
        toast.success("Cliente excluído com sucesso");
      } else {
        toast.error("Erro ao excluir cliente");
      }
    } catch {
      toast.error("Erro ao excluir cliente");
    }
  };

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return <ArrowUpDown style={{ width: 12, height: 12, color: C.textSub, marginLeft: 4 }} />;
    return sortOrder === "asc"
      ? <ArrowUp   style={{ width: 12, height: 12, color: C.navy, marginLeft: 4 }} />
      : <ArrowDown style={{ width: 12, height: 12, color: C.navy, marginLeft: 4 }} />;
  };

  const thBtn = (col: typeof sortBy, label: string) => (
    <button
      onClick={() => handleSort(col)}
      style={{
        display: "inline-flex", alignItems: "center",
        background: "none", border: "none", cursor: "pointer",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase" as const, color: sortBy === col ? C.navy : C.textSub,
        padding: 0,
      }}
    >
      {label}
      <SortIcon col={col} />
    </button>
  );

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
      overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
        <thead>
          <tr style={{ background: C.itemBg, borderBottom: `1px solid ${C.divider}` }}>
            <th style={{ padding: "12px 16px", textAlign: "left" as const }}>{thBtn("name", "Nome")}</th>
            <th style={{ padding: "12px 16px", textAlign: "left" as const }}>{thBtn("date", "Data")}</th>
            <th style={{ padding: "12px 16px", textAlign: "left" as const }}>{thBtn("value", "Valor")}</th>
            <th style={{ padding: "12px 16px", textAlign: "left" as const }}>{thBtn("status", "Status")}</th>
            <th style={{ padding: "12px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
              Contato
            </th>
            <th style={{ padding: "12px 16px", textAlign: "right" as const, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.textSub }}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, i) => (
            <tr
              key={client.id}
              style={{
                borderBottom: i < clients.length - 1 ? `1px solid ${C.divider}` : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = C.itemBg}
              onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}
            >
              {/* Name */}
              <td
                style={{ padding: "12px 16px", cursor: "pointer" }}
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    {client.name}
                  </span>
                  {client.status === "projeto_finalizado" && (
                    <CheckCircle style={{ width: 13, height: 13, color: "#52C97A", flexShrink: 0 }} />
                  )}
                </div>
                {client.coupleName && (
                  <div style={{ fontSize: 11, color: C.textSub, marginTop: 1 }}>
                    & {client.coupleName}
                  </div>
                )}
              </td>

              {/* Date */}
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: 12, color: C.textSub }}>
                  {formatDate(client.weddingDate)}
                </span>
              </td>

              {/* Value */}
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                  {fmt(client.contractValue)}
                </span>
              </td>

              {/* Status */}
              <td style={{ padding: "12px 16px" }}>
                <StatusBadge status={client.status} />
              </td>

              {/* Contact */}
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: 12, color: C.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 180, display: "block" }}>
                  {client.email || "—"}
                </span>
              </td>

              {/* Actions */}
              <td style={{ padding: "12px 16px", textAlign: "right" as const }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/clients/${client.id}/edit`); }}
                    style={{
                      width: 30, height: 30, borderRadius: 6,
                      border: `1px solid ${C.divider}`, background: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title="Editar"
                  >
                    <Edit style={{ width: 13, height: 13, color: C.textSub }} />
                  </button>
                  <DeleteClientDialog onDelete={() => handleDelete(client.id)}>
                    <button
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: 30, height: 30, borderRadius: 6,
                        border: `1px solid #FECDCD`, background: "#FEE8E8",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      title="Excluir"
                    >
                      <Trash2 style={{ width: 13, height: 13, color: C.danger }} />
                    </button>
                  </DeleteClientDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
