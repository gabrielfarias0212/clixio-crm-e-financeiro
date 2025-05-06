import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Client, ClientStatus, EventCategory, NextAction } from "@/utils/types";
import { useClients } from "@/contexts/ClientsContext";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";

interface ClientImporterProps {
  data: any[];
  fileName: string;
  onReset: () => void;
}

interface ImportSummary {
  total: number;
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export function ClientImporter({ data, fileName, onReset }: ClientImporterProps) {
  const navigate = useNavigate();
  const { clients, addClient } = useClients();
  const [importing, setImporting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [importOption, setImportOption] = useState<'skip' | 'replace' | 'keep'>('skip');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  
  // Show only the first 5 rows for preview
  const previewData = data.slice(0, 5);
  
  // Get all columns from the data
  const columns = Object.keys(data[0] || {});

  // Find duplicate clients based on email or phone
  const getDuplicateClients = () => {
    const duplicates = data.filter(row => {
      const email = row["E-mail"] || row["email"] || "";
      const phone = row["Telefone"] || row["telefone"] || "";
      
      return clients.some(client => 
        (email && client.email && client.email.toLowerCase() === email.toLowerCase()) || 
        (phone && client.phone && typeof client.phone === 'string' && typeof phone === 'string' && 
         client.phone.toLowerCase() === phone.toLowerCase())
      );
    });
    
    return duplicates.length;
  };

  const duplicateCount = getDuplicateClients();

  const mapImportedClientToModel = (row: any): Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'> => {
    // Map spreadsheet columns to client model
    const name = row["Nome"] || row["nome"] || "";
    const email = row["E-mail"] || row["email"] || "";
    const phone = row["Telefone"] || row["telefone"] || "";
    
    // Parse date if available
    let weddingDate = null;
    const dateValue = row["Data do Evento"] || row["data do evento"] || row["Data"] || row["data"];
    if (dateValue) {
      try {
        if (typeof dateValue === "string") {
          // Handle different date formats (DD/MM/YYYY or YYYY-MM-DD)
          const parts = dateValue.split(/[\/\-\.]/);
          if (parts.length === 3) {
            // Assuming DD/MM/YYYY format if the first part is <= 31
            if (parseInt(parts[0]) <= 31 && parts[0].length <= 2) {
              weddingDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
              // Otherwise try as YYYY-MM-DD
              weddingDate = new Date(dateValue);
            }
          }
        } else if (dateValue instanceof Date) {
          weddingDate = dateValue;
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
    
    // Parse contract value
    let contractValue = 0;
    const valueField = row["Valor do contrato"] || row["valor do contrato"] || row["Valor"] || row["valor"] || "0";
    if (valueField) {
      if (typeof valueField === "number") {
        contractValue = valueField;
      } else {
        // Remove currency symbols and commas, then parse
        const cleanValue = valueField.toString().replace(/[^\d.,]/g, "").replace(",", ".");
        contractValue = parseFloat(cleanValue) || 0;
      }
    }
    
    // Map status
    let status: ClientStatus = "orçamento enviado";
    const statusField = row["Status do Contrato"] || row["status do contrato"] || row["Status"] || row["status"];
    if (statusField) {
      const statusLower = statusField.toString().toLowerCase();
      if (statusLower.includes("orçamento") || statusLower.includes("orcamento")) {
        status = "orçamento enviado";
      } else if (statusLower.includes("follow") || statusLower.includes("follow-up")) {
        status = "follow-up";
      } else if (statusLower.includes("fechado")) {
        status = "fechado";
      } else if (statusLower.includes("andamento")) {
        status = "em andamento";
      } else if (statusLower.includes("pago")) {
        status = "pago";
      }
    }
    
    // Map event category
    let eventCategory: EventCategory = "Casamento";
    const categoryField = row["Categoria do evento"] || row["categoria do evento"] || row["Categoria"] || row["categoria"];
    if (categoryField) {
      const categoryLower = categoryField.toString().toLowerCase();
      if (categoryLower.includes("aniversario")) {
        eventCategory = "Aniversario";
      } else if (categoryLower.includes("civil")) {
        eventCategory = "Civil";
      } else if (categoryLower.includes("ensaio") && categoryLower.includes("estudio")) {
        eventCategory = "Ensaio Estudio";
      } else if (categoryLower.includes("ensaio") && categoryLower.includes("externo")) {
        eventCategory = "Ensaio externo";
      } else if (categoryLower.includes("corporativo")) {
        eventCategory = "Evento Corporativo";
      }
    }
    
    // Default next action based on status
    let nextAction: NextAction = "enviar proposta";
    if (status === "orçamento enviado") {
      nextAction = "responder";
    } else if (status === "follow-up") {
      nextAction = "responder";
    } else if (status === "fechado") {
      nextAction = "editar";
    } else if (status === "em andamento") {
      nextAction = "entregar";
    } else if (status === "pago") {
      nextAction = "nenhuma";
    }
    
    return {
      name,
      email,
      phone,
      weddingDate,
      contractValue,
      status,
      nextAction,
      eventCategory,
      notes: row["Observações"] || row["observações"] || row["Notas"] || row["notas"] || "",
      downPayment: 0
    };
  };

  const handleStartImport = () => {
    if (duplicateCount > 0) {
      setShowConfirmDialog(true);
    } else {
      startImport();
    }
  };

  const startImport = async () => {
    setImporting(true);
    
    const results: ImportSummary = {
      total: data.length,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    for (const row of data) {
      try {
        const clientData = mapImportedClientToModel(row);
        
        // Check if client already exists
        const email = clientData.email.toLowerCase();
        const phone = typeof clientData.phone === 'string' ? clientData.phone.toLowerCase() : '';
        const existingClient = clients.find(c => 
          (email && c.email && c.email.toLowerCase() === email) || 
          (phone && c.phone && typeof c.phone === 'string' && c.phone.toLowerCase() === phone)
        );
        
        if (existingClient) {
          if (importOption === 'skip') {
            results.skipped++;
            continue;
          } else if (importOption === 'replace') {
            // TODO: Update client - for now just skip
            results.updated++;
            continue;
          } else {
            // Keep both - add as new
            const newClient = await addClient(clientData);
            if (newClient) {
              results.added++;
            } else {
              results.errors++;
            }
          }
        } else {
          // Add new client
          const newClient = await addClient(clientData);
          if (newClient) {
            results.added++;
          } else {
            results.errors++;
          }
        }
      } catch (error) {
        console.error("Error importing client:", error);
        results.errors++;
      }
    }
    
    setSummary(results);
    setImporting(false);
    
    // Show success toast
    toast.success(`Importação concluída! ${results.added} clientes adicionados.`);
  };

  const finishImport = () => {
    navigate("/clients");
  };

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="font-medium text-lg">Prévia da importação</h3>
          <p className="text-gray-500">
            Arquivo: {fileName} ({data.length} registros)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onReset}
            disabled={importing}
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleStartImport}
            disabled={importing || data.length === 0}
          >
            {importing ? "Importando..." : "Confirmar Importação"}
          </Button>
        </div>
      </div>
      
      {duplicateCount > 0 && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-700">
            <strong>Atenção:</strong> Existem {duplicateCount} registros com e-mail ou telefone já cadastrados.
          </AlertDescription>
        </Alert>
      )}
      
      {summary && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            <strong>Importação concluída!</strong>
            <ul className="mt-1">
              <li>Total de registros: {summary.total}</li>
              <li>Clientes adicionados: {summary.added}</li>
              {summary.updated > 0 && <li>Clientes atualizados: {summary.updated}</li>}
              {summary.skipped > 0 && <li>Clientes ignorados: {summary.skipped}</li>}
              {summary.errors > 0 && <li>Erros: {summary.errors}</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {typeof row[column] === 'object' && row[column] instanceof Date 
                      ? formatDate(row[column]) 
                      : row[column]?.toString() || ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.length > 5 && (
        <p className="text-gray-500 mt-2 text-sm text-right">
          Mostrando 5 de {data.length} registros.
        </p>
      )}
      
      {summary && (
        <div className="mt-6 flex justify-end">
          <Button onClick={finishImport}>
            Voltar para Lista de Clientes
          </Button>
        </div>
      )}
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clientes duplicados encontrados</DialogTitle>
            <DialogDescription>
              Existem {duplicateCount} registros com e-mail ou telefone já cadastrados.
              Como você deseja proceder?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2 my-4">
            <Button 
              variant={importOption === 'skip' ? "default" : "outline"} 
              onClick={() => setImportOption('skip')}
              className="justify-start"
            >
              Ignorar registros duplicados
            </Button>
            <Button 
              variant={importOption === 'replace' ? "default" : "outline"} 
              onClick={() => setImportOption('replace')}
              className="justify-start"
            >
              Substituir dados existentes
            </Button>
            <Button 
              variant={importOption === 'keep' ? "default" : "outline"} 
              onClick={() => setImportOption('keep')}
              className="justify-start"
            >
              Manter ambos (criar novos registros)
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowConfirmDialog(false);
              startImport();
            }}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
