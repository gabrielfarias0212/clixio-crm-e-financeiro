
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { ClientImporter } from "@/components/ClientImporter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ChevronLeft, FileSpreadsheet, Upload } from "lucide-react";
import { generateExampleData } from "@/components/client-importer/utils/exampleData";
import * as XLSX from 'xlsx';

export default function ImportClients() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Importar Clientes | Wedding CRM";
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const files = e.target.files;
    if (!files || files.length === 0) {
      setFile(null);
      return;
    }
    
    const selectedFile = files[0];
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
      setError('Formato de arquivo inválido. Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    parseExcel(selectedFile);
  };

  const parseExcel = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
      
      if (jsonData.length === 0) {
        setError('A planilha está vazia ou não contém dados válidos.');
        setParsedData([]);
        return;
      }
      
      setParsedData(jsonData as any[]);
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      setError('Erro ao analisar o arquivo. Verifique se o formato é válido.');
      setParsedData([]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    // Resetar o input de arquivo
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const downloadExampleFile = () => {
    const exampleData = generateExampleData();
    
    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    
    // Ajustar largura das colunas
    const cols = [
      { wch: 20 }, // Nome do Cliente
      { wch: 20 }, // Nome do Casal
      { wch: 25 }, // Email
      { wch: 15 }, // Telefone
      { wch: 15 }, // Data do Evento
      { wch: 15 }, // Valor do Contrato
      { wch: 15 }, // Valor da Entrada
      { wch: 15 }, // Status
      { wch: 15 }, // Próxima Ação
      { wch: 20 }, // Categoria do Evento
      { wch: 30 }, // Notas
    ];
    
    worksheet['!cols'] = cols;
    
    XLSX.writeFile(workbook, 'modelo_importacao_clientes.xlsx');
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/clients"
            className="text-gray-600 hover:text-gray-900 inline-flex items-center mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Clientes
          </Link>
          <h1 className="text-2xl font-bold">Importar Clientes</h1>
        </div>
        
        {!file ? (
          <div className="bg-white rounded-md border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Instruções</h2>
              <p className="text-gray-600 mb-4">
                Você pode importar seus clientes a partir de uma planilha Excel (.xlsx, .xls) ou CSV (.csv).
                Para facilitar, baixe nosso modelo de importação e preencha com seus dados.
              </p>
              
              <Button 
                variant="outline" 
                onClick={downloadExampleFile}
                className="flex items-center gap-2"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Baixar Modelo de Importação
              </Button>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">Selecione seu arquivo</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Arraste e solte seu arquivo aqui ou clique para selecionar
                </p>
                
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="mx-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
                
                {error && (
                  <div className="mt-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md border p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-1">
                Arquivo selecionado: {file.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {parsedData.length} registros encontrados
              </p>
            </div>
            
            <ClientImporter 
              data={parsedData} 
              fileName={file.name}
              onReset={handleReset}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
