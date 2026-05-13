import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Trash2, Upload, Download, Plus } from "lucide-react";
import { Client } from "@/utils/types";
import { ExportClientsDialog } from "./ExportClientsDialog";

interface ClientHeaderProps {
  clients: Client[];
  deliveredWorksCount: number;
  onClearData: () => void;
  clearingData: boolean;
}

const C = {
  navy:     "#1E3A5F",
  navyBg:   "#E8EEF6",
  danger:   "#E05252",
  dangerBg: "#FEE8E8",
  success:  "#52C97A",
  successBg:"#E6F9EE",
  text:     "#1a1a1a",
  textSub:  "#9A9590",
  divider:  "#F0EDE8",
  itemBg:   "#FAFAF8",
};

export function ClientHeader({
  clients,
  deliveredWorksCount,
  onClearData,
  clearingData,
}: ClientHeaderProps) {
  const navigate = useNavigate();
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <>
      <div style={{
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap" as const,
      }}>
        {/* Title */}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
            Clientes
          </h1>
          {deliveredWorksCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <CheckCircle style={{ width: 13, height: 13, color: C.success }} />
              <span style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>
                {deliveredWorksCount} {deliveredWorksCount === 1 ? "trabalho entregue" : "trabalhos entregues"}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
          {clients && clients.length > 0 && (
            <>
              <button
                onClick={onClearData}
                disabled={clearingData}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", borderRadius: 8,
                  border: `1px solid #FECDCD`, background: C.dangerBg,
                  fontSize: 12, fontWeight: 600, color: C.danger,
                  cursor: clearingData ? "not-allowed" : "pointer",
                  opacity: clearingData ? 0.6 : 1,
                }}
              >
                <Trash2 style={{ width: 13, height: 13 }} />
                {clearingData ? "Limpando..." : "Limpar Dados"}
              </button>

              <button
                onClick={() => setShowExportDialog(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", borderRadius: 8,
                  border: `1px solid ${C.divider}`, background: C.itemBg,
                  fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
                }}
              >
                <Download style={{ width: 13, height: 13 }} />
                Exportar
              </button>
            </>
          )}

          <button
            onClick={() => navigate("/clients/import")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${C.divider}`, background: C.itemBg,
              fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer",
            }}
          >
            <Upload style={{ width: 13, height: 13 }} />
            Importar
          </button>

          <button
            onClick={() => navigate("/clients/add")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 16px", borderRadius: 8,
              border: "none", background: C.navy,
              fontSize: 12, fontWeight: 700, color: "#FFFFFF", cursor: "pointer",
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Adicionar Cliente
          </button>
        </div>
      </div>

      <ExportClientsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        clients={clients}
      />
    </>
  );
}
