import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, Upload, Download } from "lucide-react";
import { Client } from "@/utils/types";
import { ExportClientsDialog } from "./ExportClientsDialog";

interface ClientHeaderProps {
  clients: Client[];
  deliveredWorksCount: number;
  onClearData: () => void;
  clearingData: boolean;
}

export function ClientHeader({ 
  clients, 
  deliveredWorksCount, 
  onClearData, 
  clearingData 
}: ClientHeaderProps) {
  const navigate = useNavigate();
  const [showExportDialog, setShowExportDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          {deliveredWorksCount > 0 && (
            <div className="flex items-center gap-1 mt-1 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>
                {deliveredWorksCount} {deliveredWorksCount === 1 ? 'trabalho entregue' : 'trabalhos entregues'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {clients && clients.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={onClearData}
                disabled={clearingData}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {clearingData ? "Limpando..." : "Limpar Dados"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </>
          )}
          <Button 
            variant="outline"
            onClick={() => navigate("/clients/import")}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button 
            onClick={() => navigate("/clients/add")}
          >
            Adicionar Cliente
          </Button>
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
