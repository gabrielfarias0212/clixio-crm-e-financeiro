
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useTransactionImporter } from "./useTransactionImporter";

interface TransactionImporterProps {
  onImportComplete?: () => void;
}

export function TransactionImporter({ onImportComplete }: TransactionImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    importing,
    summary,
    duplicateCount,
    importOption,
    showConfirmDialog,
    progress,
    mappedTransactions,
    setImportOption,
    setShowConfirmDialog,
    handleStartImport,
    startImport
  } = useTransactionImporter(data);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Formato de arquivo não suportado. Use XLSX ou CSV.');
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Dados extraídos da planilha:', jsonData);
      
      if (jsonData.length === 0) {
        toast.error('A planilha está vazia ou não contém dados válidos.');
        return;
      }

      setData(jsonData);
      setStep('preview');
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar o arquivo. Verifique o formato.');
    }
  };

  const handleImport = async () => {
    setStep('importing');
    await handleStartImport();
    
    // Aguardar conclusão da importação
    const checkCompletion = setInterval(() => {
      if (!importing && summary) {
        clearInterval(checkCompletion);
        setStep('complete');
        onImportComplete?.();
      }
    }, 1000);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Data': '01/01/2024',
        'Descrição': 'Exemplo de receita',
        'Valor': '1500,00',
        'Tipo': 'entrada',
        'Categoria': 'pagamento de cliente',
        'Cliente': 'João Silva'
      },
      {
        'Data': '02/01/2024',
        'Descrição': 'Exemplo de despesa',
        'Valor': '-200,50',
        'Tipo': 'saída',
        'Categoria': 'material',
        'Cliente': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_transacoes.xlsx");
  };

  const resetImporter = () => {
    setStep('upload');
    setFile(null);
    setData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar Transações
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar Transações via Planilha
            </DialogTitle>
          </DialogHeader>

          {step === 'upload' && (
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato esperado:</strong> A planilha deve conter as colunas: Data, Descrição, Valor.
                  Colunas opcionais: Tipo, Categoria, Cliente.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar Template de Exemplo
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-600" />
                  </div>
                  
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-medium">Selecione o arquivo</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Formatos suportados: XLSX, CSV
                      </p>
                    </Label>
                    <Input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Escolher Arquivo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Prévia dos Dados ({mappedTransactions.length} transações)
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetImporter}>
                    Voltar
                  </Button>
                  <Button onClick={handleImport} disabled={mappedTransactions.length === 0}>
                    Importar Transações
                  </Button>
                </div>
              </div>

              {mappedTransactions.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-medium">Prévia das Transações (primeiras 10)</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Data</th>
                          <th className="px-4 py-2 text-left font-medium">Descrição</th>
                          <th className="px-4 py-2 text-left font-medium">Valor</th>
                          <th className="px-4 py-2 text-left font-medium">Tipo</th>
                          <th className="px-4 py-2 text-left font-medium">Categoria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappedTransactions.slice(0, 10).map((transaction, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{transaction.date}</td>
                            <td className="px-4 py-2">{transaction.description}</td>
                            <td className="px-4 py-2">R$ {transaction.amount.toFixed(2)}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                transaction.type === 'entrada' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-2">{transaction.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhuma transação válida foi encontrada na planilha. 
                    Verifique se as colunas estão nomeadas corretamente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
                <h3 className="text-lg font-medium mb-2">Importando transações...</h3>
                <p className="text-gray-600">Por favor, aguarde enquanto processamos seus dados.</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          )}

          {step === 'complete' && summary && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Importação Concluída!</h3>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Importação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                      <div className="text-sm text-gray-600">Total processadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{summary.added}</div>
                      <div className="text-sm text-gray-600">Adicionadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{summary.skipped}</div>
                      <div className="text-sm text-gray-600">Ignoradas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                      <div className="text-sm text-gray-600">Erros</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button onClick={() => setIsOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      {showConfirmDialog && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicatas Encontradas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Foram encontradas {duplicateCount} transação(ões) que podem ser duplicatas.
                Como você gostaria de proceder?
              </p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="import-option"
                    value="skip"
                    checked={importOption === "skip"}
                    onChange={(e) => setImportOption(e.target.value as "skip" | "update")}
                  />
                  <span>Pular duplicatas</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="import-option"
                    value="update"
                    checked={importOption === "update"}
                    onChange={(e) => setImportOption(e.target.value as "skip" | "update")}
                  />
                  <span>Atualizar existentes</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={startImport}>
                  Continuar Importação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
