
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClientImporter } from "@/components/ClientImporter";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { parseBrazilianDate } from "@/utils/dateUtils";

export default function ImportClients() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  
  // Set page title
  useState(() => {
    document.title = "Importar Clientes | Wedding CRM";
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    
    try {
      const file = e.target.files?.[0];
      if (!file) {
        setIsLoading(false);
        return;
      }
      
      setFileName(file.name);
      
      // Read the file
      const data = await readFile(file);
      if (!data) {
        toast.error("Erro ao ler o arquivo. Verifique o formato.");
        setIsLoading(false);
        return;
      }
      
      // Validate required columns
      const requiredColumns = ["Nome", "Telefone", "E-mail"];
      const headers = Object.keys(data[0] || {});
      
      const missingColumns = requiredColumns.filter(
        col => !headers.some(header => header.toLowerCase() === col.toLowerCase())
      );
      
      if (missingColumns.length > 0) {
        toast.error(`Colunas obrigatórias ausentes: ${missingColumns.join(", ")}`);
        setIsLoading(false);
        return;
      }
      
      // Process date fields - recognize both Brazilian format and Excel serial numbers
      const processedData = data.map(row => {
        const processedRow = { ...row };
        
        // Look for date fields with different possible names
        const dateFieldNames = [
          "Data do Evento", 
          "data do evento", 
          "Data", 
          "data"
        ];
        
        // Find the date field that exists in this row
        const dateFieldName = dateFieldNames.find(field => field in row);
        
        if (dateFieldName && row[dateFieldName]) {
          // Parse the date value - handles Brazilian format, Excel serial numbers, and other formats
          const parsedDate = parseBrazilianDate(row[dateFieldName]);
          if (parsedDate) {
            processedRow[dateFieldName] = parsedDate;
          }
        }
        
        return processedRow;
      });
      
      setFileData(processedData);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Erro ao processar arquivo");
    } finally {
      setIsLoading(false);
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Use raw: false to handle dates correctly
          const json = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          
          // Handle Excel date serial numbers
          const processedJson = json.map(row => {
            const processedRow = { ...row };
            Object.keys(row).forEach(key => {
              if (typeof row[key] === 'number' && key.toLowerCase().includes('data')) {
                // Let the parseBrazilianDate function handle the conversion
                processedRow[key] = row[key];
              }
            });
            return processedRow;
          });
          
          resolve(processedJson);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        "Nome": "Nome do Cliente",
        "Telefone": "(00) 00000-0000",
        "E-mail": "email@exemplo.com",
        "Categoria do evento": "Casamento",
        "Data do Evento": "01/01/2023",
        "Valor do contrato": "2000",
        "Status do Contrato": "orçamento enviado"
      }
    ];
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Generate file and download
    XLSX.writeFile(wb, "template_importacao_clientes.xlsx");
  };

  const resetImport = () => {
    setFileData(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Importar Clientes</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate("/clients")}
            >
              Voltar para Clientes
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          {!fileData ? (
            <>
              <div className="text-center py-10">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione um arquivo para importar</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Importe clientes de uma planilha Excel (.xlsx) ou CSV (.csv). 
                  A planilha deve conter pelo menos as colunas: Nome, Telefone e E-mail.
                </p>
                
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                
                <Button 
                  onClick={handleClickUpload}
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                  {isLoading ? "Processando..." : "Selecionar Arquivo"}
                </Button>
              </div>
              
              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <AlertDescription>
                  <p className="text-blue-700">
                    <strong>Dica:</strong> Baixe o modelo de planilha para garantir que os dados sejam importados corretamente.
                  </p>
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <ClientImporter 
              data={fileData} 
              fileName={fileName} 
              onReset={resetImport}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
